"""Configuration management using pydantic-settings with YAML overlay support."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

__all__ = [
    "DatabaseConfig",
    "AIConfig",
    "S3Config",
    "PipelineConfig",
    "load_yaml_config",
]


class DatabaseConfig(BaseSettings):
    """Relational database connection settings."""

    model_config = SettingsConfigDict(env_prefix="ENV_DB_")

    host: str = "localhost"
    port: int = Field(default=5432, ge=1, le=65535)
    database: str = "etl_db"
    username: str = "etl_user"
    password: str = "PLACEHOLDER_DB_PASSWORD"
    pool_size: int = Field(default=5, ge=1)
    max_overflow: int = Field(default=10, ge=0)

    @field_validator("host")
    @classmethod
    def _host_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Database host must not be empty")
        return v.strip()

    @field_validator("database", "username")
    @classmethod
    def _non_empty_string(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Value must not be empty")
        return v.strip()


class AIConfig(BaseSettings):
    """OpenAI / LLM configuration."""

    model_config = SettingsConfigDict(env_prefix="ENV_AI_")

    openai_api_key: str = "PLACEHOLDER_OPENAI_API_KEY"
    model: str = "gpt-4o"
    max_tokens: int = Field(default=4096, ge=1)
    temperature: float = Field(default=0.0, ge=0.0, le=2.0)
    cache_ttl: float = Field(default=300.0, ge=0.0)

    @field_validator("model")
    @classmethod
    def _model_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Model name must not be empty")
        return v.strip()


class S3Config(BaseSettings):
    """AWS S3 storage settings."""

    model_config = SettingsConfigDict(env_prefix="ENV_S3_")

    bucket: str = "etl-data-bucket"
    prefix: str = "raw/"
    region: str = "us-east-1"
    access_key: str = "PLACEHOLDER_AWS_ACCESS_KEY"
    secret_key: str = "PLACEHOLDER_AWS_SECRET_KEY"

    @field_validator("bucket")
    @classmethod
    def _bucket_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("S3 bucket must not be empty")
        return v.strip()


class PipelineConfig(BaseSettings):
    """Top-level pipeline configuration aggregating all sub-configs."""

    model_config = SettingsConfigDict(env_prefix="ENV_PIPELINE_")

    pipeline_name: str = "default_pipeline"
    batch_size: int = Field(default=1000, ge=1)
    max_retries: int = Field(default=3, ge=0)
    database: DatabaseConfig = Field(default_factory=DatabaseConfig)
    ai: AIConfig = Field(default_factory=AIConfig)
    s3: S3Config = Field(default_factory=S3Config)

    @field_validator("pipeline_name")
    @classmethod
    def _name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Pipeline name must not be empty")
        return v.strip()


def load_yaml_config(path: str | Path) -> PipelineConfig:
    """Load a ``PipelineConfig`` from a YAML file.

    The YAML structure must mirror the ``PipelineConfig`` model.  Any
    keys not present in the file fall back to defaults / environment
    variables.

    Parameters
    ----------
    path:
        Path to the YAML configuration file.

    Returns
    -------
    PipelineConfig
        A fully validated configuration instance.
    """
    file_path = Path(path)
    if not file_path.is_file():
        raise FileNotFoundError(f"Configuration file not found: {file_path}")

    with file_path.open("r", encoding="utf-8") as fh:
        raw: dict[str, Any] = yaml.safe_load(fh) or {}

    # Expand nested sub-configs so pydantic-settings picks them up.
    db_data = raw.pop("database", {})
    ai_data = raw.pop("ai", {})
    s3_data = raw.pop("s3", {})

    return PipelineConfig(
        **raw,
        database=DatabaseConfig(**db_data),
        ai=AIConfig(**ai_data),
        s3=S3Config(**s3_data),
    )
