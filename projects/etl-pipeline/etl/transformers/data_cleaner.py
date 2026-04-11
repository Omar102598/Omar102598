"""Comprehensive data-cleaning transformer.

Provides configurable null handling, deduplication, type casting,
string normalisation, and outlier treatment.
"""

from __future__ import annotations

import re
from difflib import SequenceMatcher
from enum import Enum
from typing import Any, Literal

import pandas as pd
import structlog
from pydantic import BaseModel, Field

from etl.transformers.base_transformer import BaseTransformer, TransformError

logger: structlog.stdlib.BoundLogger = structlog.get_logger(__name__)

__all__ = [
    "DataCleaner",
    "NullHandlingStrategy",
    "OutlierMethod",
    "CleaningConfig",
]


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class NullHandlingStrategy(str, Enum):
    """Strategy for handling null / missing values."""

    DROP = "drop"
    FILL_MEAN = "fill_mean"
    FILL_MEDIAN = "fill_median"
    FILL_MODE = "fill_mode"
    FILL_CONSTANT = "fill_constant"
    INTERPOLATE = "interpolate"


class OutlierMethod(str, Enum):
    """Action to take on detected outliers."""

    CAP = "cap"
    REMOVE = "remove"
    FLAG = "flag"


# ---------------------------------------------------------------------------
# Configuration models
# ---------------------------------------------------------------------------

class NullHandlingConfig(BaseModel):
    """Per-column null-handling configuration."""

    strategy: NullHandlingStrategy = NullHandlingStrategy.DROP
    fill_value: Any = None

    model_config = {"arbitrary_types_allowed": True}


class DeduplicationConfig(BaseModel):
    """Deduplication settings."""

    subset: list[str] | None = None
    fuzzy: bool = False
    fuzzy_threshold: float = Field(
        default=0.85,
        ge=0.0,
        le=1.0,
        description="Similarity ratio above which rows are considered duplicates",
    )
    fuzzy_columns: list[str] | None = None


class OutlierConfig(BaseModel):
    """Outlier-treatment settings."""

    columns: list[str] = Field(default_factory=list)
    method: OutlierMethod = OutlierMethod.CAP
    iqr_multiplier: float = Field(
        default=1.5,
        gt=0.0,
        description="IQR multiplier for fence calculation",
    )


class TypeCastConfig(BaseModel):
    """Column type-casting mapping."""

    type_map: dict[str, str] = Field(
        default_factory=dict,
        description="Mapping of column name → target dtype string",
    )


class StringNormalizeConfig(BaseModel):
    """String normalisation settings."""

    columns: list[str] = Field(default_factory=list)
    trim: bool = True
    case: Literal["lower", "upper", "none"] = "none"
    remove_special_chars: bool = False
    special_char_pattern: str = Field(
        default=r"[^a-zA-Z0-9\s]",
        description="Regex pattern of characters to remove",
    )


class CleaningConfig(BaseModel):
    """Top-level cleaning pipeline configuration.

    Each field controls whether (and how) a cleaning step runs.
    Steps execute in a fixed, deterministic order.
    """

    null_handling: dict[str, NullHandlingConfig] | None = Field(
        default=None,
        description="Per-column null strategies. Key '*' applies globally.",
    )
    deduplication: DeduplicationConfig | None = None
    type_casting: TypeCastConfig | None = None
    string_normalize: StringNormalizeConfig | None = None
    outlier_treatment: OutlierConfig | None = None


# ---------------------------------------------------------------------------
# DataCleaner
# ---------------------------------------------------------------------------

