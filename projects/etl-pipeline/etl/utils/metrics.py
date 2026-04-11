"""Thread-safe pipeline metrics collection with Prometheus exposition support."""

from __future__ import annotations

import threading
import time
from typing import ClassVar

from pydantic import BaseModel, Field

__all__ = ["MetricsCollector", "PipelineMetrics"]


class PipelineMetrics(BaseModel):
    """Aggregated metrics for a pipeline run."""

    records_extracted: int = 0
    records_transformed: int = 0
    records_loaded: int = 0
    errors: int = 0
    duration: float = 0.0
    quality_score: float = 0.0


class _ErrorRecord(BaseModel):
    """Internal model to store individual error events."""

    error_type: str
    message: str
    timestamp: float


class MetricsCollector:
    """Singleton, thread-safe collector for ETL pipeline metrics.

    Usage::

        metrics = MetricsCollector()
        metrics.record_extraction(500, 1.2)
        print(metrics.get_summary())
    """

    _instance: ClassVar[MetricsCollector | None] = None
    _init_lock: ClassVar[threading.Lock] = threading.Lock()

    # ------------------------------------------------------------------
    # Singleton
    # ------------------------------------------------------------------

    def __new__(cls) -> MetricsCollector:
        if cls._instance is None:
            with cls._init_lock:
                # Double-checked locking.
                if cls._instance is None:
                    instance = super().__new__(cls)
                    instance._lock = threading.Lock()
                    instance._records_extracted = 0
                    instance._records_transformed = 0
                    instance._records_loaded = 0
                    instance._errors: list[_ErrorRecord] = []
                    instance._quality_score = 0.0
                    instance._extraction_duration = 0.0
                    instance._transformation_duration = 0.0
                    instance._load_duration = 0.0
                    instance._start_time = time.monotonic()
                    cls._instance = instance
        return cls._instance

    # ------------------------------------------------------------------
    # Recording methods
    # ------------------------------------------------------------------

    def record_extraction(self, count: int, duration: float) -> None:
        """Record extracted records and wall-clock duration."""
        with self._lock:
            self._records_extracted += count
            self._extraction_duration += duration

    def record_transformation(
        self,
        input_count: int,
        output_count: int,
        duration: float,
    ) -> None:
        """Record transformation throughput and duration."""
        with self._lock:
            self._records_transformed += output_count
            self._transformation_duration += duration

    def record_load(self, count: int, duration: float) -> None:
        """Record loaded records and wall-clock duration."""
        with self._lock:
            self._records_loaded += count
            self._load_duration += duration

    def record_error(self, error_type: str, message: str) -> None:
        """Record a pipeline error."""
        with self._lock:
            self._errors.append(
                _ErrorRecord(
                    error_type=error_type,
                    message=message,
                    timestamp=time.time(),
                )
            )

    def record_quality_score(self, score: float) -> None:
        """Set the data-quality score (0-100)."""
        with self._lock:
            self._quality_score = max(0.0, min(100.0, score))

    # ------------------------------------------------------------------
    # Reporting
    # ------------------------------------------------------------------

    def get_summary(self) -> PipelineMetrics:
        """Return a snapshot of the current metrics."""
        with self._lock:
            total_duration = (
                self._extraction_duration
                + self._transformation_duration
                + self._load_duration
            )
            return PipelineMetrics(
                records_extracted=self._records_extracted,
                records_transformed=self._records_transformed,
                records_loaded=self._records_loaded,
                errors=len(self._errors),
                duration=round(total_duration, 4),
                quality_score=self._quality_score,
            )

    def to_prometheus(self) -> str:
        """Format current metrics in Prometheus exposition text format."""
        summary = self.get_summary()
        lines = [
            "# HELP etl_records_extracted Total records extracted.",
            "# TYPE etl_records_extracted counter",
            f"etl_records_extracted {summary.records_extracted}",
            "",
            "# HELP etl_records_transformed Total records transformed.",
            "# TYPE etl_records_transformed counter",
            f"etl_records_transformed {summary.records_transformed}",
            "",
            "# HELP etl_records_loaded Total records loaded.",
            "# TYPE etl_records_loaded counter",
            f"etl_records_loaded {summary.records_loaded}",
            "",
            "# HELP etl_errors_total Total pipeline errors.",
            "# TYPE etl_errors_total counter",
            f"etl_errors_total {summary.errors}",
            "",
            "# HELP etl_duration_seconds Total pipeline duration in seconds.",
            "# TYPE etl_duration_seconds gauge",
            f"etl_duration_seconds {summary.duration}",
            "",
            "# HELP etl_quality_score Data quality score (0-100).",
            "# TYPE etl_quality_score gauge",
            f"etl_quality_score {summary.quality_score}",
            "",
        ]
        return "\n".join(lines)

    def reset(self) -> None:
        """Reset all metrics to zero."""
        with self._lock:
            self._records_extracted = 0
            self._records_transformed = 0
            self._records_loaded = 0
            self._errors.clear()
            self._quality_score = 0.0
            self._extraction_duration = 0.0
            self._transformation_duration = 0.0
            self._load_duration = 0.0
            self._start_time = time.monotonic()
