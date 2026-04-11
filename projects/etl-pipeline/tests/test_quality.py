"""Tests for ETL quality module (validator, anomaly detector, AI quality checker)."""

from __future__ import annotations

import json
from typing import Any
from unittest.mock import MagicMock

import numpy as np
import pandas as pd
import pytest

from etl.quality.validator import (
    DataValidator,
    RuleType,
    Severity,
    ValidationError,
    ValidationResult,
    ValidationRule,
)
from etl.quality.anomaly_detector import AnomalyDetector, AnomalyMethod, AnomalyResult
from etl.quality.ai_quality_checker import AIQualityChecker, QualityReport


# =========================================================================
# DataValidator
# =========================================================================


class TestDataValidator:
    """Tests for :class:`DataValidator`."""

    def test_validator_not_null_passes(
        self, sample_transaction_df: pd.DataFrame
    ) -> None:
        """NOT_NULL passes when column has no nulls."""
        validator = DataValidator()
        result = validator.validate_not_null(sample_transaction_df, "transaction_id")

        assert result.passed is True
        assert result.failed_count == 0

    def test_validator_not_null_fails(
        self, sample_customer_df: pd.DataFrame
    ) -> None:
        """NOT_NULL fails when column contains null values."""
        validator = DataValidator()
        result = validator.validate_not_null(sample_customer_df, "age")

        assert result.passed is False
        assert result.failed_count > 0
        assert len(result.failed_records) > 0

    def test_validator_not_null_missing_column(self) -> None:
        """NOT_NULL raises ValidationError for a missing column."""
        validator = DataValidator()
        df = pd.DataFrame({"a": [1]})

        with pytest.raises(ValidationError, match="not found"):
            validator.validate_not_null(df, "nonexistent")

    def test_validator_data_type_passes(
        self, sample_customer_df: pd.DataFrame
    ) -> None:
        """DATA_TYPE passes when column dtype matches expected."""
        validator = DataValidator()
        result = validator.validate_data_type(
            sample_customer_df, "salary", "float64"
        )

        assert result.passed is True

    def test_validator_data_type_fails(
        self, sample_customer_df: pd.DataFrame
    ) -> None:
        """DATA_TYPE fails when column dtype doesn't match."""
        validator = DataValidator()
        result = validator.validate_data_type(
            sample_customer_df, "salary", "int64"
        )

        assert result.passed is False
        assert "float64" in result.message
        assert "int64" in result.message

    def test_validator_range_passes(self) -> None:
        """RANGE passes when all values are within bounds."""
        df = pd.DataFrame({"score": [0, 25, 50, 75, 100]})
        validator = DataValidator()

        result = validator.validate_range(df, "score", min_val=0, max_val=100)

        assert result.passed is True
        assert result.failed_count == 0

    def test_validator_range_fails(self) -> None:
        """RANGE fails when values are outside bounds."""
        df = pd.DataFrame({"score": [-5, 25, 50, 75, 150]})
        validator = DataValidator()

        result = validator.validate_range(df, "score", min_val=0, max_val=100)

        assert result.passed is False
        assert result.failed_count == 2  # -5 and 150

    @pytest.mark.parametrize(
        "min_val,max_val,expected_failures",
        [
            (0, None, 1),    # only lower bound → catches -5
            (None, 100, 1),  # only upper bound → catches 150
            (0, 100, 2),     # both bounds → catches -5 and 150
        ],
    )
    def test_validator_range_partial_bounds(
        self, min_val: float | None, max_val: float | None, expected_failures: int
    ) -> None:
        """RANGE works with partial bounds (min only, max only, both)."""
        df = pd.DataFrame({"score": [-5, 25, 50, 75, 150]})
        validator = DataValidator()

        result = validator.validate_range(df, "score", min_val=min_val, max_val=max_val)

        assert result.failed_count == expected_failures

    def test_validator_regex_passes(self) -> None:
        """REGEX passes when all values match the pattern."""
        df = pd.DataFrame({"email": ["a@b.com", "c@d.org", "e@f.io"]})
        validator = DataValidator()

        result = validator.validate_regex(
            df, "email", r"^[\w.+-]+@[\w-]+\.[\w.]+$"
        )

        assert result.passed is True

    def test_validator_regex_fails(self) -> None:
        """REGEX fails for values not matching the pattern."""
        df = pd.DataFrame({"email": ["valid@test.com", "invalid-email", "also@ok.org"]})
        validator = DataValidator()

        result = validator.validate_regex(
            df, "email", r"^[\w.+-]+@[\w-]+\.[\w.]+$"
        )

        assert result.passed is False
        assert result.failed_count == 1

    def test_validator_unique(self) -> None:
        """UNIQUE detects duplicate rows."""
        df = pd.DataFrame({"id": [1, 2, 3, 2, 4]})
        validator = DataValidator()

        result = validator.validate_unique(df, ["id"])

        assert result.passed is False
        assert result.failed_count == 2  # both id=2 rows are flagged

    def test_validator_validate_all_rules(
        self,
        sample_customer_df: pd.DataFrame,
        sample_validation_rules: list[ValidationRule],
    ) -> None:
        """validate() runs all rules and returns one result per rule."""
        validator = DataValidator()
        results = validator.validate(sample_customer_df, sample_validation_rules)

        assert len(results) == len(sample_validation_rules)
        assert all(isinstance(r, ValidationResult) for r in results)

    def test_validator_get_validation_summary(self) -> None:
        """get_validation_summary aggregates pass/fail statistics."""
        results = [
            ValidationResult(
                rule=ValidationRule(column="a", rule_type=RuleType.NOT_NULL),
                passed=True,
                failed_count=0,
            ),
            ValidationResult(
                rule=ValidationRule(
                    column="b",
                    rule_type=RuleType.RANGE,
                    severity=Severity.ERROR,
                ),
                passed=False,
                failed_count=5,
                message="5 out of range",
            ),
            ValidationResult(
                rule=ValidationRule(
                    column="c",
                    rule_type=RuleType.REGEX,
                    severity=Severity.WARNING,
                ),
                passed=False,
                failed_count=2,
                message="2 mismatch",
            ),
        ]
        summary = DataValidator.get_validation_summary(results)

        assert summary["total"] == 3
        assert summary["passed"] == 1
        assert summary["failed"] == 2
        assert summary["errors"] == 1
        assert summary["warnings"] == 1


