"""AI-enhanced data profiling for pandas DataFrames."""

from __future__ import annotations

from typing import Any

import pandas as pd
from pydantic import BaseModel, Field

from etl.ai.openai_client import OpenAIClient, OpenAIClientError

__all__ = ["AIDataProfiler", "DataProfile", "ColumnProfile"]

_TOP_VALUES_LIMIT: int = 10
_SAMPLE_ROWS_FOR_AI: int = 20


class ColumnProfile(BaseModel):
    """Statistical profile for a single DataFrame column."""

    name: str
    dtype: str
    null_count: int = 0
    null_pct: float = 0.0
    unique_count: int = 0
    min: Any | None = None
    max: Any | None = None
    mean: float | None = None
    std: float | None = None
    top_values: list[tuple[Any, int]] = Field(default_factory=list)
    ai_description: str = ""


class DataProfile(BaseModel):
    """Full profile for a DataFrame."""

    columns: dict[str, ColumnProfile] = Field(default_factory=dict)
    row_count: int = 0
    quality_score: float = 0.0
    ai_insights: list[str] = Field(default_factory=list)


class AIDataProfiler:
    """Generate comprehensive data profiles augmented by AI insights.

    Parameters
    ----------
    client:
        An ``OpenAIClient`` used for generating AI descriptions and insights.
    """

    def __init__(self, client: OpenAIClient) -> None:
        self._client = client

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def profile(self, df: pd.DataFrame) -> DataProfile:
        """Return a full ``DataProfile`` for *df*."""
        stats = self._compute_statistics(df)
        quality = self._calculate_quality_score(df)
        ai_insights = self._generate_ai_insights(df, stats)

        return DataProfile(
            columns=stats,
            row_count=len(df),
            quality_score=quality,
            ai_insights=ai_insights,
        )

    def generate_report(self, profile: DataProfile) -> str:
        """Render *profile* as a Markdown report."""
        lines: list[str] = [
            "# Data Profile Report\n",
            f"**Rows:** {profile.row_count}  ",
            f"**Quality score:** {profile.quality_score:.1f} / 100\n",
        ]

        if profile.ai_insights:
            lines.append("## AI Insights\n")
            for insight in profile.ai_insights:
                lines.append(f"- {insight}")
            lines.append("")

        lines.append("## Column Details\n")
        lines.append(
            "| Column | Type | Nulls (%) | Unique | Min | Max | Mean | Std |"
        )
        lines.append(
            "|--------|------|-----------|--------|-----|-----|------|-----|"
        )
        for col_prof in profile.columns.values():
            lines.append(
                f"| {col_prof.name} "
                f"| {col_prof.dtype} "
                f"| {col_prof.null_pct:.1f}% "
                f"| {col_prof.unique_count} "
                f"| {_fmt(col_prof.min)} "
                f"| {_fmt(col_prof.max)} "
                f"| {_fmt(col_prof.mean)} "
                f"| {_fmt(col_prof.std)} |"
            )
        lines.append("")

        # Top values
        for col_prof in profile.columns.values():
            if col_prof.top_values:
                lines.append(f"### Top values for `{col_prof.name}`\n")
                for val, cnt in col_prof.top_values:
                    lines.append(f"- `{val}`: {cnt}")
                lines.append("")

        # AI descriptions
        described = [c for c in profile.columns.values() if c.ai_description]
        if described:
            lines.append("## AI Column Descriptions\n")
            for col_prof in described:
                lines.append(f"- **{col_prof.name}**: {col_prof.ai_description}")
            lines.append("")

        return "\n".join(lines)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _compute_statistics(
        self, df: pd.DataFrame
    ) -> dict[str, ColumnProfile]:
        """Compute basic descriptive statistics for every column in *df*."""
        profiles: dict[str, ColumnProfile] = {}
        row_count = len(df)

        for col in df.columns:
            series = df[col]
            null_count = int(series.isna().sum())
            null_pct = (null_count / row_count * 100.0) if row_count > 0 else 0.0
            unique_count = int(series.nunique(dropna=True))

            col_min: Any = None
            col_max: Any = None
            col_mean: float | None = None
            col_std: float | None = None

            if pd.api.types.is_numeric_dtype(series):
                col_min = series.min()
                col_max = series.max()
                col_mean = float(series.mean()) if not series.dropna().empty else None
                col_std = float(series.std()) if not series.dropna().empty else None
                # Convert numpy types to native Python for serialisation.
                col_min = _to_python(col_min)
                col_max = _to_python(col_max)
            elif pd.api.types.is_datetime64_any_dtype(series):
                col_min = str(series.min())
                col_max = str(series.max())

            # Top values by frequency.
            top_raw = series.value_counts(dropna=True).head(_TOP_VALUES_LIMIT)
            top_values = [
                (_to_python(val), int(cnt)) for val, cnt in top_raw.items()
            ]

            profiles[col] = ColumnProfile(
                name=col,
                dtype=str(series.dtype),
                null_count=null_count,
                null_pct=round(null_pct, 2),
                unique_count=unique_count,
                min=col_min,
                max=col_max,
                mean=round(col_mean, 4) if col_mean is not None else None,
                std=round(col_std, 4) if col_std is not None else None,
                top_values=top_values,
            )

        # Ask AI for short descriptions per column.
        self._enrich_with_ai_descriptions(df, profiles)
        return profiles

    def _enrich_with_ai_descriptions(
        self,
        df: pd.DataFrame,
        profiles: dict[str, ColumnProfile],
    ) -> None:
        """Add AI-generated column descriptions to *profiles* in-place."""
        col_info_lines = []
        for col, prof in profiles.items():
            samples = df[col].dropna().head(5).tolist()
            col_info_lines.append(
                f"  {col}: dtype={prof.dtype}, nulls={prof.null_pct}%, "
                f"unique={prof.unique_count}, samples={samples!r}"
            )

        prompt = (
            "For each column below, write a concise one-sentence description "
            "of what the column likely represents.\n\n"
            + "\n".join(col_info_lines)
            + "\n\nReturn a JSON object mapping column name to description string."
        )

        try:
            result = self._client.complete_json(
                prompt=prompt,
                system_prompt=(
                    "You are a data analyst. Respond with valid JSON only."
                ),
            )
        except OpenAIClientError:
            return

        for col, prof in profiles.items():
            desc = result.get(col)
            if isinstance(desc, str):
                prof.ai_description = desc

    def _generate_ai_insights(
        self,
        df: pd.DataFrame,
        stats: dict[str, ColumnProfile],
    ) -> list[str]:
        """Ask the AI for high-level insights about the data."""
        summary_lines: list[str] = []
        for col, prof in stats.items():
            summary_lines.append(
                f"  {col}: type={prof.dtype}, nulls={prof.null_pct}%, "
                f"unique={prof.unique_count}, min={prof.min}, max={prof.max}"
            )

        sample = df.head(_SAMPLE_ROWS_FOR_AI).to_string(max_rows=_SAMPLE_ROWS_FOR_AI)

        prompt = (
            "Analyse this DataFrame and provide 3-5 concise bullet-point "
            "insights about data quality, patterns, or anomalies.\n\n"
            f"Statistics:\n{chr(10).join(summary_lines)}\n\n"
            f"Sample:\n{sample}\n\n"
            "Return a JSON object with key \"insights\": list of strings."
        )

        try:
            result = self._client.complete_json(
                prompt=prompt,
                system_prompt="You are a data analyst. Respond with valid JSON only.",
            )
        except OpenAIClientError:
            return ["AI insights unavailable – profiling completed with statistics only."]

        raw_insights = result.get("insights", [])
        return [str(i) for i in raw_insights if i]

    def _calculate_quality_score(self, df: pd.DataFrame) -> float:
        """Return a 0-100 quality score based on completeness, uniqueness, and validity.

        Scoring breakdown (equal weight):
          * **Completeness** (0-100): percentage of non-null cells.
          * **Uniqueness** (0-100): average column uniqueness ratio.
          * **Validity** (0-100): heuristic – penalises columns with mixed types
            or whitespace-only strings.
        """
        if df.empty:
            return 0.0

        total_cells = df.shape[0] * df.shape[1]

        # Completeness: proportion of non-null values.
        completeness = (1.0 - df.isna().sum().sum() / total_cells) * 100 if total_cells else 0.0

        # Uniqueness: average unique-ratio per column.
        uniqueness_scores: list[float] = []
        for col in df.columns:
            non_null = df[col].dropna()
            if len(non_null) == 0:
                uniqueness_scores.append(0.0)
            else:
                uniqueness_scores.append(non_null.nunique() / len(non_null) * 100)
        uniqueness = sum(uniqueness_scores) / len(uniqueness_scores) if uniqueness_scores else 0.0

        # Validity: penalise whitespace-only strings and mixed-type columns.
        validity_scores: list[float] = []
        for col in df.columns:
            series = df[col].dropna()
            if len(series) == 0:
                validity_scores.append(100.0)
                continue
            score = 100.0
            if series.dtype == object:
                str_vals = series.astype(str)
                whitespace_frac = (str_vals.str.strip() == "").sum() / len(str_vals)
                score -= whitespace_frac * 50
                n_types = len(set(type(v).__name__ for v in series))
                if n_types > 1:
                    score -= 20
            validity_scores.append(max(score, 0.0))
        validity = sum(validity_scores) / len(validity_scores) if validity_scores else 0.0

        return round((completeness + uniqueness + validity) / 3.0, 2)


# ------------------------------------------------------------------
# Module-level helpers
# ------------------------------------------------------------------


def _to_python(val: Any) -> Any:
    """Convert numpy/pandas scalars to plain Python types."""
    if pd.isna(val):
        return None
    if hasattr(val, "item"):
        return val.item()
    return val


def _fmt(val: Any) -> str:
    """Format a value for the Markdown report table."""
    if val is None:
        return "—"
    if isinstance(val, float):
        return f"{val:.4g}"
    return str(val)
