"""Tests for ETL extractors (database, API, file)."""

from __future__ import annotations

import json
import time
from typing import Any
from unittest.mock import MagicMock, patch, PropertyMock

import pandas as pd
import pytest

from etl.extractors.database_extractor import DatabaseExtractor
from etl.extractors.api_extractor import APIExtractor, AuthConfig, PaginationType
from etl.extractors.file_extractor import FileExtractor, FileType
from etl.extractors.base_extractor import ExtractionError


# =========================================================================
# DatabaseExtractor
# =========================================================================


class TestDatabaseExtractor:
    """Tests for :class:`DatabaseExtractor`."""

    @patch("etl.extractors.database_extractor.create_engine")
    def test_database_extractor_extract(self, mock_create_engine: MagicMock) -> None:
        """Mock SQLAlchemy engine/connection to verify DataFrame is returned."""
        engine = MagicMock()
        mock_create_engine.return_value = engine

        expected_df = pd.DataFrame({"id": [1, 2], "name": ["a", "b"]})

        conn_ctx = MagicMock()
        conn = MagicMock()
        conn_ctx.__enter__ = MagicMock(return_value=conn)
        conn_ctx.__exit__ = MagicMock(return_value=False)
        engine.connect.return_value = conn_ctx

        with patch("etl.extractors.database_extractor.pd.read_sql", return_value=expected_df) as mock_read:
            extractor = DatabaseExtractor("postgresql://user:pw@localhost/db")
            result = extractor.extract(query="SELECT * FROM users")

        assert isinstance(result, pd.DataFrame)
        assert len(result) == 2
        assert list(result.columns) == ["id", "name"]
        mock_read.assert_called_once()

    @patch("etl.extractors.database_extractor.create_engine")
    def test_database_extractor_validate_connection(self, mock_create_engine: MagicMock) -> None:
        """validate_connection returns True when SELECT 1 succeeds."""
        engine = MagicMock()
        mock_create_engine.return_value = engine

        conn = MagicMock()
        ctx = MagicMock()
        ctx.__enter__ = MagicMock(return_value=conn)
        ctx.__exit__ = MagicMock(return_value=False)
        engine.connect.return_value = ctx

        extractor = DatabaseExtractor("postgresql://user:pw@localhost/db")
        result = extractor.validate_connection()

        assert result is True
        # Connection was opened (engine.connect called)
        engine.connect.assert_called()

    @patch("etl.extractors.database_extractor.create_engine")
    def test_database_extractor_validate_connection_failure(self, mock_create_engine: MagicMock) -> None:
        """validate_connection returns False when connection fails."""
        from sqlalchemy.exc import OperationalError

        engine = MagicMock()
        mock_create_engine.return_value = engine
        engine.connect.side_effect = OperationalError("conn failed", {}, Exception())

        extractor = DatabaseExtractor("postgresql://bad@localhost/db")
        assert extractor.validate_connection() is False

    @patch("etl.extractors.database_extractor.create_engine")
    def test_database_extractor_chunked_extract(self, mock_create_engine: MagicMock) -> None:
        """extract_chunked yields multiple DataFrames."""
        engine = MagicMock()
        mock_create_engine.return_value = engine

        chunk1 = pd.DataFrame({"id": [1, 2]})
        chunk2 = pd.DataFrame({"id": [3, 4]})

        conn_ctx = MagicMock()
        conn = MagicMock()
        conn_ctx.__enter__ = MagicMock(return_value=conn)
        conn_ctx.__exit__ = MagicMock(return_value=False)
        engine.connect.return_value = conn_ctx

        with patch(
            "etl.extractors.database_extractor.pd.read_sql",
            return_value=iter([chunk1, chunk2]),
        ):
            extractor = DatabaseExtractor("postgresql://user:pw@localhost/db")
            chunks = list(extractor.extract_chunked(table="users", chunk_size=2))

        assert len(chunks) == 2
        assert len(chunks[0]) == 2
        assert len(chunks[1]) == 2

    @patch("etl.extractors.database_extractor.create_engine")
    def test_database_extractor_extract_requires_query_or_table(
        self, mock_create_engine: MagicMock
    ) -> None:
        """extract raises ValueError when neither query nor table is given."""
        mock_create_engine.return_value = MagicMock()
        extractor = DatabaseExtractor("postgresql://user:pw@localhost/db")

        with pytest.raises(ValueError, match="Supply exactly one"):
            extractor.extract()

        with pytest.raises(ValueError, match="Supply exactly one"):
            extractor.extract(query="SELECT 1", table="t")


# =========================================================================
# APIExtractor
# =========================================================================


