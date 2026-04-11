"""Base transformer providing the abstract contract for all ETL transformers."""

from __future__ import annotations

import time
from abc import ABC, abstractmethod
from typing import Any

import pandas as pd
import structlog
from pydantic import BaseModel, Field

logger: structlog.stdlib.BoundLogger = structlog.get_logger(__name__)

__all__ = ["BaseTransformer", "TransformError", "TransformResult"]


# ---------------------------------------------------------------------------
# Exceptions
# ---------------------------------------------------------------------------

class TransformError(Exception):
    """Raised when a transformation operation fails.

    Attributes:
        transformer: Name of the transformer that raised the error.
        cause: The underlying exception, if any.
    """

    def __init__(
        self,
        message: str,
        *,
        transformer: str = "",
        cause: Exception | None = None,
    ) -> None:
        super().__init__(message)
        self.transformer = transformer
        self.cause = cause


# ---------------------------------------------------------------------------
# Result model
# ---------------------------------------------------------------------------

class TransformResult(BaseModel):
    """Captures metrics produced by a single transformation run.

    Attributes:
        input_count: Number of records received.
        output_count: Number of records produced.
        duration_seconds: Wall-clock time of the transformation.
        errors: List of non-fatal error messages encountered during the run.
    """

    input_count: int = Field(ge=0, description="Number of input records")
    output_count: int = Field(ge=0, description="Number of output records")
    duration_seconds: float = Field(ge=0.0, description="Elapsed seconds")
    errors: list[str] = Field(default_factory=list, description="Non-fatal errors")


# ---------------------------------------------------------------------------
# Abstract base transformer
# ---------------------------------------------------------------------------

class BaseTransformer(ABC):
    """Abstract base class for all ETL transformers.

    Subclasses must implement ``transform`` and ``validate``.  The concrete
    ``transform_with_metrics`` helper wraps ``transform`` and returns both the
    transformed :class:`~pandas.DataFrame` and a :class:`TransformResult` with
    timing / record-count metrics.

    Parameters:
        name: Human-readable name for this transformer instance.
    """

    def __init__(self, name: str) -> None:
        self.name = name
        self._log = logger.bind(transformer=self.__class__.__name__, name=name)

    # ------------------------------------------------------------------
    # Abstract interface
    # ------------------------------------------------------------------

    @abstractmethod
    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Apply the transformation to *df* and return the result.

        Args:
            df: Input DataFrame.

        Returns:
            Transformed DataFrame.

        Raises:
            TransformError: If the transformation fails.
        """

    @abstractmethod
    def validate(self, df: pd.DataFrame) -> bool:
        """Check whether *df* satisfies the transformer's preconditions.

        Args:
            df: DataFrame to validate.

        Returns:
            ``True`` if valid, ``False`` otherwise.
        """

    # ------------------------------------------------------------------
    # Concrete helpers
    # ------------------------------------------------------------------

    def transform_with_metrics(
        self,
        df: pd.DataFrame,
        *,
        extra_meta: dict[str, Any] | None = None,
    ) -> tuple[pd.DataFrame, TransformResult]:
        """Execute :meth:`transform` while collecting execution metrics.

        Args:
            df: Input DataFrame.
            extra_meta: Optional metadata forwarded to the log entry.

        Returns:
            A tuple of *(transformed_df, result)*.

        Raises:
            TransformError: Propagated from :meth:`transform`.
        """
        input_count = len(df)
        errors: list[str] = []
        self._log.info(
            "transform_started",
            input_count=input_count,
            **(extra_meta or {}),
        )

        start = time.perf_counter()
        try:
            result_df = self.transform(df)
        except TransformError:
            raise
        except Exception as exc:
            raise TransformError(
                f"Transformation failed: {exc}",
                transformer=self.name,
                cause=exc,
            ) from exc
        duration = time.perf_counter() - start

        output_count = len(result_df)
        result = TransformResult(
            input_count=input_count,
            output_count=output_count,
            duration_seconds=round(duration, 6),
            errors=errors,
        )

        self._log.info(
            "transform_completed",
            input_count=input_count,
            output_count=output_count,
            duration_seconds=result.duration_seconds,
        )
        return result_df, result

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(name={self.name!r})"
