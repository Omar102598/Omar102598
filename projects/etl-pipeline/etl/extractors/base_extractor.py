"""Base extractor module providing the abstract interface for all ETL extractors.

This module defines the contract that every extractor must implement, along with
shared utilities such as retry logic, stats logging, and a structured result model.
"""

from __future__ import annotations

import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

import pandas as pd
import structlog
from tenacity import (
    RetryError,
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

logger: structlog.stdlib.BoundLogger = structlog.get_logger(__name__)

# ---------------------------------------------------------------------------
# Custom exceptions
# ---------------------------------------------------------------------------


class ExtractionError(Exception):
    """Raised when data extraction fails after all retries."""

    def __init__(self, message: str, source: str = "", cause: BaseException | None = None) -> None:
        self.source = source
        self.cause = cause
        super().__init__(message)


class ConnectionError(Exception):  # noqa: A001 – intentionally shadows builtin for domain clarity
    """Raised when a connection to the data source cannot be established."""

    def __init__(self, message: str, source: str = "", cause: BaseException | None = None) -> None:
        self.source = source
        self.cause = cause
        super().__init__(message)


class SchemaError(Exception):
    """Raised when the extracted data does not conform to the expected schema."""

    def __init__(
        self,
        message: str,
        expected_columns: list[str] | None = None,
        actual_columns: list[str] | None = None,
    ) -> None:
        self.expected_columns = expected_columns or []
        self.actual_columns = actual_columns or []
        super().__init__(message)


# ---------------------------------------------------------------------------
# Extraction result model
# ---------------------------------------------------------------------------


@dataclass(frozen=True, slots=True)
class ExtractionResult:
    """Immutable container for the outcome of an extraction run."""

    data: pd.DataFrame
    source: str
    record_count: int
    extraction_started_at: datetime
    extraction_finished_at: datetime
    metadata: dict[str, Any] = field(default_factory=dict)

    @property
    def duration_seconds(self) -> float:
        """Wall-clock seconds the extraction took."""
        return (self.extraction_finished_at - self.extraction_started_at).total_seconds()


# ---------------------------------------------------------------------------
# Abstract base extractor
# ---------------------------------------------------------------------------


class BaseExtractor(ABC):
    """Abstract base class for all ETL extractors.

    Subclasses **must** implement:
    * ``extract`` – pull data and return a :class:`pandas.DataFrame`.
    * ``validate_connection`` – verify that the source is reachable.
    * ``get_metadata`` – return a dictionary describing the source.

    The base class provides:
    * ``extract_with_retry`` – wraps ``extract`` with configurable retries.
    * ``get_record_count`` – delegates to ``extract`` and returns the row count.
    * ``_log_extraction_stats`` – structured log output after every extraction.
    """

    def __init__(self, source_name: str, *, max_retries: int = 3) -> None:
        self.source_name = source_name
        self.max_retries = max_retries
        self._log = logger.bind(extractor=self.__class__.__name__, source=source_name)

    # ------------------------------------------------------------------
    # Abstract interface
    # ------------------------------------------------------------------

    @abstractmethod
    def extract(self, **kwargs: Any) -> pd.DataFrame:
        """Extract data from the source and return a DataFrame.

        Keyword arguments are source-specific (e.g. query, table name, endpoint).
        """

    @abstractmethod
    def validate_connection(self) -> bool:
        """Return ``True`` if the data source is reachable, ``False`` otherwise."""

    @abstractmethod
    def get_metadata(self) -> dict[str, Any]:
        """Return a dictionary of metadata about the data source."""

    # ------------------------------------------------------------------
    # Concrete helpers
    # ------------------------------------------------------------------

    def extract_with_retry(self, **kwargs: Any) -> ExtractionResult:
        """Execute :meth:`extract` with tenacity-powered exponential-backoff retries.

        Returns an :class:`ExtractionResult` on success.

        Raises:
            ExtractionError: If all retry attempts are exhausted.
        """

        @retry(
            retry=retry_if_exception_type((ExtractionError, OSError)),
            stop=stop_after_attempt(self.max_retries),
            wait=wait_exponential(multiplier=1, min=1, max=30),
            reraise=True,
        )
        def _inner() -> pd.DataFrame:
            return self.extract(**kwargs)

        started_at = datetime.now(timezone.utc)
        try:
            df = _inner()
        except RetryError as exc:
            raise ExtractionError(
                f"Extraction failed after {self.max_retries} retries",
                source=self.source_name,
                cause=exc,
            ) from exc

        finished_at = datetime.now(timezone.utc)
        self._log_extraction_stats(df, started_at, finished_at)

        return ExtractionResult(
            data=df,
            source=self.source_name,
            record_count=len(df),
            extraction_started_at=started_at,
            extraction_finished_at=finished_at,
            metadata=self.get_metadata(),
        )

    def get_record_count(self, **kwargs: Any) -> int:
        """Return the number of rows that :meth:`extract` would produce.

        This is a convenience wrapper; subclasses may override with a more
        efficient implementation (e.g. ``SELECT COUNT(*)``).
        """
        df = self.extract(**kwargs)
        return len(df)

    def _log_extraction_stats(
        self,
        df: pd.DataFrame,
        started_at: datetime,
        finished_at: datetime,
    ) -> None:
        """Emit a structured log entry with extraction statistics."""
        duration = (finished_at - started_at).total_seconds()
        self._log.info(
            "extraction_complete",
            rows=len(df),
            columns=len(df.columns),
            memory_bytes=int(df.memory_usage(deep=True).sum()),
            duration_seconds=round(duration, 3),
        )

    # ------------------------------------------------------------------
    # Dunder helpers
    # ------------------------------------------------------------------

    def __repr__(self) -> str:  # pragma: no cover
        return f"<{self.__class__.__name__}(source={self.source_name!r})>"
