"""Tests for the ETL AI module (OpenAI client, schema inference, data profiler)."""

from __future__ import annotations

import json
from typing import Any
from unittest.mock import MagicMock, patch, PropertyMock

import pandas as pd
import pytest

from etl.ai.openai_client import (
    CachedResponse,
    OpenAIClient,
    OpenAIClientError,
    RateLimitError,
    TokenLimitError,
)
from etl.ai.schema_inference import (
    ColumnSchema,
    InferredSchema,
    SchemaInferenceEngine,
)
from etl.ai.data_profiler import AIDataProfiler, DataProfile


# =========================================================================
# OpenAIClient
# =========================================================================


class TestOpenAIClient:
    """Tests for :class:`OpenAIClient` with mocked openai API."""

    @patch("etl.ai.openai_client.tiktoken.encoding_for_model")
    @patch("etl.ai.openai_client.openai.OpenAI")
    def test_openai_client_complete(
        self, mock_openai_cls: MagicMock, mock_encoding_for_model: MagicMock
    ) -> None:
        """complete() returns a string response from the API."""
        # Mock tiktoken encoder
        encoder = MagicMock()
        encoder.encode.return_value = [1, 2, 3]  # 3 tokens
        mock_encoding_for_model.return_value = encoder

        # Mock the OpenAI client
        mock_client = MagicMock()
        mock_openai_cls.return_value = mock_client

        # Mock the completions response
        choice = MagicMock()
        choice.message.content = "Hello, world!"
        response = MagicMock()
        response.choices = [choice]
        mock_client.chat.completions.create.return_value = response

        client = OpenAIClient(api_key="test-key", model="gpt-4o")
        result = client.complete("Say hello")

        assert result == "Hello, world!"
        mock_client.chat.completions.create.assert_called_once()

    @patch("etl.ai.openai_client.tiktoken.encoding_for_model")
    @patch("etl.ai.openai_client.openai.OpenAI")
    def test_openai_client_token_counting(
        self, mock_openai_cls: MagicMock, mock_encoding_for_model: MagicMock
    ) -> None:
        """count_tokens returns the correct token count."""
        encoder = MagicMock()
        encoder.encode.return_value = [1, 2, 3, 4, 5]
        mock_encoding_for_model.return_value = encoder

        mock_openai_cls.return_value = MagicMock()

        client = OpenAIClient(api_key="test-key")
        count = client.count_tokens("Hello world test")

        assert count == 5
        encoder.encode.assert_called_once_with("Hello world test")

    @patch("etl.ai.openai_client.tiktoken.encoding_for_model")
    @patch("etl.ai.openai_client.openai.OpenAI")
    def test_openai_client_caching(
        self, mock_openai_cls: MagicMock, mock_encoding_for_model: MagicMock
    ) -> None:
        """Repeated calls with same prompt return cached response."""
        encoder = MagicMock()
        encoder.encode.return_value = [1, 2, 3]
        mock_encoding_for_model.return_value = encoder

        mock_client = MagicMock()
        mock_openai_cls.return_value = mock_client

        choice = MagicMock()
        choice.message.content = "Cached response"
        response = MagicMock()
        response.choices = [choice]
        mock_client.chat.completions.create.return_value = response

        client = OpenAIClient(api_key="test-key")

        # First call — hits API
        result1 = client.complete("Same prompt", system_prompt="sys")
        # Second call — should hit cache
        result2 = client.complete("Same prompt", system_prompt="sys")

        assert result1 == result2 == "Cached response"
        # API should only be called once
        assert mock_client.chat.completions.create.call_count == 1

    @patch("etl.ai.openai_client.tiktoken.encoding_for_model")
    @patch("etl.ai.openai_client.openai.OpenAI")
    def test_openai_client_token_limit_exceeded(
        self, mock_openai_cls: MagicMock, mock_encoding_for_model: MagicMock
    ) -> None:
        """TokenLimitError is raised when prompt is too large."""
        # Return a very large token count to trigger the limit
        encoder = MagicMock()
        encoder.encode.return_value = list(range(130_000))
        mock_encoding_for_model.return_value = encoder

        mock_openai_cls.return_value = MagicMock()

        client = OpenAIClient(api_key="test-key")

        with pytest.raises(TokenLimitError, match="128"):
            client.complete("Very long prompt", max_tokens=4096)

    def test_openai_client_cache_key_deterministic(self) -> None:
        """_cache_key produces the same hash for identical inputs."""
        key1 = OpenAIClient._cache_key("prompt", "system", 0.0, 4096)
        key2 = OpenAIClient._cache_key("prompt", "system", 0.0, 4096)

        assert key1 == key2

    def test_openai_client_cache_key_varies(self) -> None:
        """_cache_key produces different hashes for different inputs."""
        key1 = OpenAIClient._cache_key("prompt1", "system", 0.0, 4096)
        key2 = OpenAIClient._cache_key("prompt2", "system", 0.0, 4096)

        assert key1 != key2


# =========================================================================
# SchemaInferenceEngine
# =========================================================================


