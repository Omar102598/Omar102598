"""AI-powered data quality assessment.

Uses an OpenAI-compatible client to perform semantic quality checks, suggest
data fixes, generate comprehensive quality reports, and discover data patterns
that statistical methods might miss.
"""

from __future__ import annotations

import json
import math
from typing import Any

import pandas as pd
import structlog
from pydantic import BaseModel, Field

from etl.quality.anomaly_detector import AnomalyResult
from etl.quality.validator import ValidationResult

logger: structlog.stdlib.BoundLogger = structlog.get_logger(__name__)

__all__ = ["AIQualityChecker", "QualityReport"]

_SAMPLE_SIZE = 50


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------


class QualityIssue(BaseModel):
    """A single quality issue identified by AI analysis.

    Attributes:
        category: Issue category (e.g. ``"missing_data"``, ``"inconsistency"``).
        severity: ``"high"``, ``"medium"``, or ``"low"``.
        column: Affected column, if applicable.
        description: Human-readable description of the issue.
        affected_rows: Estimated number of affected rows.
    """

    category: str
    severity: str = "medium"
    column: str = ""
    description: str = ""
    affected_rows: int = Field(default=0, ge=0)


class QualityReport(BaseModel):
    """Comprehensive AI-generated data quality report.

    Attributes:
        overall_score: Quality score from ``0.0`` (worst) to ``1.0`` (best).
        issues: List of identified quality issues.
        recommendations: Ordered list of improvement recommendations.
        summary: Executive summary of data quality.
    """

    overall_score: float = Field(ge=0.0, le=1.0)
    issues: list[QualityIssue] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    summary: str = ""


# ---------------------------------------------------------------------------
# AIQualityChecker
# ---------------------------------------------------------------------------


