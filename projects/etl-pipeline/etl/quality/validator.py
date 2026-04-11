"""Comprehensive data validation for ETL pipelines.

Provides rule-based validation of pandas DataFrames including schema checks,
null constraints, type enforcement, range validation, regex matching, uniqueness
checks, and referential integrity verification.
"""

from __future__ import annotations

import re
from enum import Enum
from typing import Any

import pandas as pd
import structlog
from pydantic import BaseModel, Field

logger: structlog.stdlib.BoundLogger = structlog.get_logger(__name__)

__all__ = ["DataValidator", "ValidationError", "ValidationRule", "ValidationResult", "RuleType", "Severity"]


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------


class RuleType(str, Enum):
    """Types of validation rules that can be applied."""

    NOT_NULL = "not_null"
    DATA_TYPE = "data_type"
    RANGE = "range"
    REGEX = "regex"
    UNIQUE = "unique"
    REFERENTIAL = "referential"
    CUSTOM = "custom"


class Severity(str, Enum):
    """Severity level for a validation rule violation."""

    ERROR = "error"
    WARNING = "warning"


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------


class ValidationRule(BaseModel):
    """Definition of a single validation rule.

    Attributes:
        column: Target column name (or comma-separated names for UNIQUE).
        rule_type: The kind of check to perform.
        parameters: Rule-specific parameters (e.g. ``{"min": 0, "max": 100}``).
        severity: Whether a failure is an error or a warning.
    """

    column: str
    rule_type: RuleType
    parameters: dict[str, Any] = Field(default_factory=dict)
    severity: Severity = Severity.ERROR


class ValidationResult(BaseModel):
    """Outcome of evaluating a single validation rule.

    Attributes:
        rule: The rule that was evaluated.
        passed: ``True`` if no violations were found.
        failed_count: Number of records that violated the rule.
        failed_records: Indices of the failing rows (capped for large sets).
        message: Human-readable description of the outcome.
    """

    rule: ValidationRule
    passed: bool
    failed_count: int = Field(ge=0)
    failed_records: list[int] = Field(default_factory=list)
    message: str = ""

    model_config = {"arbitrary_types_allowed": True}


# ---------------------------------------------------------------------------
# Exceptions
# ---------------------------------------------------------------------------


class ValidationError(Exception):
    """Raised when a validation operation itself cannot be performed."""

    def __init__(
        self,
        message: str,
        *,
        column: str = "",
        rule_type: str = "",
        cause: Exception | None = None,
    ) -> None:
        super().__init__(message)
        self.column = column
        self.rule_type = rule_type
        self.cause = cause


# ---------------------------------------------------------------------------
# DataValidator
# ---------------------------------------------------------------------------

_MAX_FAILED_RECORD_SAMPLE = 100


