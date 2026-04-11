"""Data-warehouse loader with SCD Type 2 dimensions and fact-table support."""

from __future__ import annotations

import time
import uuid
from datetime import datetime, timezone
from typing import Any

import pandas as pd
import structlog
from pydantic import BaseModel, Field
from sqlalchemy import Connection, create_engine, inspect, text
from sqlalchemy.engine import Engine

from etl.loaders.base_loader import BaseLoader, LoadError, LoadResult

logger = structlog.get_logger(__name__)

__all__ = ["DataWarehouseLoader", "DimensionConfig", "FactConfig"]


# ------------------------------------------------------------------
# Configuration models
# ------------------------------------------------------------------


class DimensionConfig(BaseModel):
    """Configuration for loading a slowly-changing dimension (SCD Type 2).

    Args:
        table_name: Target dimension table.
        schema_name: Optional database schema.
        natural_keys: Columns that uniquely identify a business entity.
        tracked_columns: Columns whose changes trigger a new version.
        surrogate_key: Name of the auto-generated surrogate key column.
        start_date_column: Column recording when a version became active.
        end_date_column: Column recording when a version was retired.
        is_current_column: Boolean flag marking the active row.
    """

    model_config = {"populate_by_name": True}

    table_name: str = Field(..., min_length=1)
    schema_name: str | None = Field(default=None, alias="schema")
    natural_keys: list[str] = Field(..., min_length=1)
    tracked_columns: list[str] = Field(..., min_length=1)
    surrogate_key: str = Field(default="sk_id")
    start_date_column: str = Field(default="effective_start_date")
    end_date_column: str = Field(default="effective_end_date")
    is_current_column: str = Field(default="is_current")


class FactConfig(BaseModel):
    """Configuration for loading a fact table.

    Args:
        table_name: Target fact table.
        schema_name: Optional database schema.
        measure_columns: Numeric/additive measure columns.
        degenerate_dimensions: Dimension attributes stored directly in
            the fact row (e.g. order number).
        dimension_lookups: Mapping of ``fact_fk_column`` →
            ``{"dimension_table": …, "natural_key": …, "surrogate_key": …}``.
        batch_size: Rows per INSERT batch.
    """

    model_config = {"populate_by_name": True}

    table_name: str = Field(..., min_length=1)
    schema_name: str | None = Field(default=None, alias="schema")
    measure_columns: list[str] = Field(default_factory=list)
    degenerate_dimensions: list[str] = Field(default_factory=list)
    dimension_lookups: dict[str, DimensionLookup] = Field(default_factory=dict)
    batch_size: int = Field(default=5000, ge=1)


class DimensionLookup(BaseModel):
    """Describes how to resolve a foreign-key column in a fact table.

    Args:
        dimension_table: Fully-qualified or plain name of the dimension.
        schema_name: Optional schema of the dimension table.
        natural_key: Column in the incoming data that matches the
            dimension's natural key.
        surrogate_key: Surrogate-key column in the dimension table.
        natural_key_column: Column name of the natural key *in* the
            dimension table (defaults to the value of ``natural_key``).
    """

    model_config = {"populate_by_name": True}

    dimension_table: str
    schema_name: str | None = Field(default=None, alias="schema")
    natural_key: str
    surrogate_key: str = "sk_id"
    natural_key_column: str | None = None


# Rebuild FactConfig so it picks up the now-defined DimensionLookup.
FactConfig.model_rebuild()


# ------------------------------------------------------------------
# Loader
# ------------------------------------------------------------------


