"""Statistical anomaly detection for ETL data quality.

Provides multiple detection methods including Z-score, IQR, modified Z-score
(MAD-based), time-series anomaly detection via rolling statistics, categorical
drift detection via chi-square tests, and numerical data drift via KS tests.
"""

from __future__ import annotations

from enum import Enum
from typing import Any

import numpy as np
import pandas as pd
import structlog
from pydantic import BaseModel, Field
from scipy import stats as scipy_stats

logger: structlog.stdlib.BoundLogger = structlog.get_logger(__name__)

__all__ = ["AnomalyDetector", "AnomalyMethod", "AnomalyResult"]


# ---------------------------------------------------------------------------
# Enums & models
# ---------------------------------------------------------------------------


class AnomalyMethod(str, Enum):
    """Supported anomaly detection methods."""

    Z_SCORE = "z_score"
    IQR = "iqr"
    MODIFIED_Z_SCORE = "modified_z_score"
    ISOLATION_FOREST = "isolation_forest"


class AnomalyResult(BaseModel):
    """Outcome of anomaly detection on a single column.

    Attributes:
        column: Column that was analysed.
        method: Detection method used.
        anomaly_count: Number of anomalous values detected.
        anomaly_indices: Row indices of detected anomalies.
        threshold: Threshold value used for detection.
        statistics: Method-specific summary statistics.
    """

    column: str
    method: AnomalyMethod
    anomaly_count: int = Field(ge=0)
    anomaly_indices: list[int] = Field(default_factory=list)
    threshold: float
    statistics: dict[str, Any] = Field(default_factory=dict)

    model_config = {"arbitrary_types_allowed": True}


# ---------------------------------------------------------------------------
# AnomalyDetector
# ---------------------------------------------------------------------------


