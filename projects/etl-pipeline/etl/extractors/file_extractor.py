"""File-based extractor supporting CSV, JSON, Parquet, Excel, local FS and S3.

Handles encoding detection, schema inference, chunked reads, and glob-based
multi-file ingestion.
"""

from __future__ import annotations

import enum
import glob as glob_mod
import io
from collections.abc import Generator
from typing import Any

import pandas as pd
import structlog

from etl.extractors.base_extractor import (
    BaseExtractor,
    ExtractionError,
)

logger: structlog.stdlib.BoundLogger = structlog.get_logger(__name__)

__all__ = ["FileExtractor", "FileType"]


# ---------------------------------------------------------------------------
# Supporting types
# ---------------------------------------------------------------------------


class FileType(enum.Enum):
    """Supported file formats."""

    CSV = "csv"
    JSON = "json"
    PARQUET = "parquet"
    EXCEL = "excel"


class FileExtractor(BaseExtractor):
    """Extract tabular data from local or S3-hosted files.

    Parameters:
        file_path: Local path, glob pattern, or ``s3://bucket/key`` URI.
        file_type: Explicit :class:`FileType`; auto-detected from the
            extension when ``None``.
        s3_kwargs: Extra keyword arguments forwarded to :mod:`boto3`
            (e.g. ``{"region_name": "us-east-1"}``).
        read_options: Extra keyword arguments forwarded to the underlying
            pandas ``read_*`` function.
        max_retries: Retry ceiling passed to the base class.
    """

    _EXTENSION_MAP: dict[str, FileType] = {
        ".csv": FileType.CSV,
        ".tsv": FileType.CSV,
        ".json": FileType.JSON,
        ".jsonl": FileType.JSON,
        ".parquet": FileType.PARQUET,
        ".pq": FileType.PARQUET,
        ".xlsx": FileType.EXCEL,
        ".xls": FileType.EXCEL,
    }

    def __init__(
        self,
        file_path: str,
        *,
        file_type: FileType | None = None,
        s3_kwargs: dict[str, Any] | None = None,
        read_options: dict[str, Any] | None = None,
        max_retries: int = 3,
    ) -> None:
        super().__init__(source_name=file_path, max_retries=max_retries)
        self._file_path = file_path
        self._file_type = file_type or self._detect_file_type(file_path)
        self._is_s3 = file_path.startswith("s3://")
        self._s3_kwargs = s3_kwargs or {}
        self._read_options = read_options or {}
        self._log = logger.bind(extractor="FileExtractor", path=file_path)

    # ------------------------------------------------------------------
    # File-type detection
    # ------------------------------------------------------------------

    @classmethod
    def _detect_file_type(cls, path: str) -> FileType:
        """Infer :class:`FileType` from the file extension.

        Raises:
            ExtractionError: If the extension is not recognised.
        """
        import pathlib

        # Strip any glob characters for detection
        clean = path.split("*")[0].rstrip("/")
        suffix = pathlib.PurePosixPath(clean).suffix.lower()

        ft = cls._EXTENSION_MAP.get(suffix)
        if ft is None:
            raise ExtractionError(
                f"Cannot detect file type from extension '{suffix}'. "
                "Provide an explicit file_type.",
                source=path,
            )
        return ft

    # ------------------------------------------------------------------
    # S3 helpers
    # ------------------------------------------------------------------

    def _get_s3_client(self) -> Any:
        """Return a ``boto3`` S3 client, importing lazily to keep the
        dependency optional.
        """
        try:
            import boto3
        except ImportError as exc:
            raise ExtractionError(
                "boto3 is required for S3 support. Install it with: pip install boto3",
                source=self._file_path,
                cause=exc,
            ) from exc
        return boto3.client("s3", **self._s3_kwargs)

    @staticmethod
    def _parse_s3_uri(uri: str) -> tuple[str, str]:
        """Split an ``s3://bucket/key`` URI into ``(bucket, key)``."""
        without_scheme = uri[len("s3://"):]
        bucket, _, key = without_scheme.partition("/")
        return bucket, key

    def _read_s3_bytes(self) -> bytes:
        """Download the S3 object into memory and return raw bytes."""
        client = self._get_s3_client()
        bucket, key = self._parse_s3_uri(self._file_path)
        try:
            response = client.get_object(Bucket=bucket, Key=key)
            return response["Body"].read()
        except Exception as exc:
            raise ExtractionError(
                f"Failed to read S3 object s3://{bucket}/{key}: {exc}",
                source=self._file_path,
                cause=exc,
            ) from exc

    # ------------------------------------------------------------------
    # Reading helpers
    # ------------------------------------------------------------------

    def _read_file(self, path_or_buffer: str | io.BytesIO, **extra: Any) -> pd.DataFrame:
        """Dispatch to the correct pandas reader based on :attr:`_file_type`."""
        opts = {**self._read_options, **extra}

        match self._file_type:
            case FileType.CSV:
                if isinstance(path_or_buffer, str) and not self._is_s3:
                    encoding = opts.pop("encoding", None) or self.detect_encoding(path_or_buffer)
                    opts["encoding"] = encoding
                return pd.read_csv(path_or_buffer, **opts)

            case FileType.JSON:
                lines = opts.pop("lines", None)
                if lines is None and self._file_path.endswith(".jsonl"):
                    lines = True
                return pd.read_json(path_or_buffer, lines=lines, **opts)

            case FileType.PARQUET:
                return pd.read_parquet(path_or_buffer, **opts)

            case FileType.EXCEL:
                return pd.read_excel(path_or_buffer, **opts)

        raise ExtractionError(f"Unsupported file type: {self._file_type}", source=self._file_path)  # pragma: no cover

    # ------------------------------------------------------------------
    # Abstract interface implementation
    # ------------------------------------------------------------------

    def extract(self, **kwargs: Any) -> pd.DataFrame:
        """Read the configured file(s) and return a single DataFrame.

        Glob patterns are expanded and all matching files are concatenated.
        S3 URIs are downloaded in-memory before parsing.

        Any extra *kwargs* are forwarded to the underlying pandas reader.
        """
        try:
            if self._is_s3:
                raw = self._read_s3_bytes()
                buf = io.BytesIO(raw)
                df = self._read_file(buf, **kwargs)
            elif any(c in self._file_path for c in ("*", "?", "[")):
                df = self._read_glob(**kwargs)
            else:
                df = self._read_file(self._file_path, **kwargs)
        except ExtractionError:
            raise
        except Exception as exc:
            raise ExtractionError(
                f"Failed to read file '{self._file_path}': {exc}",
                source=self._file_path,
                cause=exc,
            ) from exc

        self._log.info("extract_success", rows=len(df), columns=list(df.columns))
        return df

    def validate_connection(self) -> bool:
        """Verify the file (or S3 object) exists and is accessible."""
        try:
            if self._is_s3:
                client = self._get_s3_client()
                bucket, key = self._parse_s3_uri(self._file_path)
                client.head_object(Bucket=bucket, Key=key)
                return True

            import pathlib

            # For glob patterns, check at least one match exists
            if any(c in self._file_path for c in ("*", "?", "[")):
                return len(glob_mod.glob(self._file_path)) > 0

            return pathlib.Path(self._file_path).is_file()
        except Exception as exc:
            self._log.warning("connection_validation_failed", error=str(exc))
            return False

    def get_metadata(self) -> dict[str, Any]:
        """Return metadata about the configured file source."""
        meta: dict[str, Any] = {
            "file_path": self._file_path,
            "file_type": self._file_type.value,
            "is_s3": self._is_s3,
        }

        if not self._is_s3 and not any(c in self._file_path for c in ("*", "?", "[")):
            import os

            if os.path.isfile(self._file_path):
                meta["size_bytes"] = os.path.getsize(self._file_path)

        if not self._is_s3 and any(c in self._file_path for c in ("*", "?", "[")):
            meta["matched_files"] = sorted(glob_mod.glob(self._file_path))

        return meta

    # ------------------------------------------------------------------
    # Extended helpers
    # ------------------------------------------------------------------

    @staticmethod
    def detect_encoding(path: str, sample_size: int = 65_536) -> str:
        """Detect the character encoding of a file using :mod:`chardet`.

        Falls back to ``utf-8`` if ``chardet`` is unavailable or detection
        confidence is too low.

        Args:
            path: Path to a local file.
            sample_size: Number of bytes to sample for detection.

        Returns:
            Detected encoding string (e.g. ``"utf-8"``, ``"latin-1"``).
        """
        try:
            import chardet
        except ImportError:
            return "utf-8"

        with open(path, "rb") as fh:
            raw = fh.read(sample_size)

        result = chardet.detect(raw)
        encoding = result.get("encoding", "utf-8") or "utf-8"
        confidence = result.get("confidence", 0.0) or 0.0

        if confidence < 0.5:
            logger.warning(
                "low_encoding_confidence",
                path=path,
                detected=encoding,
                confidence=confidence,
            )
            return "utf-8"

        return encoding

    def detect_schema(self, sample_rows: int = 1000) -> dict[str, str]:
        """Infer column names and pandas dtypes from a small sample.

        Args:
            sample_rows: Number of rows to read for inference.

        Returns:
            Mapping of column name → dtype string.
        """
        df = self.extract(nrows=sample_rows) if self._file_type == FileType.CSV else self.extract()
        if len(df) > sample_rows:
            df = df.head(sample_rows)
        return {col: str(dtype) for col, dtype in df.dtypes.items()}

    def extract_chunked(self, chunk_size: int = 10_000, **kwargs: Any) -> Generator[pd.DataFrame, None, None]:
        """Yield successive DataFrame chunks for memory-efficient reads.

        Currently supported only for CSV files (via ``pandas.read_csv``
        ``chunksize`` argument).  For other formats the entire file is
        yielded as a single chunk.

        Args:
            chunk_size: Number of rows per chunk.
            **kwargs: Extra arguments forwarded to the reader.

        Yields:
            DataFrames of at most *chunk_size* rows.
        """
        if self._file_type == FileType.CSV and not self._is_s3:
            opts = {**self._read_options, **kwargs, "chunksize": chunk_size}

            if not self._is_s3:
                encoding = opts.pop("encoding", None) or self.detect_encoding(self._file_path)
                opts["encoding"] = encoding

            reader = pd.read_csv(self._file_path, **opts)
            for idx, chunk in enumerate(reader):
                self._log.debug("chunk_read", chunk_index=idx, rows=len(chunk))
                yield chunk
        else:
            # Fallback: return the whole file as one chunk
            yield self.extract(**kwargs)

    # ------------------------------------------------------------------
    # Glob support
    # ------------------------------------------------------------------

    def _read_glob(self, **kwargs: Any) -> pd.DataFrame:
        """Expand a glob pattern and concatenate all matching files."""
        paths = sorted(glob_mod.glob(self._file_path))
        if not paths:
            raise ExtractionError(
                f"No files matched glob pattern '{self._file_path}'",
                source=self._file_path,
            )

        frames: list[pd.DataFrame] = []
        for p in paths:
            self._log.debug("reading_glob_match", path=p)
            frames.append(self._read_file(p, **kwargs))

        df = pd.concat(frames, ignore_index=True)
        self._log.info("glob_read_complete", files=len(paths), total_rows=len(df))
        return df