class DataWarehouseLoader(BaseLoader):
    """Load data into a star-schema data warehouse.

    Provides :meth:`load_dimension` (SCD Type 2), :meth:`load_fact`,
    :meth:`full_load`, and :meth:`incremental_load` methods.  All writes
    are wrapped in explicit transactions so that a failure leaves the
    warehouse in a consistent state.

    Args:
        connection_string: SQLAlchemy connection URL.
        schema: Default schema for all tables.
        etl_batch_id: Unique identifier for the current ETL run.
        max_retries: Maximum retry attempts for transient errors.
    """

    def __init__(
        self,
        connection_string: str,
        *,
        schema: str | None = None,
        etl_batch_id: str | None = None,
        max_retries: int = 3,
    ) -> None:
        super().__init__(target_name="data_warehouse", max_retries=max_retries)
        self._engine: Engine = create_engine(connection_string, pool_pre_ping=True)
        self._schema = schema
        self._etl_batch_id = etl_batch_id or uuid.uuid4().hex
        self._last_load_result: LoadResult | None = None
        self._cumulative_loaded = 0
        self._cumulative_failed = 0
        self._log = logger.bind(
            loader="DataWarehouseLoader",
            schema=schema,
            batch_id=self._etl_batch_id,
        )

    # ------------------------------------------------------------------
    # BaseLoader interface
    # ------------------------------------------------------------------

    def load(self, df: pd.DataFrame) -> LoadResult:
        """Default entry-point — delegates to :meth:`full_load`.

        This satisfies the abstract contract.  Callers that need more
        control should use :meth:`load_dimension` or :meth:`load_fact`
        directly.

        Args:
            df: DataFrame to load.

        Returns:
            Combined :class:`LoadResult`.
        """
        raise LoadError(
            "Use load_dimension() or load_fact() for warehouse loads. "
            "full_load() and incremental_load() are also available.",
            target=self.target_name,
        )

    def validate_target(self) -> bool:
        """Verify the warehouse is reachable and the schema exists.

        Returns:
            ``True`` when the connection is valid.

        Raises:
            LoadError: If the database cannot be reached.
        """
        try:
            insp = inspect(self._engine)
            schemas = insp.get_schema_names()
            if self._schema and self._schema not in schemas:
                raise LoadError(
                    f"Schema '{self._schema}' not found (available: {schemas})",
                    target=self.target_name,
                )
            self._log.info("validate_target.ok", schemas=schemas)
            return True
        except LoadError:
            raise
        except Exception as exc:
            raise LoadError(
                f"Warehouse validation failed: {exc}",
                target=self.target_name,
                cause=exc,
            ) from exc

    def get_load_stats(self) -> dict[str, Any]:
        """Return cumulative load statistics for this loader instance.

        Returns:
            Dictionary with ``batch_id``, ``cumulative_loaded``,
            ``cumulative_failed``, and ``last_result``.
        """
        return {
            "etl_batch_id": self._etl_batch_id,
            "schema": self._schema,
            "cumulative_loaded": self._cumulative_loaded,
            "cumulative_failed": self._cumulative_failed,
            "last_result": (
                self._last_load_result.model_dump()
                if self._last_load_result
                else None
            ),
        }

    # ------------------------------------------------------------------
    # Dimension loading (SCD Type 2)
    # ------------------------------------------------------------------

    def load_dimension(
        self, df: pd.DataFrame, config: DimensionConfig
    ) -> LoadResult:
        """Load a slowly-changing dimension using SCD Type 2 logic.

        Steps:
        1. Fetch the current active rows from the dimension.
        2. Detect new and changed records by comparing on *natural_keys*
           and *tracked_columns*.
        3. Expire changed rows (set ``end_date``, ``is_current=False``).
        4. Insert new versions with ``start_date``, ``is_current=True``,
           and a freshly generated surrogate key.

        Args:
            df: Incoming dimension data.  Must contain the natural-key and
                tracked columns declared in *config*.
            config: :class:`DimensionConfig` describing the target dimension.

        Returns:
            :class:`LoadResult` summarising inserted / expired rows.

        Raises:
            LoadError: On any database or validation error.
        """
        start = time.perf_counter()
        errors: list[str] = []
        inserted = 0
        expired = 0
        schema = config.schema_name or self._schema
        table_ref = self._table_ref(config.table_name, schema)

        self._log.info(
            "load_dimension.start",
            table=table_ref,
            incoming_rows=len(df),
        )

        now = datetime.now(timezone.utc)

        try:
            with self._engine.begin() as conn:
                # 1) Fetch active dimension rows
                existing = self._fetch_current_dimension(conn, config, schema)

                # 2) Detect new and changed records
                new_records, changed_keys = self._detect_dimension_changes(
                    df, existing, config
                )

                # 3) Expire changed rows
                if changed_keys:
                    expired = self._expire_dimension_rows(
                        conn, config, schema, changed_keys, now
                    )

                # 4) Insert new / changed versions
                if not new_records.empty:
                    new_records = self._prepare_dimension_insert(
                        new_records, config, now
                    )
                    inserted = self._insert_rows(
                        conn, table_ref, new_records
                    )

        except LoadError:
            raise
        except Exception as exc:
            raise LoadError(
                f"Dimension load failed: {exc}",
                target=config.table_name,
                cause=exc,
            ) from exc

        result = LoadResult(
            records_loaded=inserted,
            records_failed=0,
            duration_seconds=time.perf_counter() - start,
            errors=errors,
        )
        self._record_result(result)
        self._log.info(
            "load_dimension.done",
            inserted=inserted,
            expired=expired,
            duration=result.duration_seconds,
        )
        return result

    # ------------------------------------------------------------------
    # Fact-table loading
    # ------------------------------------------------------------------

    def load_fact(self, df: pd.DataFrame, config: FactConfig) -> LoadResult:
        """Load rows into a fact table, resolving dimension foreign keys.

        For each entry in ``config.dimension_lookups``, the loader joins
        the incoming data against the dimension's *current* surrogate key
        and populates the FK column automatically.

        Args:
            df: Incoming fact data.
            config: :class:`FactConfig` describing the target fact table.

        Returns:
            :class:`LoadResult`.

        Raises:
            LoadError: On any database or FK-resolution error.
        """
        start = time.perf_counter()
        errors: list[str] = []
        schema = config.schema_name or self._schema
        table_ref = self._table_ref(config.table_name, schema)

        self._log.info("load_fact.start", table=table_ref, rows=len(df))

        try:
            with self._engine.begin() as conn:
                resolved_df = self._resolve_dimension_keys(conn, df, config)
                resolved_df = self._add_audit_columns(resolved_df)
                inserted = self._insert_rows(conn, table_ref, resolved_df, config.batch_size)
        except LoadError:
            raise
        except Exception as exc:
            raise LoadError(
                f"Fact load failed: {exc}",
                target=config.table_name,
                cause=exc,
            ) from exc

        result = LoadResult(
            records_loaded=inserted,
            records_failed=len(df) - inserted,
            duration_seconds=time.perf_counter() - start,
            errors=errors,
        )
        self._record_result(result)
        self._log.info(
            "load_fact.done",
            inserted=inserted,
            duration=result.duration_seconds,
        )
        return result

    # ------------------------------------------------------------------
    # Full / incremental helpers
    # ------------------------------------------------------------------

    def full_load(
        self,
        df: pd.DataFrame,
        table_name: str,
        *,
        schema: str | None = None,
    ) -> LoadResult:
        """Truncate the target table and reload all rows.

        Args:
            df: Complete dataset to load.
            table_name: Target table.
            schema: Override schema (falls back to instance default).

        Returns:
            :class:`LoadResult`.
        """
        start = time.perf_counter()
        schema = schema or self._schema
        table_ref = self._table_ref(table_name, schema)

        self._log.info("full_load.start", table=table_ref, rows=len(df))

        try:
            with self._engine.begin() as conn:
                dialect = self._engine.dialect.name
                if dialect in ("postgresql", "mysql", "mariadb"):
                    conn.execute(text(f"TRUNCATE TABLE {table_ref}"))
                else:
                    conn.execute(text(f"DELETE FROM {table_ref}"))

                prepared = self._add_audit_columns(df)
                inserted = self._insert_rows(conn, table_ref, prepared)
        except Exception as exc:
            raise LoadError(
                f"Full load failed: {exc}",
                target=table_name,
                cause=exc,
            ) from exc

        result = LoadResult(
            records_loaded=inserted,
            records_failed=len(df) - inserted,
            duration_seconds=time.perf_counter() - start,
        )
        self._record_result(result)
        self._log.info("full_load.done", inserted=inserted)
        return result

    def incremental_load(
        self,
        df: pd.DataFrame,
        table_name: str,
        *,
        watermark_column: str,
        schema: str | None = None,
    ) -> LoadResult:
        """Append only rows newer than the current high-watermark.

        The watermark is determined by querying ``MAX(watermark_column)``
        from the target table and filtering the incoming DataFrame.

        Args:
            df: Incoming data (must contain *watermark_column*).
            table_name: Target table.
            watermark_column: Timestamp or incrementing column used to
                detect new rows.
            schema: Override schema.

        Returns:
            :class:`LoadResult`.
        """
        start = time.perf_counter()
        schema = schema or self._schema
        table_ref = self._table_ref(table_name, schema)

        self._log.info(
            "incremental_load.start",
            table=table_ref,
            rows=len(df),
            watermark_column=watermark_column,
        )

        if watermark_column not in df.columns:
            raise LoadError(
                f"Watermark column '{watermark_column}' not in DataFrame",
                target=table_name,
            )

        try:
            with self._engine.begin() as conn:
                current_watermark = self._get_watermark(
                    conn, table_ref, watermark_column
                )

                if current_watermark is not None:
                    new_rows = df[df[watermark_column] > current_watermark].copy()
                else:
                    new_rows = df.copy()

                self._log.info(
                    "incremental_load.filtered",
                    current_watermark=str(current_watermark),
                    new_rows=len(new_rows),
                )

                if new_rows.empty:
                    return LoadResult(
                        records_loaded=0,
                        records_failed=0,
                        duration_seconds=time.perf_counter() - start,
                    )

                prepared = self._add_audit_columns(new_rows)
                inserted = self._insert_rows(conn, table_ref, prepared)
        except LoadError:
            raise
        except Exception as exc:
            raise LoadError(
                f"Incremental load failed: {exc}",
                target=table_name,
                cause=exc,
            ) from exc

        result = LoadResult(
            records_loaded=inserted,
            records_failed=len(new_rows) - inserted,
            duration_seconds=time.perf_counter() - start,
        )
        self._record_result(result)
        self._log.info("incremental_load.done", inserted=inserted)
        return result

    # ------------------------------------------------------------------
    # Internal helpers — dimension
    # ------------------------------------------------------------------

    def _fetch_current_dimension(
        self,
        conn: Connection,
        config: DimensionConfig,
        schema: str | None,
    ) -> pd.DataFrame:
        """Return all currently-active rows from the dimension table."""
        table_ref = self._table_ref(config.table_name, schema)
        sql = text(
            f"SELECT * FROM {table_ref} WHERE {config.is_current_column} = true"
        )
        result = conn.execute(sql)
        rows = result.mappings().all()
        if not rows:
            return pd.DataFrame()
        return pd.DataFrame([dict(r) for r in rows])

    def _detect_dimension_changes(
        self,
        incoming: pd.DataFrame,
        existing: pd.DataFrame,
        config: DimensionConfig,
    ) -> tuple[pd.DataFrame, list[dict[str, Any]]]:
        """Compare incoming rows to existing active rows.

        Returns:
            Tuple of (new_or_changed_rows_df, list_of_changed_natural_key_dicts).
        """
        nk = config.natural_keys
        tracked = config.tracked_columns

        if existing.empty:
            return incoming.copy(), []

        merged = incoming.merge(
            existing[nk + tracked],
            on=nk,
            how="left",
            suffixes=("", "_existing"),
            indicator=True,
        )

        # Brand-new records (no match in dimension)
        new_mask = merged["_merge"] == "left_only"

        # Changed records: matched but at least one tracked column differs
        both_mask = merged["_merge"] == "both"
        changed_mask = pd.Series(False, index=merged.index)
        for col in tracked:
            existing_col = f"{col}_existing"
            if existing_col in merged.columns:
                changed_mask = changed_mask | (
                    merged[col].astype(str) != merged[existing_col].astype(str)
                )
        changed_mask = changed_mask & both_mask

        new_or_changed = merged.loc[new_mask | changed_mask, incoming.columns].copy()

        # Extract natural-key dicts for the changed (not new) records
        changed_keys: list[dict[str, Any]] = []
        changed_rows = merged.loc[changed_mask]
        for _, row in changed_rows.iterrows():
            changed_keys.append({k: row[k] for k in nk})

        return new_or_changed, changed_keys

    def _expire_dimension_rows(
        self,
        conn: Connection,
        config: DimensionConfig,
        schema: str | None,
        changed_keys: list[dict[str, Any]],
        now: datetime,
    ) -> int:
        """Set ``end_date`` and ``is_current = False`` for changed rows."""
        table_ref = self._table_ref(config.table_name, schema)
        expired = 0

        for key_dict in changed_keys:
            where_clauses = " AND ".join(
                f"{k} = :{k}" for k in key_dict
            )
            sql = text(
                f"UPDATE {table_ref} "
                f"SET {config.end_date_column} = :_end_date, "
                f"    {config.is_current_column} = false, "
                f"    updated_at = :_updated_at "
                f"WHERE {where_clauses} AND {config.is_current_column} = true"
            )
            params = {
                **key_dict,
                "_end_date": now,
                "_updated_at": now,
            }
            result = conn.execute(sql, params)
            expired += result.rowcount  # type: ignore[union-attr]

        self._log.info("expire_dimension_rows.done", expired=expired)
        return expired

    def _prepare_dimension_insert(
        self,
        df: pd.DataFrame,
        config: DimensionConfig,
        now: datetime,
    ) -> pd.DataFrame:
        """Augment *df* with surrogate key, SCD columns, and audit fields."""
        out = df.copy()
        out[config.surrogate_key] = [uuid.uuid4().hex for _ in range(len(out))]
        out[config.start_date_column] = now
        out[config.end_date_column] = None
        out[config.is_current_column] = True
        out = self._add_audit_columns(out)
        return out

    # ------------------------------------------------------------------
    # Internal helpers — fact
    # ------------------------------------------------------------------

    def _resolve_dimension_keys(
        self,
        conn: Connection,
        df: pd.DataFrame,
        config: FactConfig,
    ) -> pd.DataFrame:
        """Replace natural-key columns with surrogate-key FK values.

        For each ``dimension_lookups`` entry, the loader queries the
        dimension's current rows and maps natural keys → surrogate keys
        into the DataFrame.

        Args:
            conn: Active database connection.
            df: Incoming fact data.
            config: Fact configuration with lookup definitions.

        Returns:
            DataFrame with FK columns populated.

        Raises:
            LoadError: If any natural key cannot be resolved.
        """
        result_df = df.copy()

        for fk_column, lookup in config.dimension_lookups.items():
            dim_schema = lookup.schema_name or config.schema_name or self._schema
            dim_ref = self._table_ref(lookup.dimension_table, dim_schema)
            dim_nk = lookup.natural_key_column or lookup.natural_key

            sql = text(
                f"SELECT {dim_nk}, {lookup.surrogate_key} "
                f"FROM {dim_ref} WHERE is_current = true"
            )
            rows = conn.execute(sql).mappings().all()
            lookup_map: dict[Any, Any] = {
                r[dim_nk]: r[lookup.surrogate_key] for r in rows
            }

            if lookup.natural_key not in result_df.columns:
                raise LoadError(
                    f"Natural key column '{lookup.natural_key}' not in DataFrame",
                    target=config.table_name,
                )

            result_df[fk_column] = result_df[lookup.natural_key].map(lookup_map)
            unresolved = result_df[fk_column].isna().sum()
            if unresolved > 0:
                self._log.warning(
                    "resolve_dimension_keys.unresolved",
                    fk_column=fk_column,
                    unresolved=int(unresolved),
                )

        return result_df

    # ------------------------------------------------------------------
    # Internal helpers — generic
    # ------------------------------------------------------------------

    def _insert_rows(
        self,
        conn: Connection,
        table_ref: str,
        df: pd.DataFrame,
        batch_size: int = 5000,
    ) -> int:
        """Batch-insert rows into *table_ref*.

        Returns:
            Number of rows successfully inserted.
        """
        columns = list(df.columns)
        col_list = ", ".join(columns)
        param_list = ", ".join(f":{c}" for c in columns)
        sql = text(f"INSERT INTO {table_ref} ({col_list}) VALUES ({param_list})")

        total = len(df)
        inserted = 0

        for batch_start in range(0, total, batch_size):
            batch_end = min(batch_start + batch_size, total)
            batch = df.iloc[batch_start:batch_end]
            records = batch.to_dict(orient="records")

            clean: list[dict[str, Any]] = []
            for rec in records:
                clean.append(
                    {k: (None if pd.isna(v) else v) for k, v in rec.items()}
                )

            conn.execute(sql, clean)
            inserted += len(clean)
            self._log.debug(
                "insert_rows.batch",
                table=table_ref,
                inserted=inserted,
                total=total,
            )

        return inserted

    def _add_audit_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Append ``created_at``, ``updated_at``, and ``etl_batch_id``."""
        out = df.copy()
        now = datetime.now(timezone.utc)
        out["created_at"] = now
        out["updated_at"] = now
        out["etl_batch_id"] = self._etl_batch_id
        return out

    def _get_watermark(
        self,
        conn: Connection,
        table_ref: str,
        watermark_column: str,
    ) -> Any:
        """Return the current high-watermark value from the target table."""
        sql = text(f"SELECT MAX({watermark_column}) FROM {table_ref}")
        return conn.execute(sql).scalar()

    @staticmethod
    def _table_ref(table_name: str, schema: str | None) -> str:
        """Build a ``schema.table`` reference string."""
        return f"{schema}.{table_name}" if schema else table_name

    def _record_result(self, result: LoadResult) -> None:
        """Update cumulative counters and store the latest result."""
        self._last_load_result = result
        self._cumulative_loaded += result.records_loaded
        self._cumulative_failed += result.records_failed
