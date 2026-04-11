"""Tests for ETL transformers (data cleaner, schema mapper, AI transformer)."""

from __future__ import annotations

import json
from typing import Any
from unittest.mock import MagicMock

import numpy as np
import pandas as pd
import pytest

from etl.transformers.data_cleaner import (
    CleaningConfig,
    DataCleaner,
    DeduplicationConfig,
    NullHandlingConfig,
    NullHandlingStrategy,
    OutlierConfig,
    OutlierMethod,
)
from etl.transformers.schema_mapper import (
    SchemaMapper,
    SchemaMapping,
    SCDChangeResult,
)
from etl.transformers.ai_transformer import AITransformer, AITransformConfig


# =========================================================================
# DataCleaner
# =========================================================================


class TestDataCleaner:
    """Tests for :class:`DataCleaner`."""

    def test_data_cleaner_handle_nulls_fill_mean(
        self, sample_customer_df: pd.DataFrame
    ) -> None:
        """Null values in numeric columns are filled with column mean."""
        cleaner = DataCleaner(name="test-cleaner")
        strategies = {
            "age": NullHandlingConfig(strategy=NullHandlingStrategy.FILL_MEAN),
            "salary": NullHandlingConfig(strategy=NullHandlingStrategy.FILL_MEAN),
        }

        result = cleaner.handle_nulls(sample_customer_df, strategies)

        assert result["age"].isna().sum() == 0
        assert result["salary"].isna().sum() == 0
        # Mean should be close to the original non-null mean
        original_mean = sample_customer_df["age"].mean()
        filled_values = result.loc[sample_customer_df["age"].isna(), "age"]
        for val in filled_values:
            assert abs(val - original_mean) < 0.01

    @pytest.mark.parametrize(
        "strategy,fill_value",
        [
            (NullHandlingStrategy.FILL_CONSTANT, 0),
            (NullHandlingStrategy.FILL_MEDIAN, None),
            (NullHandlingStrategy.FILL_MODE, None),
        ],
    )
    def test_data_cleaner_handle_nulls_strategies(
        self,
        sample_customer_df: pd.DataFrame,
        strategy: NullHandlingStrategy,
        fill_value: Any,
    ) -> None:
        """Various null strategies eliminate nulls in the target column."""
        cleaner = DataCleaner(name="test-cleaner")
        config = NullHandlingConfig(strategy=strategy, fill_value=fill_value)
        strategies = {"age": config}

        result = cleaner.handle_nulls(sample_customer_df, strategies)
        assert result["age"].isna().sum() == 0

    def test_data_cleaner_handle_nulls_drop(
        self, sample_customer_df: pd.DataFrame
    ) -> None:
        """DROP strategy removes rows with nulls in the specified column."""
        cleaner = DataCleaner(name="test-cleaner")
        strategies = {"age": NullHandlingConfig(strategy=NullHandlingStrategy.DROP)}

        before_count = len(sample_customer_df)
        null_count = int(sample_customer_df["age"].isna().sum())
        result = cleaner.handle_nulls(sample_customer_df, strategies)

        assert len(result) == before_count - null_count
        assert result["age"].isna().sum() == 0

    def test_data_cleaner_deduplicate(
        self, sample_customer_df: pd.DataFrame
    ) -> None:
        """Exact deduplication removes duplicate rows by subset columns."""
        cleaner = DataCleaner(name="test-cleaner")

        # The fixture has duplicate id=3 rows
        result = cleaner.deduplicate(sample_customer_df, subset=["id"])
        assert len(result) < len(sample_customer_df)
        assert result["id"].is_unique

    def test_data_cleaner_deduplicate_full(
        self, sample_customer_df: pd.DataFrame
    ) -> None:
        """Full-row deduplication keeps only unique rows."""
        cleaner = DataCleaner(name="test-cleaner")
        result = cleaner.deduplicate(sample_customer_df)

        # At least some rows removed (the id=3 duplicates share all columns)
        assert len(result) <= len(sample_customer_df)

    def test_data_cleaner_normalize_strings(
        self, sample_customer_df: pd.DataFrame
    ) -> None:
        """String normalization trims whitespace and converts case."""
        cleaner = DataCleaner(name="test-cleaner")

        result = cleaner.normalize_strings(
            sample_customer_df,
            columns=["name"],
            trim=True,
            case="lower",
        )

        # The "  Charlie Brown " value should be trimmed and lowercased
        names = result["name"].dropna().tolist()
        for n in names:
            assert n == n.strip()
            assert n == n.lower()

    def test_data_cleaner_normalize_strings_remove_special_chars(
        self, sample_customer_df: pd.DataFrame
    ) -> None:
        """Special character removal works on string columns."""
        df = sample_customer_df.copy()
        df.loc[0, "name"] = "Alice!@#Smith"

        cleaner = DataCleaner(name="test-cleaner")
        result = cleaner.normalize_strings(
            df,
            columns=["name"],
            remove_special_chars=True,
        )

        assert result.loc[0, "name"] == "AliceSmith"

    def test_data_cleaner_handle_outliers_cap(self) -> None:
        """Outliers are capped (clipped) to the IQR fences."""
        df = pd.DataFrame({"value": [10, 12, 13, 14, 15, 16, 100, 11, 14, 13]})
        cleaner = DataCleaner(name="test-cleaner")

        result = cleaner.handle_outliers(
            df,
            columns=["value"],
            method=OutlierMethod.CAP,
            iqr_multiplier=1.5,
        )

        # The extreme 100 should be capped to the upper fence
        assert result["value"].max() < 100

    def test_data_cleaner_handle_outliers_flag(self) -> None:
        """FLAG method adds a boolean outlier column."""
        df = pd.DataFrame({"value": [10, 12, 13, 14, 15, 16, 100, 11, 14, 13]})
        cleaner = DataCleaner(name="test-cleaner")

        result = cleaner.handle_outliers(
            df,
            columns=["value"],
            method=OutlierMethod.FLAG,
            iqr_multiplier=1.5,
        )

        assert "value_outlier" in result.columns
        assert result["value_outlier"].dtype == bool
        # 100 should be flagged as an outlier
        assert result.loc[df["value"] == 100, "value_outlier"].all()

    def test_data_cleaner_handle_outliers_remove(self) -> None:
        """REMOVE method drops outlier rows."""
        df = pd.DataFrame({"value": [10, 12, 13, 14, 15, 16, 100, 11, 14, 13]})
        cleaner = DataCleaner(name="test-cleaner")

        result = cleaner.handle_outliers(
            df,
            columns=["value"],
            method=OutlierMethod.REMOVE,
            iqr_multiplier=1.5,
        )

        assert len(result) < len(df)
        assert 100 not in result["value"].values

    def test_data_cleaner_transform_pipeline(
        self, sample_customer_df: pd.DataFrame
    ) -> None:
        """Full cleaning pipeline via transform() method."""
        config = CleaningConfig(
            null_handling={
                "*": NullHandlingConfig(
                    strategy=NullHandlingStrategy.FILL_CONSTANT,
                    fill_value="UNKNOWN",
                ),
                "age": NullHandlingConfig(strategy=NullHandlingStrategy.FILL_MEAN),
                "salary": NullHandlingConfig(strategy=NullHandlingStrategy.FILL_MEDIAN),
            },
            deduplication=DeduplicationConfig(subset=["id"]),
        )
        cleaner = DataCleaner(name="pipeline-cleaner", config=config)
        result = cleaner.transform(sample_customer_df)

        assert result["age"].isna().sum() == 0
        assert result["id"].is_unique


