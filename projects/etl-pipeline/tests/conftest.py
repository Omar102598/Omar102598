"""Shared fixtures for the ETL pipeline test suite."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any
from unittest.mock import MagicMock, PropertyMock

import pandas as pd
import pytest

from etl.quality.validator import RuleType, Severity, ValidationRule


# ---------------------------------------------------------------------------
# Project-local temp directory (never /tmp)
# ---------------------------------------------------------------------------

_TEST_DATA_DIR = Path(__file__).resolve().parent / "_test_artifacts"


@pytest.fixture(autouse=True)
def _ensure_artifact_dir() -> None:
    """Create the artifact directory once per session."""
    _TEST_DATA_DIR.mkdir(exist_ok=True)


# ---------------------------------------------------------------------------
# DataFrame fixtures
# ---------------------------------------------------------------------------


@pytest.fixture()
def sample_customer_df() -> pd.DataFrame:
    """DataFrame with 12 customer rows including nulls and duplicates."""
    return pd.DataFrame(
        {
            "id": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 3],
            "name": [
                "Alice Smith",
                "Bob Jones",
                "  Charlie Brown ",
                "Diana Prince",
                "Eve Adams",
                None,
                "Grace Hopper",
                "Hank Pym",
                "Ivy League",
                "Jack Black",
                "Karen White",
                "  Charlie Brown ",
            ],
            "email": [
                "alice@example.com",
                "bob@example.com",
                "charlie@example.com",
                "diana@test.com",
                "eve@test.com",
                "frank@test.com",
                "grace@example.com",
                "hank@test.com",
                "ivy@test.com",
                None,
                "karen@example.com",
                "charlie@example.com",
            ],
            "age": [25, 30, None, 45, 28, 33, 90, 41, 29, 35, 27, None],
            "salary": [
                50_000.0,
                60_000.0,
                55_000.0,
                75_000.0,
                48_000.0,
                62_000.0,
                999_999.0,
                71_000.0,
                53_000.0,
                None,
                46_000.0,
                55_000.0,
            ],
            "signup_date": pd.to_datetime(
                [
                    "2023-01-15",
                    "2023-02-20",
                    "2023-03-10",
                    "2023-04-05",
                    "2023-05-12",
                    "2023-06-01",
                    "2023-07-22",
                    "2023-08-30",
                    "2023-09-14",
                    "2023-10-01",
                    "2023-11-11",
                    "2023-03-10",
                ]
            ),
            "description": [
                "Loyal customer",
                "New signup",
                "Frequent buyer",
                "VIP member",
                "Occasional buyer",
                "Inactive",
                "Legacy account",
                "Premium tier",
                "Student discount",
                "Corporate",
                "Referral",
                "Frequent buyer",
            ],
        }
    )


@pytest.fixture()
def sample_transaction_df() -> pd.DataFrame:
    """DataFrame with 10 transaction rows."""
    return pd.DataFrame(
        {
            "transaction_id": list(range(1001, 1011)),
            "customer_id": [1, 2, 3, 1, 5, 6, 7, 3, 9, 10],
            "amount": [
                29.99,
                149.50,
                5.00,
                89.99,
                250.00,
                15.75,
                1200.00,
                42.00,
                99.99,
                320.00,
            ],
            "date": pd.to_datetime(
                [
                    "2024-01-05",
                    "2024-01-06",
                    "2024-01-06",
                    "2024-01-07",
                    "2024-01-08",
                    "2024-01-09",
                    "2024-01-10",
                    "2024-01-11",
                    "2024-01-12",
                    "2024-01-13",
                ]
            ),
            "category": [
                "electronics",
                "clothing",
                "food",
                "electronics",
                "furniture",
                "food",
                "electronics",
                "clothing",
                "books",
                "furniture",
            ],
        }
    )


# ---------------------------------------------------------------------------
# Mock engine / client fixtures
# ---------------------------------------------------------------------------


@pytest.fixture()
def mock_db_engine() -> MagicMock:
    """Return a mocked SQLAlchemy Engine with basic inspection support."""
    engine = MagicMock()
    engine.dialect = MagicMock()
    engine.dialect.name = "postgresql"

    # Inspector mock
    inspector = MagicMock()
    inspector.get_table_names.return_value = ["customers", "orders"]
    inspector.get_columns.return_value = [
        {"name": "id", "type": "INTEGER", "nullable": False, "default": None},
        {"name": "name", "type": "VARCHAR(255)", "nullable": True, "default": None},
    ]
    inspector.get_pk_constraint.return_value = {"constrained_columns": ["id"]}
    inspector.get_schema_names.return_value = ["public"]
    engine.connect.return_value.__enter__ = MagicMock()
    engine.connect.return_value.__exit__ = MagicMock(return_value=False)

    return engine


@pytest.fixture()
def mock_openai_client() -> MagicMock:
    """Return a mocked OpenAI-compatible client with canned responses."""
    client = MagicMock()

    # Default chat_completion returns a sentiment-style JSON array
    default_response = json.dumps(
        {
            "results": [
                {"score": 0.8, "label": "positive"},
                {"score": -0.3, "label": "negative"},
                {"score": 0.0, "label": "neutral"},
            ]
        }
    )
    client.chat_completion.return_value = default_response

    # complete / complete_json for OpenAIClient-style usage
    client.complete.return_value = "This is a test response."
    client.complete_json.return_value = {
        "columns": [
            {
                "name": "id",
                "inferred_type": "INTEGER",
                "nullable": False,
                "description": "Primary key",
                "sample_values": [1, 2, 3],
            }
        ],
        "confidence": 0.92,
    }
    client.count_tokens.return_value = 42
    return client


# ---------------------------------------------------------------------------
# Temp-file fixtures (project-local, cleaned up after test)
# ---------------------------------------------------------------------------


@pytest.fixture()
def sample_csv_file(sample_customer_df: pd.DataFrame) -> Any:
    """Create a temp CSV inside the project dir, yield its path, then remove."""
    path = _TEST_DATA_DIR / "test_customers.csv"
    sample_customer_df.to_csv(path, index=False)
    yield str(path)
    if path.exists():
        path.unlink()


@pytest.fixture()
def sample_json_file(sample_transaction_df: pd.DataFrame) -> Any:
    """Create a temp JSON file inside the project dir, yield its path, then remove."""
    path = _TEST_DATA_DIR / "test_transactions.json"
    sample_transaction_df.to_json(path, orient="records", date_format="iso")
    yield str(path)
    if path.exists():
        path.unlink()


# ---------------------------------------------------------------------------
# Validation rule fixtures
# ---------------------------------------------------------------------------


@pytest.fixture()
def sample_validation_rules() -> list[ValidationRule]:
    """Return a representative set of validation rules."""
    return [
        ValidationRule(column="id", rule_type=RuleType.NOT_NULL),
        ValidationRule(
            column="age",
            rule_type=RuleType.RANGE,
            parameters={"min": 0, "max": 120},
        ),
        ValidationRule(
            column="email",
            rule_type=RuleType.REGEX,
            parameters={"pattern": r"^[\w.+-]+@[\w-]+\.[\w.]+$"},
        ),
        ValidationRule(
            column="salary",
            rule_type=RuleType.DATA_TYPE,
            parameters={"expected_type": "float64"},
        ),
        ValidationRule(
            column="id",
            rule_type=RuleType.UNIQUE,
            severity=Severity.WARNING,
        ),
    ]


# ---------------------------------------------------------------------------
# Mock API response fixture
# ---------------------------------------------------------------------------


@pytest.fixture()
def mock_api_response() -> MagicMock:
    """Return a mocked ``requests.Response`` with JSON payload."""
    resp = MagicMock()
    resp.status_code = 200
    resp.json.return_value = {
        "data": [
            {"id": 1, "value": "a"},
            {"id": 2, "value": "b"},
        ],
        "total": 2,
        "next_cursor": None,
    }
    resp.headers = {"Content-Type": "application/json"}
    resp.raise_for_status.return_value = None
    return resp
