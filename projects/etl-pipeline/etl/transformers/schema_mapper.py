"""Schema mapping and transformation utilities.

Provides column renaming, type conversion, data normalisation, custom
column transforms, and SCD Type 2 change detection.
"""

from __future__ import annotations

from collections.abc import Callable
from enum import Enum
from typing import Any

import numpy as np
import pandas as pd
import structlog
from pydantic import BaseModel, Field

from etl.transformers.base_transformer import BaseTransformer, TransformError

logger: structlog.stdlib.BoundLogger = structlog.get_logger(__name__)

__all__ = [
    "SchemaMapper",
    "SchemaMapping",
    "NormalizationType",
    "SCDChangeResult",
]


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class NormalizationType(str, Enum):
    """Supported normalisation strategies."""

    MIN_MAX = "min_max"
    Z_SCORE = "z_score"
    LOG = "log"
    CUSTOM = "custom"


# ---------------------------------------------------------------------------
# Configuration / result models
# ---------------------------------------------------------------------------

class ColumnTransformSpec(BaseModel):
    """Specification for a single column transformation.

    The ``function`` field is not serialisable via Pydantic by default, so we
    mark the model with ``arbitrary_types_allowed``.
    """

    column: str
    function: Callable[[pd.Series], pd.Series]

    model_config = {"arbitrary_types_allowed": True}


class NormalizationSpec(BaseModel):
    """Configuration for normalising a column."""

    column: str
    method: NormalizationType = NormalizationType.MIN_MAX
    custom_fn: Callable[[pd.Series], pd.Series] | None = None

    model_config = {"arbitrary_types_allowed": True}


class SchemaMapping(BaseModel):
    """Full schema-mapping configuration.

    All fields are optional; only configured steps will execute.
    """

    column_renames: dict[str, str] = Field(
        default_factory=dict,
        description="Source column → target column name mapping",
    )
    type_conversions: dict[str, str] = Field(
        default_factory=dict,
        description="Column → target dtype mapping",
    )
    normalizations: list[NormalizationSpec] = Field(
        default_factory=list,
        description="Per-column normalisation specs",
    )
    custom_transforms: list[ColumnTransformSpec] = Field(
        default_factory=list,
        description="Per-column callable transforms",
    )

    model_config = {"arbitrary_types_allowed": True}


class SCDChangeResult(BaseModel):
    """Result of an SCD Type 2 change-detection comparison.

    Attributes:
        new: Rows present in *current* but not in *previous*.
        changed: Rows present in both but with differing tracked columns.
        unchanged: Rows identical across both DataFrames.
    """

    new: int = Field(ge=0)
    changed: int = Field(ge=0)
    unchanged: int = Field(ge=0)

    model_config = {"arbitrary_types_allowed": True}


# ---------------------------------------------------------------------------
# SchemaMapper
# ---------------------------------------------------------------------------