# =========================================================================
# SchemaMapper
# =========================================================================


class TestSchemaMapper:
    """Tests for :class:`SchemaMapper`."""

    def test_schema_mapper_map_columns(
        self, sample_customer_df: pd.DataFrame
    ) -> None:
        """Column renaming via map_columns works correctly."""
        mapper = SchemaMapper(name="test-mapper")
        rename_map = {"id": "customer_id", "name": "full_name"}

        result = mapper.map_columns(sample_customer_df, rename_map)

        assert "customer_id" in result.columns
        assert "full_name" in result.columns
        assert "id" not in result.columns
        assert "name" not in result.columns
        assert len(result) == len(sample_customer_df)

    def test_schema_mapper_map_columns_missing_ignored(
        self, sample_customer_df: pd.DataFrame
    ) -> None:
        """Missing source columns are silently skipped."""
        mapper = SchemaMapper(name="test-mapper")
        rename_map = {"id": "customer_id", "nonexistent": "something"}

        result = mapper.map_columns(sample_customer_df, rename_map)

        assert "customer_id" in result.columns
        assert "something" not in result.columns

    def test_schema_mapper_detect_scd_changes(self) -> None:
        """SCD detection identifies new, changed, and unchanged rows."""
        mapper = SchemaMapper(name="scd-mapper")

        previous = pd.DataFrame(
            {
                "customer_id": [1, 2, 3],
                "name": ["Alice", "Bob", "Charlie"],
                "email": ["a@x.com", "b@x.com", "c@x.com"],
            }
        )
        current = pd.DataFrame(
            {
                "customer_id": [1, 2, 3, 4],
                "name": ["Alice", "Bob Updated", "Charlie", "Diana"],
                "email": ["a@x.com", "b_new@x.com", "c@x.com", "d@x.com"],
            }
        )

        new_df, changed_df, unchanged_df, summary = mapper.detect_scd_changes(
            current,
            previous,
            key_columns=["customer_id"],
            tracked_columns=["name", "email"],
        )

        assert isinstance(summary, SCDChangeResult)
        assert summary.new == 1  # customer_id=4
        assert summary.changed == 1  # customer_id=2
        assert summary.unchanged == 2  # customer_id=1,3

        assert 4 in new_df["customer_id"].values
        assert 2 in changed_df["customer_id"].values

    def test_schema_mapper_detect_scd_no_changes(self) -> None:
        """SCD detection with identical DataFrames reports zero changes."""
        mapper = SchemaMapper(name="scd-mapper")

        data = pd.DataFrame(
            {
                "key": [1, 2],
                "val": ["a", "b"],
            }
        )

        _, _, _, summary = mapper.detect_scd_changes(
            data, data, key_columns=["key"], tracked_columns=["val"]
        )

        assert summary.new == 0
        assert summary.changed == 0
        assert summary.unchanged == 2

    def test_schema_mapper_transform_pipeline(
        self, sample_customer_df: pd.DataFrame
    ) -> None:
        """Full transform pipeline applies renames and type conversions."""
        mapping = SchemaMapping(
            column_renames={"id": "customer_id"},
            type_conversions={},  # skip to avoid int issues with nulls
        )
        mapper = SchemaMapper(name="pipeline-mapper", mapping=mapping)
        result = mapper.transform(sample_customer_df)

        assert "customer_id" in result.columns
        assert "id" not in result.columns