# =========================================================================
# AnomalyDetector
# =========================================================================


class TestAnomalyDetector:
    """Tests for :class:`AnomalyDetector`."""

    def test_anomaly_detector_zscore(self) -> None:
        """Z-score method detects known outliers."""
        # Normal-ish data with one extreme outlier
        data = [10, 11, 12, 10, 11, 13, 12, 10, 11, 100]
        series = pd.Series(data, name="value")

        detector = AnomalyDetector()
        result = detector.detect_zscore(series, threshold=2.0)

        assert isinstance(result, AnomalyResult)
        assert result.method == AnomalyMethod.Z_SCORE
        assert result.anomaly_count >= 1
        # Index 9 (value=100) should be flagged
        assert 9 in result.anomaly_indices

    def test_anomaly_detector_zscore_no_outliers(self) -> None:
        """Z-score returns zero anomalies for uniform data."""
        series = pd.Series([5.0] * 20, name="uniform")
        detector = AnomalyDetector()
        result = detector.detect_zscore(series, threshold=3.0)

        assert result.anomaly_count == 0

    def test_anomaly_detector_iqr(self) -> None:
        """IQR method detects outliers outside fences."""
        data = [10, 11, 12, 10, 11, 13, 12, 10, 11, 100]
        series = pd.Series(data, name="value")

        detector = AnomalyDetector()
        result = detector.detect_iqr(series, multiplier=1.5)

        assert isinstance(result, AnomalyResult)
        assert result.method == AnomalyMethod.IQR
        assert result.anomaly_count >= 1
        assert 9 in result.anomaly_indices
        # Statistics should include Q1, Q3, IQR
        assert "q1" in result.statistics
        assert "q3" in result.statistics
        assert "iqr" in result.statistics

    def test_anomaly_detector_iqr_bounds(self) -> None:
        """IQR fences are calculated correctly."""
        series = pd.Series([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], name="seq")
        detector = AnomalyDetector()
        result = detector.detect_iqr(series, multiplier=1.5)

        q1 = result.statistics["q1"]
        q3 = result.statistics["q3"]
        iqr = result.statistics["iqr"]
        lower = result.statistics["lower"]
        upper = result.statistics["upper"]

        assert iqr == pytest.approx(q3 - q1)
        assert lower == pytest.approx(q1 - 1.5 * iqr)
        assert upper == pytest.approx(q3 + 1.5 * iqr)

    def test_anomaly_detector_detect_dispatches(self) -> None:
        """detect() dispatches to the correct method and returns results per column."""
        df = pd.DataFrame(
            {
                "a": [1, 2, 3, 4, 5, 100],
                "b": [10, 10, 10, 10, 10, 10],
            }
        )
        detector = AnomalyDetector()
        results = detector.detect(df, columns=["a", "b"], method=AnomalyMethod.Z_SCORE)

        assert len(results) == 2
        assert results[0].column == "a"
        assert results[1].column == "b"
        # Column "b" is uniform, so no anomalies
        assert results[1].anomaly_count == 0

    def test_anomaly_detector_detect_auto_columns(self) -> None:
        """detect() without explicit columns uses all numeric columns."""
        df = pd.DataFrame(
            {
                "num": [1, 2, 3, 100],
                "text": ["a", "b", "c", "d"],
            }
        )
        detector = AnomalyDetector()
        results = detector.detect(df, method=AnomalyMethod.IQR)

        # Only "num" should be checked (text is not numeric)
        assert len(results) == 1
        assert results[0].column == "num"