class AIQualityChecker:
    """AI-driven data quality assessment.

    Parameters:
        openai_client: Client wrapper exposing ``chat_completion(messages, **kw)``.
            Expected interface (duck-typed)::

                class OpenAIClient:
                    def chat_completion(
                        self,
                        messages: list[dict[str, str]],
                        *,
                        temperature: float = 0.0,
                        response_format: dict | None = None,
                    ) -> str: ...

    Example::

        checker = AIQualityChecker(openai_client)
        report = checker.assess_quality(df)
        print(report.overall_score)
    """

    def __init__(self, openai_client: Any) -> None:
        self._client = openai_client
        self._log = logger.bind(component="AIQualityChecker")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def assess_quality(self, df: pd.DataFrame) -> QualityReport:
        """Perform a comprehensive AI-driven quality assessment.

        Sends a representative sample of *df* along with basic statistics to
        the AI model and returns a structured :class:`QualityReport`.

        Args:
            df: DataFrame to assess.

        Returns:
            AI-generated quality report.
        """
        profile = self._build_data_profile(df)
        sample_text = self._dataframe_to_sample_text(df)

        system = (
            "You are a data quality analyst. Analyse the provided dataset "
            "profile and sample and return a JSON object with exactly these keys:\n"
            '- "overall_score": float 0.0-1.0 (1.0 = perfect quality)\n'
            '- "issues": array of {"category": str, "severity": "high"|"medium"|"low", '
            '"column": str, "description": str, "affected_rows": int}\n'
            '- "recommendations": array of strings\n'
            '- "summary": string\n'
            "Be thorough but concise."
        )
        user = (
            f"Dataset profile:\n{json.dumps(profile, indent=2, default=str)}\n\n"
            f"Sample rows:\n{sample_text}"
        )

        raw = self._chat(system, user)
        parsed = self._parse_json(raw)

        report = self._build_quality_report(parsed)
        self._log.info(
            "quality_assessed",
            score=report.overall_score,
            issues=len(report.issues),
        )
        return report

    def detect_semantic_anomalies(
        self,
        df: pd.DataFrame,
        column: str,
        context: str = "",
    ) -> list[dict[str, Any]]:
        """Find semantically incorrect values in *column* using AI.

        Unlike statistical methods, this can catch values that are
        syntactically valid but contextually wrong (e.g. a city name
        in a country column).

        Args:
            df: Input DataFrame.
            column: Column to inspect.
            context: Description of what the column should contain.

        Returns:
            List of dicts, each with ``"value"``, ``"index"``, and ``"reason"``.
        """
        if column not in df.columns:
            self._log.warning("column_not_found", column=column)
            return []

        sample_values = (
            df[column]
            .dropna()
            .drop_duplicates()
            .head(_SAMPLE_SIZE)
            .tolist()
        )
        if not sample_values:
            return []

        system = (
            "You are a data quality expert. Given sample values from a column, "
            "identify any that seem semantically incorrect or out of place.\n"
            "Return a JSON array of objects with keys: "
            '"value" (the suspicious value), "reason" (why it seems wrong).\n'
            "If all values look correct, return an empty array []."
        )
        context_hint = f"\nColumn context: {context}" if context else ""
        user = (
            f"Column: {column}{context_hint}\n"
            f"Sample values: {json.dumps(sample_values, default=str)}"
        )

        raw = self._chat(system, user)
        parsed = self._parse_json(raw)

        anomalies: list[dict[str, Any]] = []
        items = parsed if isinstance(parsed, list) else parsed.get("anomalies", [])
        for item in items:
            if not isinstance(item, dict):
                continue
            value = item.get("value")
            # Try to find the index in the original DataFrame
            matching = df.index[df[column] == value].tolist()
            anomalies.append({
                "value": value,
                "index": matching[0] if matching else None,
                "reason": item.get("reason", ""),
            })

        self._log.info(
            "semantic_anomalies_detected",
            column=column,
            count=len(anomalies),
        )
        return anomalies

    def suggest_fixes(
        self,
        df: pd.DataFrame,
        validation_results: list[ValidationResult],
    ) -> list[dict[str, Any]]:
        """Generate AI-powered suggestions for fixing validation failures.

        Args:
            df: The validated DataFrame.
            validation_results: Results from :class:`DataValidator`.

        Returns:
            List of fix suggestions, each with ``"rule"``, ``"suggestion"``,
            ``"confidence"``, and ``"code_snippet"`` keys.
        """
        failures = [r for r in validation_results if not r.passed]
        if not failures:
            return []

        failure_summaries = [
            {
                "column": r.rule.column,
                "rule_type": r.rule.rule_type.value,
                "severity": r.rule.severity.value,
                "failed_count": r.failed_count,
                "message": r.message,
            }
            for r in failures
        ]
        sample_text = self._dataframe_to_sample_text(df)

        system = (
            "You are a data engineering expert. Given validation failures and a "
            "data sample, suggest concrete fixes.\n"
            "Return a JSON array of objects with keys:\n"
            '- "rule": str (which rule failed)\n'
            '- "suggestion": str (what to do)\n'
            '- "confidence": float 0.0-1.0\n'
            '- "code_snippet": str (Python/pandas code example)\n'
        )
        user = (
            f"Validation failures:\n{json.dumps(failure_summaries, indent=2)}\n\n"
            f"Data sample:\n{sample_text}"
        )

        raw = self._chat(system, user)
        parsed = self._parse_json(raw)

        suggestions: list[dict[str, Any]] = []
        items = parsed if isinstance(parsed, list) else parsed.get("suggestions", [])
        for item in items:
            if not isinstance(item, dict):
                continue
            suggestions.append({
                "rule": item.get("rule", ""),
                "suggestion": item.get("suggestion", ""),
                "confidence": float(item.get("confidence", 0.5)),
                "code_snippet": item.get("code_snippet", ""),
            })

        self._log.info("fix_suggestions_generated", count=len(suggestions))
        return suggestions

    def generate_quality_report(
        self,
        df: pd.DataFrame,
        validation_results: list[ValidationResult] | None = None,
        anomaly_results: list[AnomalyResult] | None = None,
    ) -> dict[str, Any]:
        """Generate a full quality report combining all available signals.

        Merges validation results, anomaly detection output, and AI-driven
        assessment into a single comprehensive report.

        Args:
            df: The DataFrame under review.
            validation_results: Optional results from :class:`DataValidator`.
            anomaly_results: Optional results from :class:`AnomalyDetector`.

        Returns:
            Comprehensive report dict.
        """
        validation_summary: dict[str, Any] = {}
        if validation_results:
            passed = sum(1 for r in validation_results if r.passed)
            failed = sum(1 for r in validation_results if not r.passed)
            validation_summary = {
                "total_rules": len(validation_results),
                "passed": passed,
                "failed": failed,
                "failures": [
                    {
                        "column": r.rule.column,
                        "rule_type": r.rule.rule_type.value,
                        "message": r.message,
                        "failed_count": r.failed_count,
                    }
                    for r in validation_results
                    if not r.passed
                ],
            }

        anomaly_summary: dict[str, Any] = {}
        if anomaly_results:
            anomaly_summary = {
                "total_anomalies": sum(r.anomaly_count for r in anomaly_results),
                "columns_with_anomalies": [
                    {
                        "column": r.column,
                        "method": r.method.value,
                        "count": r.anomaly_count,
                    }
                    for r in anomaly_results
                    if r.anomaly_count > 0
                ],
            }

        profile = self._build_data_profile(df)
        sample_text = self._dataframe_to_sample_text(df)

        system = (
            "You are a senior data quality analyst. Using the dataset profile, "
            "validation results, anomaly detection results, and sample data, "
            "produce a comprehensive quality report.\n"
            "Return a JSON object with keys:\n"
            '- "overall_score": float 0.0-1.0\n'
            '- "executive_summary": str\n'
            '- "issues": array of {"category": str, "severity": str, '
            '"description": str, "impact": str}\n'
            '- "recommendations": array of {"priority": int, "action": str, '
            '"rationale": str}\n'
            '- "data_health_metrics": {"completeness": float, "consistency": float, '
            '"accuracy": float, "timeliness": float}\n'
        )
        user = (
            f"Dataset profile:\n{json.dumps(profile, indent=2, default=str)}\n\n"
            f"Validation results:\n{json.dumps(validation_summary, indent=2, default=str)}\n\n"
            f"Anomaly results:\n{json.dumps(anomaly_summary, indent=2, default=str)}\n\n"
            f"Sample rows:\n{sample_text}"
        )

        raw = self._chat(system, user)
        parsed = self._parse_json(raw)

        report = {
            "overall_score": parsed.get("overall_score", 0.5),
            "executive_summary": parsed.get("executive_summary", ""),
            "issues": parsed.get("issues", []),
            "recommendations": parsed.get("recommendations", []),
            "data_health_metrics": parsed.get("data_health_metrics", {}),
            "profile": profile,
            "validation_summary": validation_summary,
            "anomaly_summary": anomaly_summary,
        }

        self._log.info(
            "quality_report_generated",
            score=report["overall_score"],
            issues=len(report["issues"]),
        )
        return report

    def analyze_patterns(
        self,
        df: pd.DataFrame,
        column: str,
    ) -> dict[str, Any]:
        """Discover data patterns in *column* using AI.

        Useful for understanding implicit formatting rules, common value
        structures, and potential data quality issues.

        Args:
            df: Input DataFrame.
            column: Column to analyse.

        Returns:
            Dict with ``"patterns"``, ``"format_description"``, and
            ``"potential_issues"`` keys.
        """
        if column not in df.columns:
            self._log.warning("column_not_found", column=column)
            return {"patterns": [], "format_description": "", "potential_issues": []}

        sample_values = (
            df[column]
            .dropna()
            .drop_duplicates()
            .head(_SAMPLE_SIZE)
            .tolist()
        )
        value_counts = df[column].nunique()
        null_pct = float(df[column].isna().mean() * 100)

        system = (
            "You are a data pattern analyst. Given sample values from a column, "
            "identify patterns, formats, and potential issues.\n"
            "Return a JSON object with keys:\n"
            '- "patterns": array of {"pattern": str, "description": str, '
            '"frequency": str}\n'
            '- "format_description": str (overall format description)\n'
            '- "potential_issues": array of str\n'
        )
        user = (
            f"Column: {column}\n"
            f"Unique values: {value_counts}\n"
            f"Null percentage: {null_pct:.1f}%\n"
            f"Sample values: {json.dumps(sample_values, default=str)}"
        )

        raw = self._chat(system, user)
        parsed = self._parse_json(raw)

        result = {
            "patterns": parsed.get("patterns", []),
            "format_description": parsed.get("format_description", ""),
            "potential_issues": parsed.get("potential_issues", []),
        }

        self._log.info(
            "patterns_analyzed",
            column=column,
            patterns_found=len(result["patterns"]),
        )
        return result

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _chat(self, system: str, user: str) -> str:
        """Send a chat request to the AI client.

        Args:
            system: System prompt.
            user: User message.

        Returns:
            Raw response string.
        """
        messages = [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ]
        try:
            return self._client.chat_completion(
                messages,
                temperature=0.0,
                response_format={"type": "json_object"},
            )
        except Exception as exc:
            self._log.error("ai_request_failed", error=str(exc))
            return "{}"

    @staticmethod
    def _parse_json(raw: str) -> Any:
        """Parse a JSON string, returning an empty dict on failure."""
        try:
            return json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            return {}

    @staticmethod
    def _dataframe_to_sample_text(
        df: pd.DataFrame,
        max_rows: int = _SAMPLE_SIZE,
    ) -> str:
        """Convert a DataFrame sample to a readable text representation."""
        sample = df.head(max_rows)
        return sample.to_string(max_rows=max_rows, max_cols=20)

    @staticmethod
    def _build_data_profile(df: pd.DataFrame) -> dict[str, Any]:
        """Build a lightweight statistical profile of the DataFrame."""
        profile: dict[str, Any] = {
            "row_count": len(df),
            "column_count": len(df.columns),
            "columns": {},
        }

        for col in df.columns:
            col_info: dict[str, Any] = {
                "dtype": str(df[col].dtype),
                "null_count": int(df[col].isna().sum()),
                "null_pct": round(float(df[col].isna().mean() * 100), 2),
                "unique_count": int(df[col].nunique()),
            }

            if pd.api.types.is_numeric_dtype(df[col]):
                desc = df[col].describe()
                col_info["min"] = float(desc.get("min", 0))
                col_info["max"] = float(desc.get("max", 0))
                col_info["mean"] = float(desc.get("mean", 0))
                col_info["std"] = float(desc.get("std", 0))
            elif pd.api.types.is_string_dtype(df[col]):
                non_null = df[col].dropna()
                if len(non_null) > 0:
                    lengths = non_null.astype(str).str.len()
                    col_info["min_length"] = int(lengths.min())
                    col_info["max_length"] = int(lengths.max())
                    col_info["mean_length"] = round(float(lengths.mean()), 1)
                    top_values = non_null.value_counts().head(5).to_dict()
                    col_info["top_values"] = {
                        str(k): int(v) for k, v in top_values.items()
                    }

            profile["columns"][col] = col_info

        return profile

    def _build_quality_report(self, parsed: Any) -> QualityReport:
        """Construct a :class:`QualityReport` from parsed AI response."""
        if not isinstance(parsed, dict):
            return QualityReport(
                overall_score=0.5,
                summary="Unable to parse AI response",
            )

        issues: list[QualityIssue] = []
        for item in parsed.get("issues", []):
            if isinstance(item, dict):
                issues.append(
                    QualityIssue(
                        category=item.get("category", "unknown"),
                        severity=item.get("severity", "medium"),
                        column=item.get("column", ""),
                        description=item.get("description", ""),
                        affected_rows=item.get("affected_rows", 0),
                    ),
                )

        recommendations = [
            str(r) for r in parsed.get("recommendations", []) if r
        ]

        score = parsed.get("overall_score", 0.5)
        try:
            score = max(0.0, min(1.0, float(score)))
        except (TypeError, ValueError):
            score = 0.5

        return QualityReport(
            overall_score=score,
            issues=issues,
            recommendations=recommendations,
            summary=parsed.get("summary", ""),
        )