class DataCleaner(BaseTransformer):
    """Configurable data-cleaning transformer.

    Parameters:
        name: Human-readable identifier.
        config: A :class:`CleaningConfig` driving the pipeline.
    """

    def __init__(self, name: str, config: CleaningConfig | None = None) -> None:
        super().__init__(name)
        self.config = config or CleaningConfig()

    # ------------------------------------------------------------------
    # Public cleaning methods
    # ------------------------------------------------------------------

    def handle_nulls(
        self,
        df: pd.DataFrame,
        strategies: dict[str, NullHandlingConfig],
    ) -> pd.DataFrame:
        """Handle null values according to per-column strategies.

        A key of ``"*"`` is treated as the default strategy for any column
        not explicitly listed.

        Args:
            df: Input DataFrame.
            strategies: Mapping of *column name → config*.

        Returns:
            DataFrame with nulls handled.
        """
        df = df.copy()
        default = strategies.get("*")

        for col in df.columns:
            if df[col].isna().sum() == 0:
                continue

            cfg = strategies.get(col, default)
            if cfg is None:
                continue

            match cfg.strategy:
                case NullHandlingStrategy.DROP:
                    df = df.dropna(subset=[col])
                case NullHandlingStrategy.FILL_MEAN:
                    if pd.api.types.is_numeric_dtype(df[col]):
                        df[col] = df[col].fillna(df[col].mean())
                    else:
                        self._log.warning(
                            "fill_mean_skipped_non_numeric", column=col,
                        )
                case NullHandlingStrategy.FILL_MEDIAN:
                    if pd.api.types.is_numeric_dtype(df[col]):
                        df[col] = df[col].fillna(df[col].median())
                    else:
                        self._log.warning(
                            "fill_median_skipped_non_numeric", column=col,
                        )
                case NullHandlingStrategy.FILL_MODE:
                    mode_vals = df[col].mode()
                    if not mode_vals.empty:
                        df[col] = df[col].fillna(mode_vals.iloc[0])
                case NullHandlingStrategy.FILL_CONSTANT:
                    df[col] = df[col].fillna(cfg.fill_value)
                case NullHandlingStrategy.INTERPOLATE:
                    if pd.api.types.is_numeric_dtype(df[col]):
                        df[col] = df[col].interpolate()
                    else:
                        self._log.warning(
                            "interpolate_skipped_non_numeric", column=col,
                        )

            self._log.debug(
                "nulls_handled",
                column=col,
                strategy=cfg.strategy.value,
            )

        return df

    def deduplicate(
        self,
        df: pd.DataFrame,
        *,
        subset: list[str] | None = None,
        fuzzy: bool = False,
        fuzzy_threshold: float = 0.85,
        fuzzy_columns: list[str] | None = None,
    ) -> pd.DataFrame:
        """Remove duplicate rows.

        Args:
            df: Input DataFrame.
            subset: Columns to consider for exact dedup.
            fuzzy: If ``True``, use fuzzy matching instead of exact.
            fuzzy_threshold: Similarity ratio (0–1) for fuzzy matching.
            fuzzy_columns: Columns used for fuzzy comparison.

        Returns:
            Deduplicated DataFrame.
        """
        before = len(df)

        if not fuzzy:
            df = df.drop_duplicates(subset=subset).reset_index(drop=True)
        else:
            df = self._fuzzy_deduplicate(
                df,
                columns=fuzzy_columns or subset or list(df.columns),
                threshold=fuzzy_threshold,
            )

        self._log.info(
            "deduplicated",
            before=before,
            after=len(df),
            removed=before - len(df),
            fuzzy=fuzzy,
        )
        return df

    def cast_types(
        self,
        df: pd.DataFrame,
        type_map: dict[str, str],
    ) -> pd.DataFrame:
        """Cast columns to specified dtypes.

        Args:
            df: Input DataFrame.
            type_map: Column name → target dtype (e.g. ``{"age": "int64"}``).

        Returns:
            DataFrame with updated dtypes.

        Raises:
            TransformError: If a cast fails.
        """
        df = df.copy()
        for col, dtype in type_map.items():
            if col not in df.columns:
                self._log.warning("cast_types_column_missing", column=col)
                continue
            try:
                df[col] = df[col].astype(dtype)
            except (ValueError, TypeError) as exc:
                raise TransformError(
                    f"Cannot cast column '{col}' to {dtype}: {exc}",
                    transformer=self.name,
                    cause=exc,
                ) from exc
        return df

    def normalize_strings(
        self,
        df: pd.DataFrame,
        *,
        columns: list[str] | None = None,
        trim: bool = True,
        case: Literal["lower", "upper", "none"] = "none",
        remove_special_chars: bool = False,
        special_char_pattern: str = r"[^a-zA-Z0-9\s]",
    ) -> pd.DataFrame:
        """Normalise string columns.

        Args:
            df: Input DataFrame.
            columns: Columns to normalise. ``None`` means all object columns.
            trim: Strip leading/trailing whitespace.
            case: Convert case (``"lower"``, ``"upper"``, or ``"none"``).
            remove_special_chars: Remove characters matching *special_char_pattern*.
            special_char_pattern: Regex for characters to strip.

        Returns:
            DataFrame with normalised strings.
        """
        df = df.copy()
        target_cols = columns or [
            c for c in df.columns if pd.api.types.is_string_dtype(df[c])
        ]

        for col in target_cols:
            if col not in df.columns:
                continue
            series = df[col].copy()
            if not pd.api.types.is_string_dtype(series):
                continue

            if trim:
                series = series.str.strip()
            match case:
                case "lower":
                    series = series.str.lower()
                case "upper":
                    series = series.str.upper()
            if remove_special_chars:
                compiled = re.compile(special_char_pattern)
                series = series.apply(
                    lambda v, _p=compiled: _p.sub("", v) if isinstance(v, str) else v,
                )
            df[col] = series

        self._log.debug("strings_normalized", columns=target_cols)
        return df

    def handle_outliers(
        self,
        df: pd.DataFrame,
        *,
        columns: list[str],
        method: OutlierMethod = OutlierMethod.CAP,
        iqr_multiplier: float = 1.5,
    ) -> pd.DataFrame:
        """Detect and treat outliers using the IQR method.

        Args:
            df: Input DataFrame.
            columns: Numeric columns to inspect.
            method: ``CAP`` clips to fences, ``REMOVE`` drops rows,
                ``FLAG`` adds ``<col>_outlier`` boolean columns.
            iqr_multiplier: Multiplier for IQR fence calculation.

        Returns:
            DataFrame with outliers treated.
        """
        df = df.copy()

        for col in columns:
            if col not in df.columns or not pd.api.types.is_numeric_dtype(df[col]):
                self._log.warning("outlier_column_skipped", column=col)
                continue

            q1 = df[col].quantile(0.25)
            q3 = df[col].quantile(0.75)
            iqr = q3 - q1
            lower = q1 - iqr_multiplier * iqr
            upper = q3 + iqr_multiplier * iqr

            outlier_mask = (df[col] < lower) | (df[col] > upper)
            outlier_count = int(outlier_mask.sum())

            match method:
                case OutlierMethod.CAP:
                    df[col] = df[col].clip(lower=lower, upper=upper)
                case OutlierMethod.REMOVE:
                    df = df[~outlier_mask].reset_index(drop=True)
                case OutlierMethod.FLAG:
                    df[f"{col}_outlier"] = outlier_mask

            self._log.info(
                "outliers_handled",
                column=col,
                method=method.value,
                outlier_count=outlier_count,
                lower_fence=round(lower, 4),
                upper_fence=round(upper, 4),
            )

        return df

    # ------------------------------------------------------------------
    # BaseTransformer interface
    # ------------------------------------------------------------------

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Run the configured cleaning pipeline.

        Steps execute in the following order:
        1. Null handling
        2. Deduplication
        3. Type casting
        4. String normalisation
        5. Outlier treatment

        Args:
            df: Input DataFrame.

        Returns:
            Cleaned DataFrame.
        """
        cfg = self.config

        if cfg.null_handling:
            df = self.handle_nulls(df, cfg.null_handling)

        if cfg.deduplication:
            dc = cfg.deduplication
            df = self.deduplicate(
                df,
                subset=dc.subset,
                fuzzy=dc.fuzzy,
                fuzzy_threshold=dc.fuzzy_threshold,
                fuzzy_columns=dc.fuzzy_columns,
            )

        if cfg.type_casting:
            df = self.cast_types(df, cfg.type_casting.type_map)

        if cfg.string_normalize:
            sn = cfg.string_normalize
            df = self.normalize_strings(
                df,
                columns=sn.columns or None,
                trim=sn.trim,
                case=sn.case,
                remove_special_chars=sn.remove_special_chars,
                special_char_pattern=sn.special_char_pattern,
            )

        if cfg.outlier_treatment:
            ot = cfg.outlier_treatment
            df = self.handle_outliers(
                df,
                columns=ot.columns,
                method=ot.method,
                iqr_multiplier=ot.iqr_multiplier,
            )

        return df

    def validate(self, df: pd.DataFrame) -> bool:
        """Return ``True`` if *df* is non-empty and has at least one column."""
        return not df.empty and len(df.columns) > 0

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _fuzzy_deduplicate(
        self,
        df: pd.DataFrame,
        *,
        columns: list[str],
        threshold: float,
    ) -> pd.DataFrame:
        """Remove rows that are fuzzy-duplicates based on *columns*.

        Uses :class:`difflib.SequenceMatcher` to compare concatenated string
        representations of the selected columns.
        """
        kept_indices: list[int] = []
        seen_strings: list[str] = []

        combined = df[columns].astype(str).agg(" ".join, axis=1)

        for idx, value in combined.items():
            is_dup = False
            for seen in seen_strings:
                ratio = SequenceMatcher(None, value, seen).ratio()
                if ratio >= threshold:
                    is_dup = True
                    break
            if not is_dup:
                kept_indices.append(int(idx))  # type: ignore[arg-type]
                seen_strings.append(value)

        return df.loc[kept_indices].reset_index(drop=True)