# =========================================================================
# AIQualityChecker
# =========================================================================


class TestAIQualityChecker:
    """Tests for :class:`AIQualityChecker` with mocked AI."""

    def test_ai_quality_checker_assess(
        self,
        sample_customer_df: pd.DataFrame,
        mock_openai_client: MagicMock,
    ) -> None:
        """assess_quality returns a QualityReport with valid structure."""
        mock_openai_client.chat_completion.return_value = json.dumps(
            {
                "overall_score": 0.75,
                "issues": [
                    {
                        "category": "missing_data",
                        "severity": "medium",
                        "column": "age",
                        "description": "Missing values in age column",
                        "affected_rows": 2,
                    }
                ],
                "recommendations": ["Fill missing age values with median"],
                "summary": "Data quality is acceptable but has gaps.",
            }
        )

        checker = AIQualityChecker(mock_openai_client)
        report = checker.assess_quality(sample_customer_df)

        assert isinstance(report, QualityReport)
        assert 0.0 <= report.overall_score <= 1.0
        assert len(report.issues) >= 1
        assert len(report.recommendations) >= 1
        assert report.summary != ""
        mock_openai_client.chat_completion.assert_called_once()

    def test_ai_quality_checker_malformed_response(
        self,
        sample_customer_df: pd.DataFrame,
        mock_openai_client: MagicMock,
    ) -> None:
        """assess_quality handles malformed AI responses gracefully."""
        # Return valid JSON but missing expected keys
        mock_openai_client.chat_completion.return_value = json.dumps(
            {"unexpected": "format"}
        )

        checker = AIQualityChecker(mock_openai_client)
        report = checker.assess_quality(sample_customer_df)

        # Should still return a QualityReport with defaults
        assert isinstance(report, QualityReport)
        assert 0.0 <= report.overall_score <= 1.0