class SchemaMapper(BaseTransformer):
    """Schema mapping and transformation transformer.

    Parameters:
        name: Human-readable identifier.
        mapping: A :class:`SchemaMapping` controlling the pipeline.
    """

    def __init__(self, name: str, mapping: SchemaMapping | None = None) -> None:
        super().__init__(name)
        self.mapping = mapping or SchemaMapping()

    # ------------------------------------------------------------------
    # Public mapping methods
    # ------------------------------------------------------------------

    def map_columns(
        self,
        df: pd.DataFrame,
        rename_map: dict[str, str],
    ) -> pd.DataFrame:
        """Rename columns according to *rename_map*.

        Args:
            df: Input DataFrame.
            rename_map: ``{old_name: new_name}`` mapping.

        Returns:
            DataFrame with renamed columns.
        """
        missing = [c for c in rename_map if c not in df.columns]
        if missing:
            self._log.warning("map_columns_missing", missing=missing)

        valid_map = {k: v for k, v in rename_map.items() if k in df.columns}
        result = df.rename(columns=valid_map)

        self._log.info(
            "columns_mapped",
            mapped=len(valid_map),
            skipped=len(missing),
        )
        return result

    def convert_types(
        self,
        df: pd.DataFrame,
        type_rules: dict[str, str],
    ) -> pd.DataFrame:
        """Convert column dtypes.

        Supports pandas dtype strings (e.g. ``"int64"``, ``"float32"``,
        ``"datetime64[ns]"``, ``"category"``).

        Args:
            df: Input DataFrame.
            type_rules: ``{column: target_dtype}`` mapping.

        Returns:
            DataFrame with converted dtypes.

        Raises:
            TransformError: If a conversion fails.
        """
        df = df.copy()
        for col, dtype in type_rules.items():
            if col not in df.columns:
                self._log.warning("convert_types_column_missing", column=col)
                continue
            try:
                if dtype.startswith("datetime"):
                    df[col] = pd.to_datetime(df[col])
                else:
                    df[col] = df[col].astype(dtype)
            except (ValueError, TypeError) as exc:
                raise TransformError(
                    f"Type conversion failed for column '{col}' → {dtype}: {exc}",
                    transformer=self.name,
                    cause=exc,
                ) from exc

        self._log.info("types_converted", columns=list(type_rules.keys()))
        return df

    def normalize_data(
        self,
        df: pd.DataFrame,
        specs: list[NormalizationSpec],
    ) -> pd.DataFrame:
        """Normalise columns according to *specs*.

        Args:
            df: Input DataFrame.
            specs: List of :class:`NormalizationSpec` objects.

        Returns:
            DataFrame with normalised columns.

        Raises:
            TransformError: If normalisation fails.
        """
        df = df.copy()
        for spec in specs:
            col = spec.column
            if col not in df.columns:
                self._log.warning("normalize_column_missing", column=col)
                continue
            if not pd.api.types.is_numeric_dtype(df[col]):
                self._log.warning("normalize_non_numeric_skipped", column=col)
                continue

            try:
                match spec.method:
                    case NormalizationType.MIN_MAX:
                        mn, mx = df[col].min(), df[col].max()
                        rng = mx - mn
                        df[col] = (
                            (df[col] - mn) / rng if rng != 0
                            else pd.Series(0.0, index=df.index)
                        )
                    case NormalizationType.Z_SCORE:
                        mean = df[col].mean()
                        std = df[col].std()
                        df[col] = (
                            (df[col] - mean) / std if std != 0
                            else pd.Series(0.0, index=df.index)
                        )
                    case NormalizationType.LOG:
                        if (df[col] <= 0).any():
                            raise TransformError(
                                f"Log normalisation requires positive values in '{col}'",
                                transformer=self.name,
                            )
                        df[col] = np.log(df[col])
                    case NormalizationType.CUSTOM:
                        if spec.custom_fn is None:
                            raise TransformError(
                                f"Custom normalisation for '{col}' requires a custom_fn",
                                transformer=self.name,
                            )
                        df[col] = spec.custom_fn(df[col])
            except TransformError:
                raise
            except Exception as exc:
                raise TransformError(
                    f"Normalisation failed for column '{col}': {exc}",
                    transformer=self.name,
                    cause=exc,
                ) from exc

            self._log.debug(
                "column_normalized",
                column=col,
                method=spec.method.value,
            )

        return df

    def apply_custom_transforms(
        self,
        df: pd.DataFrame,
        transforms: list[ColumnTransformSpec],
    ) -> pd.DataFrame:
        """Apply arbitrary callables to columns.

        Args:
            df: Input DataFrame.
            transforms: Sequence of :class:`ColumnTransformSpec` entries.

        Returns:
            DataFrame with custom transforms applied.

        Raises:
            TransformError: If a callable raises.
        """
        df = df.copy()
        for spec in transforms:
            col = spec.column
            if col not in df.columns:
                self._log.warning("custom_transform_column_missing", column=col)
                continue
            try:
                df[col] = spec.function(df[col])
            except Exception as exc:
                raise TransformError(
                    f"Custom transform failed for column '{col}': {exc}",
                    transformer=self.name,
                    cause=exc,
                ) from exc

            self._log.debug("custom_transform_applied", column=col)

        return df

    def detect_scd_changes(
        self,
        current: pd.DataFrame,
        previous: pd.DataFrame,
        *,
        key_columns: list[str],
        tracked_columns: list[str],
    ) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, SCDChangeResult]:
        """Detect SCD Type 2 changes between two snapshots.

        Compares *current* with *previous* using *key_columns* as the
        business key.  Tracked columns are checked for value changes.

        Args:
            current: The new / incoming DataFrame.
            previous: The existing / historical DataFrame.
            key_columns: Columns forming the business key.
            tracked_columns: Columns whose changes should trigger a new version.

        Returns:
            A tuple of ``(new_df, changed_df, unchanged_df, summary)``.
        """
        compare_cols = key_columns + tracked_columns

        for label, frame in [("current", current), ("previous", previous)]:
            missing = [c for c in compare_cols if c not in frame.columns]
            if missing:
                raise TransformError(
                    f"SCD detection: {label} DataFrame missing columns {missing}",
                    transformer=self.name,
                )

        merged = current.merge(
            previous,
            on=key_columns,
            how="outer",
            suffixes=("_current", "_previous"),
            indicator=True,
        )

        # New rows: only in current
        new_mask = merged["_merge"] == "left_only"
        new_keys = merged.loc[new_mask, key_columns]
        new_df = current.merge(new_keys, on=key_columns, how="inner")

        # Existing in both – check tracked columns for changes
        both_mask = merged["_merge"] == "both"
        both = merged[both_mask]

        changed_key_mask = pd.Series(False, index=both.index)
        for col in tracked_columns:
            current_col = f"{col}_current"
            previous_col = f"{col}_previous"
            changed_key_mask = changed_key_mask | (
                both[current_col].astype(str) != both[previous_col].astype(str)
            )

        changed_keys = both.loc[changed_key_mask, key_columns]
        changed_df = current.merge(changed_keys, on=key_columns, how="inner")

        unchanged_keys = both.loc[~changed_key_mask, key_columns]
        unchanged_df = current.merge(unchanged_keys, on=key_columns, how="inner")

        summary = SCDChangeResult(
            new=len(new_df),
            changed=len(changed_df),
            unchanged=len(unchanged_df),
        )

        self._log.info(
            "scd_changes_detected",
            new=summary.new,
            changed=summary.changed,
            unchanged=summary.unchanged,
        )

        return new_df, changed_df, unchanged_df, summary

    # ------------------------------------------------------------------
    # BaseTransformer interface
    # ------------------------------------------------------------------

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Apply all configured schema-mapping steps.

        Steps execute in order:
        1. Column renaming
        2. Type conversions
        3. Normalisation
        4. Custom transforms

        Args:
            df: Input DataFrame.

        Returns:
            Transformed DataFrame.
        """
        m = self.mapping

        if m.column_renames:
            df = self.map_columns(df, m.column_renames)

        if m.type_conversions:
            df = self.convert_types(df, m.type_conversions)

        if m.normalizations:
            df = self.normalize_data(df, m.normalizations)

        if m.custom_transforms:
            df = self.apply_custom_transforms(df, m.custom_transforms)

        return df

    def validate(self, df: pd.DataFrame) -> bool:
        """Return ``True`` if *df* is non-empty."""
        return not df.empty