class TestAPIExtractor:
    """Tests for :class:`APIExtractor`."""

    @patch("etl.extractors.api_extractor.requests.Session")
    def test_api_extractor_extract(self, mock_session_cls: MagicMock) -> None:
        """extract returns DataFrame from JSON API response."""
        session = MagicMock()
        mock_session_cls.return_value = session

        response = MagicMock()
        response.json.return_value = [
            {"id": 1, "name": "Alice"},
            {"id": 2, "name": "Bob"},
        ]
        response.raise_for_status.return_value = None
        session.request.return_value = response

        extractor = APIExtractor("https://api.example.com")
        extractor._session = session
        df = extractor.extract(endpoint="/users")

        assert isinstance(df, pd.DataFrame)
        assert len(df) == 2
        assert "id" in df.columns

    @patch("etl.extractors.api_extractor.requests.Session")
    def test_api_extractor_extract_with_pagination(
        self, mock_session_cls: MagicMock
    ) -> None:
        """extract handles offset-based pagination correctly."""
        session = MagicMock()
        mock_session_cls.return_value = session

        # Page 1
        resp1 = MagicMock()
        resp1.json.return_value = {
            "data": [{"id": 1}, {"id": 2}],
            "total": 3,
        }
        resp1.raise_for_status.return_value = None

        # Page 2
        resp2 = MagicMock()
        resp2.json.return_value = {
            "data": [{"id": 3}],
            "total": 3,
        }
        resp2.raise_for_status.return_value = None

        session.request.side_effect = [resp1, resp2]

        extractor = APIExtractor("https://api.example.com")
        extractor._session = session
        df = extractor.extract(
            endpoint="/items",
            pagination=PaginationType.OFFSET,
            page_size=2,
            data_field="data",
            total_field="total",
        )

        assert len(df) == 3
        assert session.request.call_count == 2

    @patch("etl.extractors.api_extractor.requests.Session")
    def test_api_extractor_rate_limiting(
        self,
        mock_session_cls: MagicMock,
    ) -> None:
        """Rate limiter enforces minimum interval between requests."""
        session = MagicMock()
        mock_session_cls.return_value = session

        response = MagicMock()
        response.json.return_value = [{"id": 1}]
        response.raise_for_status.return_value = None
        session.request.return_value = response

        extractor = APIExtractor(
            "https://api.example.com",
            rate_limit_per_second=1.0,
        )
        extractor._session = session

        # Patch sleep only on the _apply_rate_limit path
        with patch.object(extractor, "_apply_rate_limit", wraps=extractor._apply_rate_limit):
            # Force _last_request_time to be "just now" so the next call must wait
            import time as _time

            extractor._last_request_time = _time.monotonic()

            with patch("etl.extractors.api_extractor.time.sleep") as mock_sleep:
                # Re-assign _last_request_time to now inside _apply_rate_limit
                # The rate_limit is 1 req/s so min_interval = 1.0s
                # Since elapsed ≈ 0, sleep should be called
                extractor._apply_rate_limit()
                assert mock_sleep.call_count >= 1

    @pytest.mark.parametrize(
        "json_path,expected_len",
        [
            (None, 2),
            ("results", 2),
        ],
    )
    @patch("etl.extractors.api_extractor.requests.Session")
    def test_api_extractor_json_path(
        self,
        mock_session_cls: MagicMock,
        json_path: str | None,
        expected_len: int,
    ) -> None:
        """extract correctly resolves json_path in response."""
        session = MagicMock()
        mock_session_cls.return_value = session

        payload: dict[str, Any] = {
            "results": [{"id": 1}, {"id": 2}],
        }
        if json_path is None:
            # When no json_path, root must be a list
            payload = [{"id": 1}, {"id": 2}]  # type: ignore[assignment]

        resp = MagicMock()
        resp.json.return_value = payload
        resp.raise_for_status.return_value = None
        session.request.return_value = resp

        extractor = APIExtractor("https://api.example.com")
        extractor._session = session
        df = extractor.extract(endpoint="/data", json_path=json_path)

        assert len(df) == expected_len


# =========================================================================
# FileExtractor
# =========================================================================


class TestFileExtractor:
    """Tests for :class:`FileExtractor`."""

    def test_file_extractor_csv(self, sample_csv_file: str) -> None:
        """Read a real temp CSV file and verify contents."""
        extractor = FileExtractor(sample_csv_file, file_type=FileType.CSV)
        df = extractor.extract()

        assert isinstance(df, pd.DataFrame)
        assert len(df) == 12
        assert "id" in df.columns
        assert "name" in df.columns

    def test_file_extractor_json(self, sample_json_file: str) -> None:
        """Read a real temp JSON file and verify contents."""
        extractor = FileExtractor(sample_json_file, file_type=FileType.JSON)
        df = extractor.extract()

        assert isinstance(df, pd.DataFrame)
        assert len(df) == 10
        assert "transaction_id" in df.columns
        assert "amount" in df.columns

    def test_file_extractor_validate_connection(self, sample_csv_file: str) -> None:
        """validate_connection returns True for an existing file."""
        extractor = FileExtractor(sample_csv_file)
        assert extractor.validate_connection() is True

    def test_file_extractor_validate_connection_missing(self) -> None:
        """validate_connection returns False for a non-existent file."""
        extractor = FileExtractor("/nonexistent/file.csv")
        assert extractor.validate_connection() is False

    def test_file_extractor_get_metadata(self, sample_csv_file: str) -> None:
        """get_metadata returns correct file info."""
        extractor = FileExtractor(sample_csv_file)
        meta = extractor.get_metadata()

        assert meta["file_path"] == sample_csv_file
        assert meta["file_type"] == "csv"
        assert meta["is_s3"] is False
        assert "size_bytes" in meta

    @pytest.mark.parametrize(
        "ext,expected_type",
        [
            (".csv", FileType.CSV),
            (".json", FileType.JSON),
            (".parquet", FileType.PARQUET),
            (".xlsx", FileType.EXCEL),
        ],
    )
    def test_file_extractor_type_detection(
        self, ext: str, expected_type: FileType
    ) -> None:
        """File type is correctly detected from extension."""
        detected = FileExtractor._detect_file_type(f"data/sample{ext}")
        assert detected == expected_type
