"""Base loader providing the abstract interface for all ETL data loaders."""

from __future__ import annotations

import time
from abc import ABC, abstractmethod
from enum import Enum
from typing import Any

import pandas as pd
import structlog
from pydantic import BaseModel, Field
from tenacity import (
    RetryError,
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

logger = structlog.get_logger(__name__)

__all__ = ["BaseLoader", "LoadError", "LoadMode", "LoadResult"]


class LoadError(Exception):
    """Raised when a load operation fails.

    Args:
        message: Human-readable error description.
        target: Name of the destination that caused the failure.
        cause: The underlying exception, if any.
    """

    def __init__(
        self,
        message: str,
        target: str = "",
        cause: BaseException | None = None,
    ) -> None:
        self.target = target
        self.cause = cause
        super().__init__(message)


class LoadMode(str, Enum):
    """Supported strategies for writing data to a target."""

    APPEND = "append"
    REPLACE = "replace"
    UPSERT = "upsert"
    MERGE = "merge"


class LoadResult(BaseModel):
    """Outcome of a single load operation."""

    records_loaded: int = Field(ge=0, description="Rows successfully written")
    records_failed: int = Field(ge=0, description="Rows that could not be written")
    duration_seconds: float = Field(ge=0.0, description="Wall-clock time in seconds")
    errors: list[str] = Field(default_factory=list, description="Non-fatal error messages")


class BaseLoader(ABC):
    """Abstract base class for all ETL loaders.

    Subclasses must implement :meth:`load`, :meth:`validate_target`, and
    :meth:`get_load_stats`.  The concrete helper :meth:`load_with_retry`
    wraps ``load`` with configurable tenacity-based retry logic.

    Args:
        target_name: Logical name of the load destination (table, topic, etc.).
        max_retries: Maximum number of retry attempts for transient failures.
    """

    def __init__(self, target_name: str, *, max_retries: int = 3) -> None:
        self.target_name = target_name
        self.max_retries = max_retries
        self._log = logger.bind(
            loader=self.__class__.__name__,
            target=target_name,
        )

    # ------------------------------------------------------------------
    # Abstract interface
    # ------------------------------------------------------------------

    @abstractmethod
    def load(self, df: pd.DataFrame) -> LoadResult:
        """Write *df* to the target destination.

        Args:
            df: DataFrame to load.

        Returns:
            A :class:`LoadResult` summarising the outcome.

        Raises:
            LoadError: If the operation fails irrecoverably.
        """

    @abstractmethod
    def validate_target(self) -> bool:
        """Check that the target exists and is ready to receive data.

        Returns:
            ``True`` when the target is valid and accessible.

        Raises:
            LoadError: If the target cannot be reached or is misconfigured.
        """

    @abstractmethod
    def get_load_stats(self) -> dict[str, Any]:
        """Return statistics about the most recent (or cumulative) load.

        Returns:
            Dictionary of loader-specific statistics.
        """

    # ------------------------------------------------------------------
    # Concrete helpers
    # ------------------------------------------------------------------

    def load_with_retry(self, df: pd.DataFrame) -> LoadResult:
        """Execute :meth:`load` with automatic retry on transient errors.

        Uses tenacity with exponential back-off.  The number of attempts
        is controlled by ``self.max_retries``.

        Args:
            df: DataFrame to load.

        Returns:
            A :class:`LoadResult` on success.

        Raises:
            LoadError: After all retries have been exhausted.
        """
        self._log.info(
            "load_with_retry.start",
            rows=len(df),
            max_retries=self.max_retries,
        )
        start = time.perf_counter()

        @retry(
            retry=retry_if_exception_type((LoadError, OSError)),
            stop=stop_after_attempt(self.max_retries),
            wait=wait_exponential(multiplier=1, min=1, max=30),
            reraise=True,
        )
        def _inner() -> LoadResult:
            return self.load(df)

        try:
            result = _inner()
        except RetryError as exc:
            elapsed = time.perf_counter() - start
            self._log.error(
                "load_with_retry.exhausted",
                elapsed=elapsed,
                retries=self.max_retries,
            )
            raise LoadError(
                f"Load failed after {self.max_retries} attempts",
                target=self.target_name,
                cause=exc,
            ) from exc

        elapsed = time.perf_counter() - start
        self._log.info(
            "load_with_retry.done",
            records_loaded=result.records_loaded,
            records_failed=result.records_failed,
            elapsed=elapsed,
        )
        return result