class DataValidator:
    """Rule-driven DataFrame validator.

    Example::

        validator = DataValidator()
        rules = [
            ValidationRule(column="age", rule_type=RuleType.RANGE,
                           parameters={"min": 0, "max": 120}),
        ]
        results = validator.validate(df, rules)
    """

    def __init__(self) -> None:
        self._log = logger.bind(component="DataValidator")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def validate(
        self,
        df: pd.DataFrame,
        rules: list[ValidationRule],
    ) -> list[ValidationResult]:
        """Run every *rule* against *df* and collect results.

        Args:
            df: DataFrame to validate.
            rules: Ordered list of validation rules.

        Returns:
            One :class:`ValidationResult` per rule.
        """
        results: list[ValidationResult] = []
        for rule in rules:
            try:
                result = self._dispatch(df, rule)
            except ValidationError:
                raise
            except Exception as exc:
                raise ValidationError(
                    f"Rule execution failed: {exc}",
                    column=rule.column,
                    rule_type=rule.rule_type.value,
                    cause=exc,
                ) from exc
            results.append(result)

        self._log.info(
            "validation_complete",
            total_rules=len(rules),
            passed=sum(1 for r in results if r.passed),
            failed=sum(1 for r in results if not r.passed),
        )
        return results

    def validate_schema(
        self,
        df: pd.DataFrame,
        expected_schema: dict[str, dict[str, Any]],
    ) -> list[ValidationResult]:
        """Validate column names, data types, and nullability.

        *expected_schema* maps column names to dicts with optional keys:

        * ``"dtype"`` – expected pandas dtype string (e.g. ``"int64"``).
        * ``"nullable"`` – if ``False``, a NOT_NULL check is added.

        Args:
            df: DataFrame to validate.
            expected_schema: Mapping of column name → constraints.

        Returns:
            List of :class:`ValidationResult` entries.
        """
        results: list[ValidationResult] = []

        # Check for missing columns
        missing = set(expected_schema) - set(df.columns)
        if missing:
            results.append(
                ValidationResult(
                    rule=ValidationRule(
                        column=",".join(sorted(missing)),
                        rule_type=RuleType.DATA_TYPE,
                        severity=Severity.ERROR,
                    ),
                    passed=False,
                    failed_count=len(missing),
                    message=f"Missing columns: {sorted(missing)}",
                ),
            )

        for col, constraints in expected_schema.items():
            if col not in df.columns:
                continue

            # Type check
            expected_dtype = constraints.get("dtype")
            if expected_dtype is not None:
                results.append(self.validate_data_type(df, col, expected_dtype))

            # Nullability check
            if constraints.get("nullable") is False:
                results.append(self.validate_not_null(df, col))

        self._log.info("schema_validation_complete", columns=len(expected_schema))
        return results

    def validate_not_null(
        self,
        df: pd.DataFrame,
        column: str,
    ) -> ValidationResult:
        """Check that *column* contains no null values.

        Args:
            df: DataFrame to validate.
            column: Column name.

        Returns:
            Validation result.

        Raises:
            ValidationError: If *column* does not exist.
        """
        self._assert_column(df, column)
        rule = ValidationRule(column=column, rule_type=RuleType.NOT_NULL)

        null_mask = df[column].isna()
        failed_indices = df.index[null_mask].tolist()
        failed_count = int(null_mask.sum())

        return ValidationResult(
            rule=rule,
            passed=failed_count == 0,
            failed_count=failed_count,
            failed_records=failed_indices[:_MAX_FAILED_RECORD_SAMPLE],
            message=(
                f"Column '{column}' has no nulls"
                if failed_count == 0
                else f"Column '{column}' has {failed_count} null value(s)"
            ),
        )

    def validate_data_type(
        self,
        df: pd.DataFrame,
        column: str,
        expected_type: str,
    ) -> ValidationResult:
        """Verify that *column* has the expected pandas dtype.

        Args:
            df: DataFrame to validate.
            column: Column name.
            expected_type: Expected dtype string (e.g. ``"int64"``, ``"object"``).

        Returns:
            Validation result.

        Raises:
            ValidationError: If *column* does not exist.
        """
        self._assert_column(df, column)
        rule = ValidationRule(
            column=column,
            rule_type=RuleType.DATA_TYPE,
            parameters={"expected_type": expected_type},
        )

        actual_type = str(df[column].dtype)
        passed = actual_type == expected_type

        return ValidationResult(
            rule=rule,
            passed=passed,
            failed_count=0 if passed else len(df),
            message=(
                f"Column '{column}' dtype is '{actual_type}' (expected '{expected_type}')"
            ),
        )

    def validate_range(
        self,
        df: pd.DataFrame,
        column: str,
        min_val: float | None = None,
        max_val: float | None = None,
    ) -> ValidationResult:
        """Ensure all non-null values in *column* fall within [*min_val*, *max_val*].

        Args:
            df: DataFrame to validate.
            column: Column name.
            min_val: Lower bound (inclusive). ``None`` to skip.
            max_val: Upper bound (inclusive). ``None`` to skip.

        Returns:
            Validation result.

        Raises:
            ValidationError: If *column* does not exist.
        """
        self._assert_column(df, column)
        rule = ValidationRule(
            column=column,
            rule_type=RuleType.RANGE,
            parameters={"min": min_val, "max": max_val},
        )

        series = df[column].dropna()
        if not pd.api.types.is_numeric_dtype(series):
            return ValidationResult(
                rule=rule,
                passed=False,
                failed_count=len(series),
                message=f"Column '{column}' is not numeric; range check skipped",
            )

        violation_mask = pd.Series(False, index=series.index)
        if min_val is not None:
            violation_mask = violation_mask | (series < min_val)
        if max_val is not None:
            violation_mask = violation_mask | (series > max_val)

        failed_indices = series.index[violation_mask].tolist()
        failed_count = int(violation_mask.sum())

        return ValidationResult(
            rule=rule,
            passed=failed_count == 0,
            failed_count=failed_count,
            failed_records=failed_indices[:_MAX_FAILED_RECORD_SAMPLE],
            message=(
                f"Column '{column}' values within range"
                if failed_count == 0
                else f"Column '{column}' has {failed_count} value(s) outside "
                f"[{min_val}, {max_val}]"
            ),
        )

    def validate_regex(
        self,
        df: pd.DataFrame,
        column: str,
        pattern: str,
    ) -> ValidationResult:
        """Check that all non-null string values in *column* match *pattern*.

        Args:
            df: DataFrame to validate.
            column: Column name.
            pattern: Regular expression pattern.

        Returns:
            Validation result.

        Raises:
            ValidationError: If *column* does not exist or *pattern* is invalid.
        """
        self._assert_column(df, column)
        rule = ValidationRule(
            column=column,
            rule_type=RuleType.REGEX,
            parameters={"pattern": pattern},
        )

        try:
            compiled = re.compile(pattern)
        except re.error as exc:
            raise ValidationError(
                f"Invalid regex pattern '{pattern}': {exc}",
                column=column,
                rule_type=RuleType.REGEX.value,
                cause=exc,
            ) from exc

        series = df[column].dropna().astype(str)
        match_mask = series.apply(lambda v, _p=compiled: bool(_p.fullmatch(v)))
        failed_mask = ~match_mask
        failed_indices = series.index[failed_mask].tolist()
        failed_count = int(failed_mask.sum())

        return ValidationResult(
            rule=rule,
            passed=failed_count == 0,
            failed_count=failed_count,
            failed_records=failed_indices[:_MAX_FAILED_RECORD_SAMPLE],
            message=(
                f"Column '{column}' matches pattern"
                if failed_count == 0
                else f"Column '{column}' has {failed_count} value(s) "
                f"not matching '{pattern}'"
            ),
        )

    def validate_unique(
        self,
        df: pd.DataFrame,
        columns: list[str],
    ) -> ValidationResult:
        """Verify that the combination of *columns* is unique across all rows.

        Args:
            df: DataFrame to validate.
            columns: List of column names forming the uniqueness key.

        Returns:
            Validation result.

        Raises:
            ValidationError: If any column is missing.
        """
        for col in columns:
            self._assert_column(df, col)

        rule = ValidationRule(
            column=",".join(columns),
            rule_type=RuleType.UNIQUE,
        )

        duplicated_mask = df.duplicated(subset=columns, keep=False)
        failed_indices = df.index[duplicated_mask].tolist()
        failed_count = int(duplicated_mask.sum())

        return ValidationResult(
            rule=rule,
            passed=failed_count == 0,
            failed_count=failed_count,
            failed_records=failed_indices[:_MAX_FAILED_RECORD_SAMPLE],
            message=(
                f"Columns {columns} are unique"
                if failed_count == 0
                else f"Columns {columns} have {failed_count} duplicate row(s)"
            ),
        )

    def validate_referential(
        self,
        df: pd.DataFrame,
        column: str,
        reference_df: pd.DataFrame,
        ref_column: str,
    ) -> ValidationResult:
        """Verify that all values in *column* exist in *reference_df[ref_column]*.

        Args:
            df: DataFrame to validate.
            column: Foreign-key column.
            reference_df: Reference / lookup DataFrame.
            ref_column: Column in the reference DataFrame.

        Returns:
            Validation result.

        Raises:
            ValidationError: If either column is missing.
        """
        self._assert_column(df, column)
        if ref_column not in reference_df.columns:
            raise ValidationError(
                f"Reference column '{ref_column}' not found in reference DataFrame "
                f"(available: {list(reference_df.columns)})",
                column=ref_column,
                rule_type=RuleType.REFERENTIAL.value,
            )

        rule = ValidationRule(
            column=column,
            rule_type=RuleType.REFERENTIAL,
            parameters={"ref_column": ref_column},
        )

        ref_values = set(reference_df[ref_column].dropna())
        series = df[column].dropna()
        orphan_mask = ~series.isin(ref_values)
        failed_indices = series.index[orphan_mask].tolist()
        failed_count = int(orphan_mask.sum())

        return ValidationResult(
            rule=rule,
            passed=failed_count == 0,
            failed_count=failed_count,
            failed_records=failed_indices[:_MAX_FAILED_RECORD_SAMPLE],
            message=(
                f"Column '{column}' referential integrity OK"
                if failed_count == 0
                else f"Column '{column}' has {failed_count} orphan value(s) "
                f"not found in reference column '{ref_column}'"
            ),
        )

    @staticmethod
    def get_validation_summary(
        results: list[ValidationResult],
    ) -> dict[str, Any]:
        """Aggregate pass/fail statistics from a list of validation results.

        Args:
            results: Validation results to summarise.

        Returns:
            Dict with keys ``total``, ``passed``, ``failed``,
            ``errors``, ``warnings``, and ``details``.
        """
        errors = [
            r for r in results if not r.passed and r.rule.severity == Severity.ERROR
        ]
        warnings = [
            r for r in results if not r.passed and r.rule.severity == Severity.WARNING
        ]
        return {
            "total": len(results),
            "passed": sum(1 for r in results if r.passed),
            "failed": sum(1 for r in results if not r.passed),
            "errors": len(errors),
            "warnings": len(warnings),
            "details": [
                {
                    "column": r.rule.column,
                    "rule_type": r.rule.rule_type.value,
                    "severity": r.rule.severity.value,
                    "passed": r.passed,
                    "failed_count": r.failed_count,
                    "message": r.message,
                }
                for r in results
            ],
        }

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _dispatch(
        self,
        df: pd.DataFrame,
        rule: ValidationRule,
    ) -> ValidationResult:
        """Route a :class:`ValidationRule` to the appropriate check method."""
        match rule.rule_type:
            case RuleType.NOT_NULL:
                return self.validate_not_null(df, rule.column)
            case RuleType.DATA_TYPE:
                return self.validate_data_type(
                    df, rule.column, rule.parameters.get("expected_type", "object"),
                )
            case RuleType.RANGE:
                return self.validate_range(
                    df,
                    rule.column,
                    min_val=rule.parameters.get("min"),
                    max_val=rule.parameters.get("max"),
                )
            case RuleType.REGEX:
                pattern = rule.parameters.get("pattern", "")
                return self.validate_regex(df, rule.column, pattern)
            case RuleType.UNIQUE:
                columns = [
                    c.strip() for c in rule.column.split(",") if c.strip()
                ]
                return self.validate_unique(df, columns)
            case RuleType.REFERENTIAL:
                ref_df = rule.parameters.get("reference_df")
                ref_col = rule.parameters.get("ref_column", "")
                if ref_df is None or not isinstance(ref_df, pd.DataFrame):
                    raise ValidationError(
                        "Referential rule requires 'reference_df' (DataFrame) "
                        "and 'ref_column' (str) in parameters",
                        column=rule.column,
                        rule_type=rule.rule_type.value,
                    )
                return self.validate_referential(df, rule.column, ref_df, ref_col)
            case RuleType.CUSTOM:
                fn = rule.parameters.get("function")
                if fn is None or not callable(fn):
                    raise ValidationError(
                        "Custom rule requires a callable 'function' in parameters",
                        column=rule.column,
                        rule_type=rule.rule_type.value,
                    )
                return fn(df, rule)
            case _:  # pragma: no cover
                raise ValidationError(
                    f"Unknown rule type: {rule.rule_type}",
                    column=rule.column,
                    rule_type=str(rule.rule_type),
                )

    def _assert_column(self, df: pd.DataFrame, column: str) -> None:
        """Raise :class:`ValidationError` if *column* is not in *df*."""
        if column not in df.columns:
            raise ValidationError(
                f"Column '{column}' not found in DataFrame "
                f"(available: {list(df.columns)})",
                column=column,
            )