class AnomalyDetector:
    """Statistical anomaly detection across DataFrame columns.

    Example::

        detector = AnomalyDetector()
        results = detector.detect(df, columns=["price", "quantity"],
                                  method=AnomalyMethod.Z_SCORE)
    """

    def __init__(self) -> None:
        self._log = logger.bind(component="AnomalyDetector")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def detect(
        self,
        df: pd.DataFrame,
        columns: list[str] | None = None,
        method: AnomalyMethod = AnomalyMethod.Z_SCORE,
        **kwargs: Any,
    ) -> list[AnomalyResult]:
        """Run anomaly detection on selected numeric columns.

        Args:
            df: Input DataFrame.
            columns: Columns to analyse.  Defaults to all numeric columns.
            method: Detection algorithm to apply.
            **kwargs: Additional parameters forwarded to the detector
                (e.g. ``threshold``, ``multiplier``).

        Returns:
            One :class:`AnomalyResult` per column.
        """
        if columns is None:
            columns = df.select_dtypes(include=[np.number]).columns.tolist()

        results: list[AnomalyResult] = []
        for col in columns:
            if col not in df.columns:
                self._log.warning("column_not_found", column=col)
                continue

            series = df[col].dropna()
            if not pd.api.types.is_numeric_dtype(series):
                self._log.warning("non_numeric_column_skipped", column=col)
                continue

            match method:
                case AnomalyMethod.Z_SCORE:
                    result = self.detect_zscore(
                        series, threshold=kwargs.get("threshold", 3.0),
                    )
                case AnomalyMethod.IQR:
                    result = self.detect_iqr(
                        series, multiplier=kwargs.get("multiplier", 1.5),
                    )
                case AnomalyMethod.MODIFIED_Z_SCORE:
                    result = self.detect_modified_zscore(
                        series, threshold=kwargs.get("threshold", 3.5),
                    )
                case AnomalyMethod.ISOLATION_FOREST:
                    result = self._detect_isolation_forest(
                        series,
                        contamination=kwargs.get("contamination", 0.1),
                    )

            # Override column name from series name
            result = result.model_copy(update={"column": col})
            results.append(result)

        self._log.info(
            "anomaly_detection_complete",
            method=method.value,
            columns_checked=len(results),
            total_anomalies=sum(r.anomaly_count for r in results),
        )
        return results

    def detect_zscore(
        self,
        series: pd.Series,  # type: ignore[type-arg]
        threshold: float = 3.0,
    ) -> AnomalyResult:
        """Detect anomalies using standard Z-score.

        A value is anomalous if ``|z| > threshold`` where
        ``z = (x - mean) / std``.

        Args:
            series: Numeric pandas Series.
            threshold: Z-score cutoff (default ``3.0``).

        Returns:
            Detection result.
        """
        mean = float(series.mean())
        std = float(series.std(ddof=1))

        if std == 0.0:
            return AnomalyResult(
                column=str(series.name or ""),
                method=AnomalyMethod.Z_SCORE,
                anomaly_count=0,
                anomaly_indices=[],
                threshold=threshold,
                statistics={"mean": mean, "std": std},
            )

        z_scores = (series - mean) / std
        anomaly_mask = z_scores.abs() > threshold
        indices = series.index[anomaly_mask].tolist()

        return AnomalyResult(
            column=str(series.name or ""),
            method=AnomalyMethod.Z_SCORE,
            anomaly_count=len(indices),
            anomaly_indices=indices,
            threshold=threshold,
            statistics={"mean": mean, "std": std, "max_zscore": float(z_scores.abs().max())},
        )

    def detect_iqr(
        self,
        series: pd.Series,  # type: ignore[type-arg]
        multiplier: float = 1.5,
    ) -> AnomalyResult:
        """Detect anomalies using the inter-quartile range (IQR) method.

        A value is anomalous if it lies below ``Q1 - multiplier * IQR``
        or above ``Q3 + multiplier * IQR``.

        Args:
            series: Numeric pandas Series.
            multiplier: IQR fence multiplier (default ``1.5``).

        Returns:
            Detection result.
        """
        q1 = float(series.quantile(0.25))
        q3 = float(series.quantile(0.75))
        iqr = q3 - q1
        lower = q1 - multiplier * iqr
        upper = q3 + multiplier * iqr

        anomaly_mask = (series < lower) | (series > upper)
        indices = series.index[anomaly_mask].tolist()

        return AnomalyResult(
            column=str(series.name or ""),
            method=AnomalyMethod.IQR,
            anomaly_count=len(indices),
            anomaly_indices=indices,
            threshold=multiplier,
            statistics={"q1": q1, "q3": q3, "iqr": iqr, "lower": lower, "upper": upper},
        )

    def detect_modified_zscore(
        self,
        series: pd.Series,  # type: ignore[type-arg]
        threshold: float = 3.5,
    ) -> AnomalyResult:
        """Detect anomalies using the modified Z-score (MAD-based).

        The modified Z-score is computed as
        ``0.6745 * (x - median) / MAD`` where ``MAD`` is the median
        absolute deviation.  More robust to outliers than standard Z-score.

        Args:
            series: Numeric pandas Series.
            threshold: Modified Z-score cutoff (default ``3.5``).

        Returns:
            Detection result.
        """
        median = float(series.median())
        mad = float((series - median).abs().median())

        if mad == 0.0:
            return AnomalyResult(
                column=str(series.name or ""),
                method=AnomalyMethod.MODIFIED_Z_SCORE,
                anomaly_count=0,
                anomaly_indices=[],
                threshold=threshold,
                statistics={"median": median, "mad": mad},
            )

        # 0.6745 is the 0.75th quantile of the standard normal distribution
        modified_z = 0.6745 * (series - median) / mad
        anomaly_mask = modified_z.abs() > threshold
        indices = series.index[anomaly_mask].tolist()

        return AnomalyResult(
            column=str(series.name or ""),
            method=AnomalyMethod.MODIFIED_Z_SCORE,
            anomaly_count=len(indices),
            anomaly_indices=indices,
            threshold=threshold,
            statistics={
                "median": median,
                "mad": mad,
                "max_modified_zscore": float(modified_z.abs().max()),
            },
        )

    def detect_time_series_anomalies(
        self,
        df: pd.DataFrame,
        date_col: str,
        value_col: str,
        window: int = 7,
        *,
        n_std: float = 2.0,
    ) -> AnomalyResult:
        """Detect anomalies in a time series using rolling statistics.

        A point is anomalous if it deviates more than *n_std* standard
        deviations from the rolling mean computed over a centred window.

        Args:
            df: DataFrame containing both the date and value columns.
            date_col: Column with datetime values (used for sorting).
            value_col: Numeric column to analyse.
            window: Rolling window size in rows.
            n_std: Number of standard deviations for the anomaly threshold.

        Returns:
            Detection result.
        """
        if date_col not in df.columns or value_col not in df.columns:
            missing = [c for c in (date_col, value_col) if c not in df.columns]
            self._log.error("missing_columns", columns=missing)
            return AnomalyResult(
                column=value_col,
                method=AnomalyMethod.Z_SCORE,
                anomaly_count=0,
                threshold=n_std,
                statistics={"error": f"Missing columns: {missing}"},
            )

        sorted_df = df.sort_values(date_col).reset_index(drop=True)
        series = sorted_df[value_col].astype(float)

        rolling_mean = series.rolling(window=window, center=True, min_periods=1).mean()
        rolling_std = series.rolling(window=window, center=True, min_periods=1).std(ddof=1).fillna(0.0)

        deviation = (series - rolling_mean).abs()
        anomaly_mask = deviation > (n_std * rolling_std)
        # Map back to original indices if possible
        anomaly_indices = sorted_df.index[anomaly_mask].tolist()

        return AnomalyResult(
            column=value_col,
            method=AnomalyMethod.Z_SCORE,
            anomaly_count=int(anomaly_mask.sum()),
            anomaly_indices=anomaly_indices,
            threshold=n_std,
            statistics={
                "window": window,
                "mean_rolling_mean": float(rolling_mean.mean()),
                "mean_rolling_std": float(rolling_std.mean()),
            },
        )

    def detect_categorical_drift(
        self,
        current: pd.Series,  # type: ignore[type-arg]
        reference: pd.Series,  # type: ignore[type-arg]
    ) -> dict[str, Any]:
        """Detect distribution changes in a categorical column using chi-square.

        Compares the frequency distributions of *current* and *reference* using
        a chi-square goodness-of-fit test.

        Args:
            current: Current categorical data.
            reference: Reference / baseline categorical data.

        Returns:
            Dict with keys ``drifted``, ``statistic``, ``p_value``,
            ``current_distribution``, and ``reference_distribution``.
        """
        ref_counts = reference.value_counts(normalize=True)
        cur_counts = current.value_counts()

        # Align categories
        all_categories = sorted(set(ref_counts.index) | set(cur_counts.index))
        observed = np.array([cur_counts.get(c, 0) for c in all_categories], dtype=float)
        expected_proportions = np.array(
            [ref_counts.get(c, 0.0) for c in all_categories], dtype=float,
        )

        total = observed.sum()
        if total == 0 or expected_proportions.sum() == 0:
            self._log.warning("empty_distribution_for_drift")
            return {
                "drifted": False,
                "statistic": 0.0,
                "p_value": 1.0,
                "current_distribution": {},
                "reference_distribution": {},
            }

        # Normalise expected to match total observations
        expected = expected_proportions / expected_proportions.sum() * total
        # Avoid zero expected counts
        expected = np.where(expected == 0, 1e-10, expected)

        chi2, p_value = scipy_stats.chisquare(observed, f_exp=expected)

        self._log.info(
            "categorical_drift_test",
            chi2=float(chi2),
            p_value=float(p_value),
            categories=len(all_categories),
        )
        return {
            "drifted": bool(p_value < 0.05),
            "statistic": float(chi2),
            "p_value": float(p_value),
            "current_distribution": {
                c: int(observed[i]) for i, c in enumerate(all_categories)
            },
            "reference_distribution": {
                c: float(expected[i]) for i, c in enumerate(all_categories)
            },
        }

    def detect_data_drift(
        self,
        current_df: pd.DataFrame,
        reference_df: pd.DataFrame,
        columns: list[str] | None = None,
        *,
        significance: float = 0.05,
    ) -> dict[str, Any]:
        """Detect numerical data drift using the Kolmogorov-Smirnov test.

        For each column the two-sample KS test is applied to compare the
        distribution of *current_df* against *reference_df*.

        Args:
            current_df: Current dataset.
            reference_df: Reference / baseline dataset.
            columns: Columns to test. Defaults to shared numeric columns.
            significance: p-value threshold for declaring drift.

        Returns:
            Dict with per-column results and an overall ``drifted`` flag.
        """
        if columns is None:
            cur_numeric = set(
                current_df.select_dtypes(include=[np.number]).columns,
            )
            ref_numeric = set(
                reference_df.select_dtypes(include=[np.number]).columns,
            )
            columns = sorted(cur_numeric & ref_numeric)

        column_results: dict[str, dict[str, Any]] = {}
        any_drifted = False

        for col in columns:
            if col not in current_df.columns or col not in reference_df.columns:
                self._log.warning("drift_column_missing", column=col)
                continue

            cur_vals = current_df[col].dropna().values
            ref_vals = reference_df[col].dropna().values

            if len(cur_vals) == 0 or len(ref_vals) == 0:
                column_results[col] = {
                    "drifted": False,
                    "statistic": 0.0,
                    "p_value": 1.0,
                }
                continue

            ks_stat, p_value = scipy_stats.ks_2samp(cur_vals, ref_vals)
            drifted = bool(p_value < significance)
            if drifted:
                any_drifted = True

            column_results[col] = {
                "drifted": drifted,
                "statistic": float(ks_stat),
                "p_value": float(p_value),
            }

        self._log.info(
            "data_drift_detection_complete",
            columns_tested=len(column_results),
            drifted_columns=sum(
                1 for v in column_results.values() if v["drifted"]
            ),
        )
        return {
            "drifted": any_drifted,
            "significance": significance,
            "columns": column_results,
        }

    @staticmethod
    def get_anomaly_report(results: list[AnomalyResult]) -> dict[str, Any]:
        """Build a formatted summary report from detection results.

        Args:
            results: List of anomaly results to summarise.

        Returns:
            Dict with ``total_anomalies``, ``columns_checked``, and
            per-column breakdowns.
        """
        total = sum(r.anomaly_count for r in results)
        column_details = [
            {
                "column": r.column,
                "method": r.method.value,
                "anomaly_count": r.anomaly_count,
                "threshold": r.threshold,
                "statistics": r.statistics,
            }
            for r in results
        ]
        return {
            "total_anomalies": total,
            "columns_checked": len(results),
            "column_details": column_details,
        }

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _detect_isolation_forest(
        self,
        series: pd.Series,  # type: ignore[type-arg]
        contamination: float = 0.1,
    ) -> AnomalyResult:
        """Detect anomalies with a lightweight isolation-forest analogue.

        Uses a simplified scoring approach based on random recursive
        partitioning depths, avoiding a hard dependency on scikit-learn.

        Args:
            series: Numeric pandas Series.
            contamination: Expected proportion of anomalies.

        Returns:
            Detection result.
        """
        values = series.values.reshape(-1, 1).astype(float)
        n_samples = len(values)

        if n_samples < 2:
            return AnomalyResult(
                column=str(series.name or ""),
                method=AnomalyMethod.ISOLATION_FOREST,
                anomaly_count=0,
                anomaly_indices=[],
                threshold=contamination,
                statistics={},
            )

        rng = np.random.default_rng(seed=42)
        n_trees = 100
        max_depth = int(np.ceil(np.log2(max(n_samples, 2))))

        scores = np.zeros(n_samples, dtype=float)

        for _ in range(n_trees):
            sample_idx = rng.choice(n_samples, size=min(256, n_samples), replace=False)
            sample = values[sample_idx].ravel()
            depths = self._isolation_tree_depth(values.ravel(), sample, max_depth, rng)
            scores += depths

        scores /= n_trees
        # Normalise: shorter average path ⇒ more anomalous
        c_n = self._avg_path_length(n_samples)
        anomaly_scores = 2.0 ** (-scores / max(c_n, 1e-10))

        cutoff = np.quantile(anomaly_scores, 1.0 - contamination)
        anomaly_mask = anomaly_scores >= cutoff
        indices = series.index[anomaly_mask].tolist()

        return AnomalyResult(
            column=str(series.name or ""),
            method=AnomalyMethod.ISOLATION_FOREST,
            anomaly_count=len(indices),
            anomaly_indices=indices,
            threshold=contamination,
            statistics={
                "n_trees": n_trees,
                "max_depth": max_depth,
                "score_cutoff": float(cutoff),
                "mean_anomaly_score": float(anomaly_scores.mean()),
            },
        )

    @staticmethod
    def _isolation_tree_depth(
        values: np.ndarray,
        sample: np.ndarray,
        max_depth: int,
        rng: np.random.Generator,
    ) -> np.ndarray:
        """Compute isolation depth for each value against a random tree."""
        n = len(values)
        depths = np.zeros(n, dtype=float)
        lo, hi = float(sample.min()), float(sample.max())

        if lo >= hi:
            return depths

        for _ in range(max_depth):
            split = rng.uniform(lo, hi)
            left_mask = values <= split
            right_mask = ~left_mask

            left_count = int(left_mask.sum())
            right_count = int(right_mask.sum())

            # Increment depth for the minority side
            if left_count <= right_count:
                depths[left_mask] += 1
            else:
                depths[right_mask] += 1

            # Narrow the range for next split
            lo = split if left_count > right_count else lo
            hi = split if left_count <= right_count else hi

            if abs(hi - lo) < 1e-12:
                break

        return depths

    @staticmethod
    def _avg_path_length(n: int) -> float:
        """Average path length of an unsuccessful search in a BST."""
        if n <= 1:
            return 0.0
        if n == 2:
            return 1.0
        harmonic = np.log(n - 1) + 0.5772156649
        return 2.0 * harmonic - 2.0 * (n - 1) / n
