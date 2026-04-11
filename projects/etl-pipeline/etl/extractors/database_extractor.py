"""Database extractor built on SQLAlchemy with connection pooling.

Supports arbitrary SQL queries, table-level extraction, chunked reads for
large tables, and schema introspection.
"""

from __future__ import annotations

from collections.abc import Generator
from contextlib import contextmanager
from typing import Any

import pandas as pd
import structlog
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import Connection, Engine
from sqlalchemy.exc import OperationalError, SQLAlchemyError

from etl.extractors.base_extractor import (
    BaseExtractor,
    ConnectionError,
    ExtractionError,
    SchemaError,
)

logger: structlog.stdlib.BoundLogger = structlog.get_logger(__name__)

__all__ = ["DatabaseExtractor"]


class DatabaseExtractor(BaseExtractor):
    """Extract data from relational databases via SQLAlchemy.

    Parameters:
        connection_string: SQLAlchemy connection URL
            (e.g. ``postgresql+psycopg2://user:pw@host/db``).
        pool_size: Number of connections to keep in the pool.
        max_overflow: Extra connections beyond *pool_size* allowed during bursts.
        pool_timeout: Seconds to wait before raising on pool exhaustion.
        max_retries: Maximum retry attempts for extraction.
    """

    def __init__(
        self,
        connection_string: str,
        *,
        pool_size: int = 5,
        max_overflow: int = 10,
        pool_timeout: int = 30,
        max_retries: int = 3,
    ) -> None:
        super().__init__(source_name=connection_string, max_retries=max_retries)
        self._connection_string = connection_string
        self._engine: Engine = create_engine(
            connection_string,
            pool_size=pool_size,
            max_overflow=max_overflow,
            pool_timeout=pool_timeout,
            pool_pre_ping=True,
        )
        self._log = logger.bind(extractor="DatabaseExtractor")

    # ------------------------------------------------------------------
    # Context manager for connections
    # ------------------------------------------------------------------

    @contextmanager
    def _connect(self) -> Generator[Connection, None, None]:
        """Yield a SQLAlchemy connection, rolling back on error."""
        conn = self._engine.connect()
        try:
            yield conn
            conn.commit()
        except SQLAlchemyError:
            conn.rollback()
            raise
        finally:
            conn.close()

    # ------------------------------------------------------------------
    # Abstract interface implementation
    # ------------------------------------------------------------------

    def extract(self, *, query: str | None = None, table: str | None = None, params: dict[str, Any] | None = None) -> pd.DataFrame:
        """Extract data by executing *query* or reading an entire *table*.

        Exactly one of *query* or *table* must be supplied.

        Args:
            query: A raw SQL ``SELECT`` statement.  Parameters may be bound
                via the *params* mapping using ``:name`` placeholders.
            table: A table name to read in full (``SELECT * FROM <table>``).
            params: Parameter mapping for safe query parameterisation.

        Returns:
            A :class:`pandas.DataFrame` with the query results.

        Raises:
            ExtractionError: On any database-level failure.
            ValueError: If both or neither of *query* / *table* are given.
        """
        if (query is None) == (table is None):
            raise ValueError("Supply exactly one of 'query' or 'table'.")

        sql = query if query is not None else f"SELECT * FROM {self._quote_identifier(table)}"  # type: ignore[arg-type]

        try:
            with self._connect() as conn:
                df = pd.read_sql(text(sql), conn, params=params or {})
        except SQLAlchemyError as exc:
            raise ExtractionError(
                f"Database extraction failed: {exc}",
                source=self.source_name,
                cause=exc,
            ) from exc

        self._log.info("extract_success", rows=len(df), columns=list(df.columns))
        return df

    def validate_connection(self) -> bool:
        """Verify the database is reachable by executing ``SELECT 1``."""
        try:
            with self._connect() as conn:
                conn.execute(text("SELECT 1"))
            return True
        except (OperationalError, SQLAlchemyError) as exc:
            self._log.warning("connection_validation_failed", error=str(exc))
            return False

    def get_metadata(self) -> dict[str, Any]:
        """Return metadata including table names and row counts."""
        try:
            insp = inspect(self._engine)
            tables = insp.get_table_names()
            row_counts: dict[str, int] = {}
            with self._connect() as conn:
                for tbl in tables:
                    result = conn.execute(
                        text(f"SELECT COUNT(*) FROM {self._quote_identifier(tbl)}")
                    )
                    row_counts[tbl] = result.scalar() or 0

            return {
                "dialect": self._engine.dialect.name,
                "tables": tables,
                "row_counts": row_counts,
            }
        except SQLAlchemyError as exc:
            self._log.error("metadata_fetch_failed", error=str(exc))
            return {"error": str(exc)}

    # ------------------------------------------------------------------
    # Extended helpers
    # ------------------------------------------------------------------

    def extract_chunked(
        self,
        *,
        query: str | None = None,
        table: str | None = None,
        chunk_size: int = 10_000,
        params: dict[str, Any] | None = None,
    ) -> Generator[pd.DataFrame, None, None]:
        """Yield successive :class:`~pandas.DataFrame` chunks from a large query.

        This avoids loading huge result sets into memory at once.

        Args:
            query: SQL ``SELECT`` statement.
            table: Table name (mutually exclusive with *query*).
            chunk_size: Number of rows per chunk.
            params: Bind parameters for the query.

        Yields:
            DataFrames of at most *chunk_size* rows.

        Raises:
            ExtractionError: On any database-level failure.
            ValueError: If both or neither of *query* / *table* are given.
        """
        if (query is None) == (table is None):
            raise ValueError("Supply exactly one of 'query' or 'table'.")

        sql = query if query is not None else f"SELECT * FROM {self._quote_identifier(table)}"  # type: ignore[arg-type]

        try:
            with self._connect() as conn:
                chunks = pd.read_sql(text(sql), conn, params=params or {}, chunksize=chunk_size)
                for idx, chunk in enumerate(chunks):
                    self._log.debug("chunk_read", chunk_index=idx, rows=len(chunk))
                    yield chunk
        except SQLAlchemyError as exc:
            raise ExtractionError(
                f"Chunked extraction failed: {exc}",
                source=self.source_name,
                cause=exc,
            ) from exc

    def get_table_schema(self, table_name: str) -> dict[str, Any]:
        """Return column-level schema information for *table_name*.

        Uses :func:`sqlalchemy.inspect` to introspect column names, types,
        nullability, defaults and primary-key membership.

        Args:
            table_name: Name of the table to inspect.

        Returns:
            Dictionary keyed by column name with column metadata dicts.

        Raises:
            SchemaError: If the table does not exist or inspection fails.
        """
        try:
            insp = inspect(self._engine)
            if table_name not in insp.get_table_names():
                raise SchemaError(f"Table '{table_name}' does not exist.")

            columns = insp.get_columns(table_name)
            pk_cols = {c for c in (insp.get_pk_constraint(table_name).get("constrained_columns") or [])}

            schema: dict[str, Any] = {}
            for col in columns:
                schema[col["name"]] = {
                    "type": str(col["type"]),
                    "nullable": col.get("nullable", True),
                    "default": str(col["default"]) if col.get("default") is not None else None,
                    "primary_key": col["name"] in pk_cols,
                }
            return schema
        except SQLAlchemyError as exc:
            raise SchemaError(
                f"Failed to inspect schema for '{table_name}': {exc}"
            ) from exc

    # ------------------------------------------------------------------
    # Private utilities
    # ------------------------------------------------------------------

    @staticmethod
    def _quote_identifier(name: str) -> str:
        """Double-quote a SQL identifier to prevent injection.

        This is a minimal safeguard; prefer parameterised queries whenever
        possible.  The method rejects names containing double quotes.
        """
        if '"' in name:
            raise ValueError(f"Invalid identifier (contains double-quote): {name!r}")
        return f'"{name}"'

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    def dispose(self) -> None:
        """Dispose of the connection pool and release resources."""
        self._engine.dispose()
        self._log.info("engine_disposed")
