"""Tests for ETL loaders (database loader, data warehouse loader)."""

from __future__ import annotations

import time
from datetime import datetime, timezone
from typing import Any
from unittest.mock import MagicMock, PropertyMock, call, patch

import pandas as pd
import pytest

from etl.loaders.base_loader import LoadError, LoadMode, LoadResult
from etl.loaders.database_loader import DatabaseLoader
from etl.loaders.data_warehouse_loader import (
    DataWarehouseLoader,
    DimensionConfig,
    DimensionLookup,
    FactConfig,
)


# =========================================================================
# DatabaseLoader
# =========================================================================


class TestDatabaseLoader:
    """Tests for :class:`DatabaseLoader`."""

    @patch("etl.loaders.database_loader.inspect")
    @patch("etl.loaders.database_loader.create_engine")
    def test_database_loader_append(
        self, mock_create_engine: MagicMock, mock_inspect: MagicMock
    ) -> None:
        """APPEND mode inserts all rows via batched execution."""
        engine = MagicMock()
        engine.dialect = MagicMock()
        engine.dialect.name = "postgresql"
        mock_create_engine.return_value = engine

        # Mock inspector to pass column validation
        inspector = MagicMock()
        inspector.get_columns.return_value = [
            {"name": "id"},
            {"name": "name"},
            {"name": "value"},
        ]
        mock_inspect.return_value = inspector

        conn = MagicMock()
        engine.begin.return_value.__enter__ = MagicMock(return_value=conn)
        engine.begin.return_value.__exit__ = MagicMock(return_value=False)

        df = pd.DataFrame({"id": [1, 2, 3], "name": ["a", "b", "c"], "value": [10, 20, 30]})

        loader = DatabaseLoader(
            "postgresql://user:pw@localhost/db",
            "test_table",
            batch_size=10,
            load_mode=LoadMode.APPEND,
        )
        result = loader.load(df)

        assert isinstance(result, LoadResult)
        assert result.records_loaded == 3
        assert result.records_failed == 0
        conn.execute.assert_called()

    @patch("etl.loaders.database_loader.inspect")
    @patch("etl.loaders.database_loader.create_engine")
    def test_database_loader_upsert(
        self, mock_create_engine: MagicMock, mock_inspect: MagicMock
    ) -> None:
        """UPSERT mode generates ON CONFLICT DO UPDATE for PostgreSQL."""
        engine = MagicMock()
        engine.dialect = MagicMock()
        engine.dialect.name = "postgresql"
        mock_create_engine.return_value = engine

        inspector = MagicMock()
        inspector.get_columns.return_value = [
            {"name": "id"},
            {"name": "name"},
        ]
        mock_inspect.return_value = inspector

        conn = MagicMock()
        engine.begin.return_value.__enter__ = MagicMock(return_value=conn)
        engine.begin.return_value.__exit__ = MagicMock(return_value=False)

        df = pd.DataFrame({"id": [1, 2], "name": ["updated_a", "updated_b"]})

        loader = DatabaseLoader(
            "postgresql://user:pw@localhost/db",
            "test_table",
            load_mode=LoadMode.UPSERT,
            primary_keys=["id"],
        )
        result = loader.load(df)

        assert result.records_loaded == 2
        # Verify the SQL contains ON CONFLICT
        executed_sql = str(conn.execute.call_args_list[0][0][0])
        assert "ON CONFLICT" in executed_sql

    @patch("etl.loaders.database_loader.inspect")
    @patch("etl.loaders.database_loader.create_engine")
    def test_database_loader_upsert_requires_pks(
        self, mock_create_engine: MagicMock, mock_inspect: MagicMock
    ) -> None:
        """UPSERT without primary keys raises LoadError."""
        engine = MagicMock()
        engine.dialect = MagicMock()
        engine.dialect.name = "postgresql"
        mock_create_engine.return_value = engine

        inspector = MagicMock()
        inspector.get_columns.return_value = [{"name": "id"}]
        mock_inspect.return_value = inspector

        conn = MagicMock()
        engine.begin.return_value.__enter__ = MagicMock(return_value=conn)
        engine.begin.return_value.__exit__ = MagicMock(return_value=False)

        df = pd.DataFrame({"id": [1]})
        loader = DatabaseLoader(
            "postgresql://user:pw@localhost/db",
            "test_table",
            load_mode=LoadMode.UPSERT,
            primary_keys=[],
        )

        with pytest.raises(LoadError, match="primary_key"):
            loader.load(df)

    @patch("etl.loaders.database_loader.inspect")
    @patch("etl.loaders.database_loader.create_engine")
    def test_database_loader_batch_sizing(
        self, mock_create_engine: MagicMock, mock_inspect: MagicMock
    ) -> None:
        """Rows are split into batches of the configured size."""
        engine = MagicMock()
        engine.dialect = MagicMock()
        engine.dialect.name = "postgresql"
        mock_create_engine.return_value = engine

        inspector = MagicMock()
        inspector.get_columns.return_value = [{"name": "id"}, {"name": "val"}]
        mock_inspect.return_value = inspector

        conn = MagicMock()
        engine.begin.return_value.__enter__ = MagicMock(return_value=conn)
        engine.begin.return_value.__exit__ = MagicMock(return_value=False)

        # 10 rows with batch_size=3 → 4 batches (3+3+3+1)
        df = pd.DataFrame({"id": range(10), "val": range(10)})

        loader = DatabaseLoader(
            "postgresql://user:pw@localhost/db",
            "test_table",
            batch_size=3,
            load_mode=LoadMode.APPEND,
        )
        result = loader.load(df)

        assert result.records_loaded == 10
        # conn.execute should be called 4 times (once per batch)
        assert conn.execute.call_count == 4

    @patch("etl.loaders.database_loader.inspect")
    @patch("etl.loaders.database_loader.create_engine")
    def test_database_loader_empty_df(
        self, mock_create_engine: MagicMock, mock_inspect: MagicMock
    ) -> None:
        """Loading an empty DataFrame returns zero records without error."""
        engine = MagicMock()
        mock_create_engine.return_value = engine

        loader = DatabaseLoader(
            "postgresql://user:pw@localhost/db",
            "test_table",
        )
        result = loader.load(pd.DataFrame())

        assert result.records_loaded == 0
        assert result.records_failed == 0