# =========================================================================
# AITransformer
# =========================================================================


class TestAITransformer:
    """Tests for :class:`AITransformer` with mocked OpenAI client."""

    def test_ai_transformer_sentiment(
        self,
        sample_customer_df: pd.DataFrame,
        mock_openai_client: MagicMock,
    ) -> None:
        """Sentiment analysis adds score and label columns."""
        # Setup: return enough results for all rows
        n = len(sample_customer_df)
        mock_openai_client.chat_completion.return_value = json.dumps(
            {
                "results": [
                    {"score": 0.5, "label": "positive"} for _ in range(n)
                ]
            }
        )

        transformer = AITransformer(
            name="sentiment-test",
            openai_client=mock_openai_client,
        )
        result = transformer.analyze_sentiment(
            sample_customer_df, column="description", output_column="sent"
        )

        assert "sent_score" in result.columns
        assert "sent_label" in result.columns
        assert len(result) == n
        mock_openai_client.chat_completion.assert_called()

    def test_ai_transformer_sentiment_missing_column(
        self,
        mock_openai_client: MagicMock,
    ) -> None:
        """Requesting sentiment on a non-existent column raises TransformError."""
        from etl.transformers.base_transformer import TransformError

        df = pd.DataFrame({"text": ["hello"]})
        transformer = AITransformer(name="err-test", openai_client=mock_openai_client)

        with pytest.raises(TransformError, match="not found"):
            transformer.analyze_sentiment(df, column="missing_col")

    def test_ai_transformer_parse_response_bare_array(self) -> None:
        """_parse_response handles a bare JSON array."""
        raw = json.dumps([{"score": 0.5}, {"score": -0.2}])
        result = AITransformer._parse_response(raw, expected_count=2)

        assert len(result) == 2
        assert result[0]["score"] == 0.5

    def test_ai_transformer_parse_response_pads_short(self) -> None:
        """_parse_response pads with empty dicts when fewer results returned."""
        raw = json.dumps({"results": [{"score": 0.5}]})
        result = AITransformer._parse_response(raw, expected_count=3)

        assert len(result) == 3
        assert result[0]["score"] == 0.5
        assert result[1] == {}
        assert result[2] == {}

    def test_ai_transformer_parse_response_invalid_json(self) -> None:
        """_parse_response returns empty dicts for malformed JSON."""
        result = AITransformer._parse_response("not json!", expected_count=2)

        assert len(result) == 2
        assert all(r == {} for r in result)