class TestSchemaInferenceEngine:
    """Tests for :class:`SchemaInferenceEngine` with mocked OpenAI client."""

    def test_schema_inference(
        self,
        sample_customer_df: pd.DataFrame,
        mock_openai_client: MagicMock,
    ) -> None:
        """infer_schema returns an InferredSchema with column info."""
        mock_openai_client.complete_json.return_value = {
            "columns": [
                {
                    "name": "id",
                    "inferred_type": "INTEGER",
                    "nullable": False,
                    "description": "Customer identifier",
                    "sample_values": [1, 2, 3],
                },
                {
                    "name": "name",
                    "inferred_type": "VARCHAR(255)",
                    "nullable": True,
                    "description": "Customer full name",
                    "sample_values": ["Alice", "Bob"],
                },
            ],
            "confidence": 0.9,
        }

        engine = SchemaInferenceEngine(mock_openai_client)
        schema = engine.infer_schema(sample_customer_df)

        assert isinstance(schema, InferredSchema)
        assert len(schema.columns) >= 1
        assert schema.confidence > 0.0
        mock_openai_client.complete_json.assert_called_once()

    def test_schema_inference_fallback_on_error(
        self,
        sample_customer_df: pd.DataFrame,
        mock_openai_client: MagicMock,
    ) -> None:
        """infer_schema falls back gracefully when AI call fails."""
        mock_openai_client.complete_json.side_effect = OpenAIClientError("API down")

        engine = SchemaInferenceEngine(mock_openai_client)
        schema = engine.infer_schema(sample_customer_df)

        # Fallback schema should still have columns from the DataFrame
        assert isinstance(schema, InferredSchema)
        assert len(schema.columns) == len(sample_customer_df.columns)

    def test_schema_inference_detect_relationships(
        self,
        sample_customer_df: pd.DataFrame,
        sample_transaction_df: pd.DataFrame,
        mock_openai_client: MagicMock,
    ) -> None:
        """detect_relationships returns RelationshipInfo objects."""
        mock_openai_client.complete_json.return_value = {
            "relationships": [
                {
                    "source_table": "transactions",
                    "source_column": "customer_id",
                    "target_table": "customers",
                    "target_column": "id",
                    "confidence": 0.95,
                }
            ]
        }

        engine = SchemaInferenceEngine(mock_openai_client)
        rels = engine.detect_relationships(
            {"customers": sample_customer_df, "transactions": sample_transaction_df}
        )

        assert len(rels) == 1
        assert rels[0].source_table == "transactions"
        assert rels[0].target_table == "customers"
        assert rels[0].confidence >= 0.9


# =========================================================================
# AIDataProfiler
# =========================================================================


class TestAIDataProfiler:
    """Tests for :class:`AIDataProfiler` with mocked AI."""

    def test_data_profiler(
        self,
        sample_customer_df: pd.DataFrame,
        mock_openai_client: MagicMock,
    ) -> None:
        """profile() returns a DataProfile with column stats and AI insights."""
        # Mock complete_json for AI descriptions
        mock_openai_client.complete_json.return_value = {
            "id": "Customer identifier",
            "name": "Customer full name",
            "email": "Contact email",
            "age": "Customer age in years",
            "salary": "Annual salary",
            "signup_date": "Registration date",
            "description": "Account description",
        }
        # Mock complete for AI insights
        mock_openai_client.complete.return_value = json.dumps(
            ["The dataset contains customer data with some missing values"]
        )

        profiler = AIDataProfiler(mock_openai_client)
        profile = profiler.profile(sample_customer_df)

        assert isinstance(profile, DataProfile)
        assert profile.row_count == len(sample_customer_df)
        assert len(profile.columns) == len(sample_customer_df.columns)
        assert 0.0 <= profile.quality_score <= 100.0

        # Check that numeric columns have stats
        age_profile = profile.columns.get("age")
        assert age_profile is not None
        assert age_profile.null_count > 0

    def test_data_profiler_generate_report(
        self, mock_openai_client: MagicMock
    ) -> None:
        """generate_report produces a Markdown string."""
        mock_openai_client.complete_json.return_value = {
            "value": "A numeric column",
        }
        mock_openai_client.complete.return_value = json.dumps(
            ["Simple dataset insight"]
        )

        df = pd.DataFrame({"value": [1, 2, 3, 4, 5]})
        profiler = AIDataProfiler(mock_openai_client)
        profile = profiler.profile(df)
        report = profiler.generate_report(profile)

        assert isinstance(report, str)
        assert "Data Profile Report" in report
        assert "value" in report

    def test_data_profiler_empty_df(
        self, mock_openai_client: MagicMock
    ) -> None:
        """profile() handles an empty DataFrame without errors."""
        mock_openai_client.complete_json.return_value = {}
        mock_openai_client.complete.return_value = "[]"

        profiler = AIDataProfiler(mock_openai_client)
        df = pd.DataFrame()
        profile = profiler.profile(df)

        assert isinstance(profile, DataProfile)
        assert profile.row_count == 0
        assert len(profile.columns) == 0