# =========================================================================
# DataWarehouseLoader
# =========================================================================


class TestDataWarehouseLoader:
    """Tests for :class:`DataWarehouseLoader` SCD and fact loading."""

    @patch("etl.loaders.data_warehouse_loader.create_engine")
    def test_warehouse_loader_dimension_new_records(
        self, mock_create_engine: MagicMock
    ) -> None:
        """load_dimension inserts new records when dimension is empty."""
        engine = MagicMock()
        engine.dialect = MagicMock()
        engine.dialect.name = "postgresql"
        mock_create_engine.return_value = engine

        conn = MagicMock()
        engine.begin.return_value.__enter__ = MagicMock(return_value=conn)
        engine.begin.return_value.__exit__ = MagicMock(return_value=False)

        # Empty existing dimension
        empty_result = MagicMock()
        empty_result.mappings.return_value.all.return_value = []
        conn.execute.return_value = empty_result

        incoming = pd.DataFrame(
            {
                "customer_id": [1, 2, 3],
                "name": ["Alice", "Bob", "Charlie"],
                "email": ["a@x.com", "b@x.com", "c@x.com"],
            }
        )

        dim_config = DimensionConfig(
            table_name="dim_customer",
            natural_keys=["customer_id"],
            tracked_columns=["name", "email"],
        )

        loader = DataWarehouseLoader("postgresql://user:pw@localhost/dw")
        result = loader.load_dimension(incoming, dim_config)

        assert isinstance(result, LoadResult)
        assert result.records_loaded == 3
        assert result.records_failed == 0

    @patch("etl.loaders.data_warehouse_loader.create_engine")
    def test_warehouse_loader_dimension_with_changes(
        self, mock_create_engine: MagicMock
    ) -> None:
        """load_dimension detects changed rows and expires old versions."""
        engine = MagicMock()
        engine.dialect = MagicMock()
        engine.dialect.name = "postgresql"
        mock_create_engine.return_value = engine

        conn = MagicMock()
        engine.begin.return_value.__enter__ = MagicMock(return_value=conn)
        engine.begin.return_value.__exit__ = MagicMock(return_value=False)

        # Existing dimension has customer_id=1 with name "Alice"
        existing_result = MagicMock()
        existing_result.mappings.return_value.all.return_value = [
            {
                "sk_id": "aaa",
                "customer_id": 1,
                "name": "Alice",
                "email": "a@x.com",
                "is_current": True,
                "effective_start_date": "2024-01-01",
                "effective_end_date": None,
            }
        ]
        # expire returns rowcount=1
        expire_result = MagicMock()
        expire_result.rowcount = 1
        conn.execute.side_effect = [existing_result, expire_result, None]

        # Incoming has changed name for customer_id=1 and a new customer_id=2
        incoming = pd.DataFrame(
            {
                "customer_id": [1, 2],
                "name": ["Alice Updated", "Bob"],
                "email": ["a@x.com", "b@x.com"],
            }
        )

        dim_config = DimensionConfig(
            table_name="dim_customer",
            natural_keys=["customer_id"],
            tracked_columns=["name", "email"],
        )

        loader = DataWarehouseLoader("postgresql://user:pw@localhost/dw")
        result = loader.load_dimension(incoming, dim_config)

        assert isinstance(result, LoadResult)
        # Both the changed + new row should be inserted
        assert result.records_loaded == 2

    @patch("etl.loaders.data_warehouse_loader.create_engine")
    def test_warehouse_loader_fact(self, mock_create_engine: MagicMock) -> None:
        """load_fact resolves dimension keys and inserts fact rows."""
        engine = MagicMock()
        engine.dialect = MagicMock()
        engine.dialect.name = "postgresql"
        mock_create_engine.return_value = engine

        conn = MagicMock()
        engine.begin.return_value.__enter__ = MagicMock(return_value=conn)
        engine.begin.return_value.__exit__ = MagicMock(return_value=False)

        # Dimension lookup returns customer_id→sk_id mapping
        dim_result = MagicMock()
        dim_result.mappings.return_value.all.return_value = [
            {"customer_id": 1, "sk_id": "sk_001"},
            {"customer_id": 2, "sk_id": "sk_002"},
        ]
        conn.execute.return_value = dim_result

        incoming = pd.DataFrame(
            {
                "customer_id": [1, 2],
                "amount": [100.0, 200.0],
                "order_number": ["ORD-001", "ORD-002"],
            }
        )

        fact_config = FactConfig(
            table_name="fact_orders",
            measure_columns=["amount"],
            degenerate_dimensions=["order_number"],
            dimension_lookups={
                "customer_sk": DimensionLookup(
                    dimension_table="dim_customer",
                    natural_key="customer_id",
                    surrogate_key="sk_id",
                ),
            },
        )

        loader = DataWarehouseLoader("postgresql://user:pw@localhost/dw")
        result = loader.load_fact(incoming, fact_config)

        assert isinstance(result, LoadResult)
        assert result.records_loaded == 2

    @patch("etl.loaders.data_warehouse_loader.create_engine")
    def test_warehouse_loader_get_load_stats(
        self, mock_create_engine: MagicMock
    ) -> None:
        """get_load_stats returns cumulative statistics."""
        engine = MagicMock()
        mock_create_engine.return_value = engine

        loader = DataWarehouseLoader(
            "postgresql://user:pw@localhost/dw",
            etl_batch_id="test-batch-123",
        )
        stats = loader.get_load_stats()

        assert stats["etl_batch_id"] == "test-batch-123"
        assert stats["cumulative_loaded"] == 0
        assert stats["cumulative_failed"] == 0
        assert stats["last_result"] is None
