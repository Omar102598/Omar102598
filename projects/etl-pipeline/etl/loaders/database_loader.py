"""Database loader with support for append, replace, and upsert modes."""

from __future__ import annotations

import time
from collections.abc import Callable
from datetime import datetime, timezone
from typing import Any

import pandas as pd
import structlog
from pydantic import BaseModel, Field
from sqlalchemy import (
    Connection,
    MetaData,
    Table,
    create_engine,
    inspect,
    text,
)
from sqlalchemy.engine import Engine
from tenacity import (
    RetryError,
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from etl.loaders.base_loader import BaseLoader, LoadError, LoadMode, LoadResult

logger = structlog.get_logger(__name__)

__all__ = ["DatabaseLoader"]


class DatabaseLoaderConfig(BaseModel):
    """Validated configuration for :class:`DatabaseLoader`."""

    model_config = {"populate_by_name": True}

    connection_string: str = Field(
        ..., min_length=1, description="SQLAlchemy connection URL"
    )
    table_name: str = Field(..., min_length=1, description="Destination table name")
    schema_name: str | None = Field(
        default=None, alias="schema", description="Database schema"
    )
    batch_size: int = Field(default=5000, ge=1, description="Rows per INSERT batch")
    load_mode: LoadMode = Field(default=LoadMode.APPEND, description="Write strategy")
    primary_keys: list[str] = Field(
        default_factory=list, description="PK columns for upsert"
    )


class DatabaseLoader(BaseLoader):
    """Load DataFrames into a relational database via SQLAlchemy.

    Supports PostgreSQL, MySQL / MariaDB, and SQLite out of the box.
    Transient database errors (connection drops, deadlocks) are retried
    automatically when using :meth:`load_with_retry`.

    Args:
        connection_string: SQLAlchemy connection URL.
        table_name: Target table name.
        schema: Optional database schema (e.g. ``"public"``).
        batch_size: Number of rows per INSERT batch.
        load_mode: One of :class:`LoadMode` values.
        primary_keys: Column names forming the upsert key.
        max_retries: Maximum retry attempts for transient errors.
        pre_load_hook: Optional callable invoked before load, receives the
            :class:`Connection` and the DataFrame.
        post_load_hook: Optional callable invoked after a successful load,
            receives the :class:`Connection` and the :class:`LoadResult`.
    """

    def __init__(
        self,
        connection_string: str,
        table_name: str,
        *,
        schema: str | None = None,
        batch_size: int = 5000,
        load_mode: LoadMode = LoadMode.APPEND,
        primary_keys: list[str] | None = None,
        max_retries: int = 3,
        pre_load_hook: Callable[[Connection, pd.DataFrame], None] | None = None,
        post_load_hook: Callable[[Connection, LoadResult], None] | None = None,
    ) -> None:
        super().__init__(target_name=table_name, max_retries=max_retries)
        self._config = DatabaseLoaderConfig(
            connection_string=connection_string,
            table_name=table_name,
            schema=schema,
            batch_size=batch_size,
            load_mode=load_mode,
            primary_keys=primary_keys or [],
        )
        self._engine: Engine = create_engine(connection_string, pool_pre_ping=True)
        self._pre_load_hook = pre_load_hook
        self._post_load_hook = post_load_hook
        self._last_load_result: LoadResult | None = None
        self._last_load_time: datetime | None = None
        self._log = logger.bind(
            loader="DatabaseLoader",
            table=table_name,
            schema=schema,
        )

    # ------------------------------------------------------------------
    # Public interface
    # ------------------------------------------------------------------

    def load(self, df: pd.DataFrame) -> LoadResult:
        """Write *df* into the configured database table.

        Dispatches to the appropriate strategy based on
        :attr:`_config.load_mode` (APPEND, REPLACE, or UPSERT).

        Args:
            df: DataFrame whose columns must match the target table.

        Returns:
            A :class:`LoadResult` with load statistics.

        Raises:
            LoadError: On schema mismatch, unsupported dialect, or
                database errors that are not retryable.
        """
        if df.empty:
            self._log.warning("load.empty_dataframe")
            return LoadResult(
                records_loaded=0,
                records_failed=0,
                duration_seconds=0.0,
            )

        self._validate_columns(df)
        start = time.perf_counter()
        errors: list[str] = []
        records_loaded = 0
        records_failed = 0

        try:
            with self._engine.begin() as conn:
                if self._pre_load_hook is not None:
                    self._pre_load_hook(conn, df)

                mode = self._config.load_mode
                if mode is LoadMode.APPEND:
                    loaded, failed, errs = self._append(conn, df)
                elif mode is LoadMode.REPLACE:
                    loaded, failed, errs = self._replace(conn, df)
                elif mode is LoadMode.UPSERT:
                    loaded, failed, errs = self._upsert(conn, df)
                else:
                    raise LoadError(
                        f"Unsupported load mode: {mode}",
                        target=self.target_name,
                    )

                records_loaded = loaded
                records_failed = failed
                errors.extend(errs)

                result = LoadResult(
                    records_loaded=records_loaded,
                    records_failed=records_failed,
                    duration_seconds=time.perf_counter() - start,
                    errors=errors,
                )

                if self._post_load_hook is not None:
                    self._post_load_hook(conn, result)
        except LoadError:
            raise
        except Exception as exc:
            raise LoadError(
                f"Database load failed: {exc}",
                target=self.target_name,
                cause=exc,
            ) from exc

        self._last_load_result = result
        self._last_load_time = datetime.now(timezone.utc)
        self._log.info(
            "load.complete",
            mode=self._config.load_mode.value,
            records_loaded=records_loaded,
            records_failed=records_failed,
            duration=result.duration_seconds,
        )
        return result

    def validate_target(self) -> bool:
        """Verify that the target table exists and columns are compatible.

        Returns:
            ``True`` when the table is present and all expected columns
            can be mapped.

        Raises:
            LoadError: If the table does not exist or the engine cannot
                connect.
        """
        try:
            insp = inspect(self._engine)
            table_names = insp.get_table_names(schema=self._config.schema_name)
            if self._config.table_name not in table_names:
                raise LoadError(
                    f"Table '{self._config.table_name}' not found in schema "
                    f"'{self._config.schema_name}'",
                    target=self.target_name,
                )
            columns = insp.get_columns(
                self._config.table_name, schema=self._config.schema_name
            )
            self._log.info(
                "validate_target.ok",
                column_count=len(columns),
            )
            return True
        except LoadError:
            raise
        except Exception as exc:
            raise LoadError(
                f"Target validation failed: {exc}",
                target=self.target_name,
                cause=exc,
            ) from exc

    def get_load_stats(self) -> dict[str, Any]:
        """Return statistics from the most recent load and current table state.

        Returns:
            Dictionary with ``last_result``, ``last_load_time``, and the
            current row count of the target table (``row_count``).
        """
        stats: dict[str, Any] = {
            "table": self._config.table_name,
            "schema": self._config.schema_name,
            "load_mode": self._config.load_mode.value,
            "last_load_time": (
                self._last_load_time.isoformat() if self._last_load_time else None
            ),
            "last_result": (
                self._last_load_result.model_dump() if self._last_load_result else None
            ),
        }
        try:
            with self._engine.connect() as conn:
                schema_prefix = (
                    f"{self._config.schema_name}." if self._config.schema_name else ""
                )
                row = conn.execute(
                    text(f"SELECT COUNT(*) FROM {schema_prefix}{self._config.table_name}")
                ).scalar()
                stats["row_count"] = row
        except Exception as exc:
            self._log.warning("get_load_stats.row_count_failed", error=str(exc))
            stats["row_count"] = None
        return stats

    # ------------------------------------------------------------------
    # Load strategies
    # ------------------------------------------------------------------

    def _append(
        self, conn: Connection, df: pd.DataFrame
    ) -> tuple[int, int, list[str]]:
        """INSERT rows in batches (append mode).

        Returns:
            Tuple of (loaded, failed, errors).
        """
        self._log.info("append.start", rows=len(df))
        return self._bulk_insert(conn, df)

    def _replace(
        self, conn: Connection, df: pd.DataFrame
    ) -> tuple[int, int, list[str]]:
        """TRUNCATE the target table, then INSERT all rows.

        Returns:
            Tuple of (loaded, failed, errors).
        """
        schema_prefix = f"{self._config.schema_name}." if self._config.schema_name else ""
        table_ref = f"{schema_prefix}{self._config.table_name}"

        dialect = self._engine.dialect.name
        if dialect in ("postgresql", "mysql", "mariadb"):
            conn.execute(text(f"TRUNCATE TABLE {table_ref}"))
        else:
            conn.execute(text(f"DELETE FROM {table_ref}"))

        self._log.info("replace.truncated", table=table_ref)
        return self._bulk_insert(conn, df)

    def _upsert(
        self, conn: Connection, df: pd.DataFrame
    ) -> tuple[int, int, list[str]]:
        """Route to the dialect-specific upsert implementation.

        Returns:
            Tuple of (loaded, failed, errors).

        Raises:
            LoadError: If the dialect is not supported or primary keys are
                not configured.
        """
        if not self._config.primary_keys:
            raise LoadError(
                "Upsert requires at least one primary_key column",
                target=self.target_name,
            )

        dialect = self._engine.dialect.name
        if dialect == "postgresql":
            return self._upsert_postgresql(conn, df)
        if dialect in ("mysql", "mariadb"):
            return self._upsert_mysql(conn, df)
        raise LoadError(
            f"Upsert is not supported for dialect '{dialect}'",
            target=self.target_name,
        )

    def _upsert_postgresql(
        self, conn: Connection, df: pd.DataFrame
    ) -> tuple[int, int, list[str]]:
        """PostgreSQL ``INSERT … ON CONFLICT DO UPDATE``.

        Returns:
            Tuple of (loaded, failed, errors).
        """
        columns = list(df.columns)
        pks = self._config.primary_keys
        non_pk_cols = [c for c in columns if c not in pks]
        schema_prefix = f"{self._config.schema_name}." if self._config.schema_name else ""
        table_ref = f"{schema_prefix}{self._config.table_name}"

        col_list = ", ".join(columns)
        param_list = ", ".join(f":{c}" for c in columns)
        conflict_cols = ", ".join(pks)
        update_set = ", ".join(f"{c} = EXCLUDED.{c}" for c in non_pk_cols)

        sql = (
            f"INSERT INTO {table_ref} ({col_list}) VALUES ({param_list}) "
            f"ON CONFLICT ({conflict_cols}) DO UPDATE SET {update_set}"
        )

        return self._execute_batched(conn, sql, df, columns)

    def _upsert_mysql(
        self, conn: Connection, df: pd.DataFrame
    ) -> tuple[int, int, list[str]]:
        """MySQL ``INSERT … ON DUPLICATE KEY UPDATE``.

        Returns:
            Tuple of (loaded, failed, errors).
        """
        columns = list(df.columns)
        pks = self._config.primary_keys
        non_pk_cols = [c for c in columns if c not in pks]
        schema_prefix = f"{self._config.schema_name}." if self._config.schema_name else ""
        table_ref = f"{schema_prefix}{self._config.table_name}"

        col_list = ", ".join(columns)
        param_list = ", ".join(f":{c}" for c in columns)
        update_set = ", ".join(f"{c} = VALUES({c})" for c in non_pk_cols)

        sql = (
            f"INSERT INTO {table_ref} ({col_list}) VALUES ({param_list}) "
            f"ON DUPLICATE KEY UPDATE {update_set}"
        )

        return self._execute_batched(conn, sql, df, columns)

    # ------------------------------------------------------------------
    # Bulk helpers
    # ------------------------------------------------------------------

    def _bulk_insert(
        self, conn: Connection, df: pd.DataFrame
    ) -> tuple[int, int, list[str]]:
        """Insert rows in batches using parameterised INSERT statements.

        Args:
            conn: Active database connection (inside a transaction).
            df: DataFrame to insert.

        Returns:
            Tuple of (loaded, failed, error messages).
        """
        columns = list(df.columns)
        schema_prefix = f"{self._config.schema_name}." if self._config.schema_name else ""
        table_ref = f"{schema_prefix}{self._config.table_name}"

        col_list = ", ".join(columns)
        param_list = ", ".join(f":{c}" for c in columns)
        sql = f"INSERT INTO {table_ref} ({col_list}) VALUES ({param_list})"

        return self._execute_batched(conn, sql, df, columns)

    def _execute_batched(
        self,
        conn: Connection,
        sql: str,
        df: pd.DataFrame,
        columns: list[str],
    ) -> tuple[int, int, list[str]]:
        """Execute *sql* for every row in *df*, batched by ``batch_size``.

        Args:
            conn: Active database connection.
            sql: Parameterised SQL statement.
            df: Source data.
            columns: Column names used as bind-parameter keys.

        Returns:
            Tuple of (loaded, failed, error messages).
        """
        batch_size = self._config.batch_size
        total = len(df)
        loaded = 0
        failed = 0
        errors: list[str] = []

        for batch_start in range(0, total, batch_size):
            batch_end = min(batch_start + batch_size, total)
            batch_df = df.iloc[batch_start:batch_end]
            records = batch_df.to_dict(orient="records")

            # Replace pandas NA/NaN with None for SQL parameter binding
            clean_records: list[dict[str, Any]] = []
            for rec in records:
                clean_records.append(
                    {k: (None if pd.isna(v) else v) for k, v in rec.items()}
                )

            try:
                conn.execute(text(sql), clean_records)
                loaded += len(clean_records)
            except Exception as exc:
                failed += len(clean_records)
                msg = f"Batch {batch_start}-{batch_end} failed: {exc}"
                errors.append(msg)
                self._log.warning("batch.failed", start=batch_start, end=batch_end, error=str(exc))

            self._log.debug(
                "batch.progress",
                loaded=loaded,
                failed=failed,
                total=total,
            )

        return loaded, failed, errors

    # ------------------------------------------------------------------
    # Validation helpers
    # ------------------------------------------------------------------

    def _validate_columns(self, df: pd.DataFrame) -> None:
        """Ensure every DataFrame column has a matching column in the target.

        Raises:
            LoadError: If one or more columns in *df* are not present in the
                target table.
        """
        try:
            insp = inspect(self._engine)
            table_columns = {
                col["name"]
                for col in insp.get_columns(
                    self._config.table_name, schema=self._config.schema_name
                )
            }
        except Exception as exc:
            raise LoadError(
                f"Column validation failed: {exc}",
                target=self.target_name,
                cause=exc,
            ) from exc

        df_columns = set(df.columns)
        missing = df_columns - table_columns
        if missing:
            raise LoadError(
                f"Columns not in target table: {sorted(missing)}",
                target=self.target_name,
            )
