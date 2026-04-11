"""AI-powered schema inference for DataFrames."""

from __future__ import annotations

import json
from typing import Any

import pandas as pd
from pydantic import BaseModel, Field

from etl.ai.openai_client import OpenAIClient, OpenAIClientError

__all__ = [
    "SchemaInferenceEngine",
    "InferredSchema",
    "ColumnSchema",
    "RelationshipInfo",
]

# Maximum rows to sample for AI prompts to keep token usage reasonable.
_SAMPLE_HEAD: int = 5
_SAMPLE_RANDOM: int = 10


class ColumnSchema(BaseModel):
    """Schema metadata for a single column."""

    name: str
    inferred_type: str
    nullable: bool = True
    description: str = ""
    sample_values: list[Any] = Field(default_factory=list)


class RelationshipInfo(BaseModel):
    """Describes a detected foreign-key relationship between two tables."""

    source_table: str
    source_column: str
    target_table: str
    target_column: str
    confidence: float = Field(ge=0.0, le=1.0)


class InferredSchema(BaseModel):
    """Full inferred schema for a DataFrame (or set of DataFrames)."""

    columns: list[ColumnSchema] = Field(default_factory=list)
    relationships: list[RelationshipInfo] = Field(default_factory=list)
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)


class SchemaInferenceEngine:
    """Use an LLM to infer column types, descriptions, and relationships.

    Parameters
    ----------
    client:
        An ``OpenAIClient`` instance used for all AI calls.
    sample_head:
        Number of head rows to include in the sample sent to the model.
    sample_random:
        Number of additional random rows to include in the sample.
    """

    def __init__(
        self,
        client: OpenAIClient,
        *,
        sample_head: int = _SAMPLE_HEAD,
        sample_random: int = _SAMPLE_RANDOM,
    ) -> None:
        self._client = client
        self._sample_head = sample_head
        self._sample_random = sample_random

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def infer_schema(self, df: pd.DataFrame) -> InferredSchema:
        """Analyse *df* and return an ``InferredSchema`` with AI-inferred types."""
        sample_text = self._build_sample_text(df)
        dtypes_text = "\n".join(
            f"  {col}: pandas dtype={df[col].dtype}, nulls={df[col].isna().sum()}/{len(df)}"
            for col in df.columns
        )

        prompt = (
            "Analyse the following DataFrame and infer a schema.\n\n"
            f"Columns & pandas dtypes:\n{dtypes_text}\n\n"
            f"Sample rows (head + random):\n{sample_text}\n\n"
            "Return a JSON object with keys:\n"
            '  "columns": list of objects with keys "name", "inferred_type" '
            '(SQL-style type), "nullable" (bool), "description" (short), '
            '"sample_values" (up to 3 representative values)\n'
            '  "confidence": float 0-1 indicating overall confidence\n'
        )

        try:
            result = self._client.complete_json(
                prompt=prompt,
                system_prompt=(
                    "You are a data-engineering assistant. Respond with valid JSON only."
                ),
            )
        except OpenAIClientError:
            return self._fallback_schema(df)

        return self._parse_schema_response(result, df)

    def detect_relationships(
        self,
        dfs: dict[str, pd.DataFrame],
    ) -> list[RelationshipInfo]:
        """Detect likely foreign-key relationships among multiple tables."""
        table_summaries: list[str] = []
        for name, df in dfs.items():
            cols = ", ".join(
                f"{c} ({df[c].dtype})" for c in df.columns
            )
            table_summaries.append(f"Table '{name}': [{cols}]")

        prompt = (
            "Given the following tables, identify likely foreign-key relationships.\n\n"
            + "\n".join(table_summaries)
            + "\n\nReturn a JSON object with key \"relationships\": list of objects "
            "with keys \"source_table\", \"source_column\", \"target_table\", "
            "\"target_column\", \"confidence\" (0-1)."
        )

        try:
            result = self._client.complete_json(
                prompt=prompt,
                system_prompt="You are a data-engineering assistant. Respond with valid JSON only.",
            )
        except OpenAIClientError:
            return []

        relationships: list[RelationshipInfo] = []
        for raw in result.get("relationships", []):
            try:
                relationships.append(RelationshipInfo(**raw))
            except Exception:  # noqa: BLE001
                continue
        return relationships

    def suggest_naming_conventions(
        self,
        df: pd.DataFrame,
    ) -> dict[str, str]:
        """Suggest cleaner / more descriptive column names for *df*.

        Returns a mapping ``{current_name: suggested_name}``.
        """
        sample_text = self._build_sample_text(df)
        prompt = (
            "Suggest improved, snake_case column names for the following DataFrame.\n\n"
            f"Current columns: {list(df.columns)}\n"
            f"Sample data:\n{sample_text}\n\n"
            "Return a JSON object mapping each current column name to its "
            "suggested new name."
        )

        try:
            result = self._client.complete_json(
                prompt=prompt,
                system_prompt="You are a data-engineering assistant. Respond with valid JSON only.",
            )
        except OpenAIClientError:
            return {col: col for col in df.columns}

        mapping: dict[str, str] = {}
        for col in df.columns:
            mapping[col] = result.get(col, col)
        return mapping

    def generate_documentation(self, schema: InferredSchema) -> str:
        """Generate human-readable Markdown documentation for *schema*."""
        prompt = (
            "Generate comprehensive Markdown documentation for the following "
            "data schema.  Include a summary section, a column table, and a "
            "relationships section.\n\n"
            f"Schema JSON:\n```json\n{schema.model_dump_json(indent=2)}\n```"
        )

        try:
            return self._client.complete(
                prompt=prompt,
                system_prompt="You are a technical writer. Output clean Markdown.",
                temperature=0.2,
            )
        except OpenAIClientError:
            return self._fallback_documentation(schema)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _build_sample_text(self, df: pd.DataFrame) -> str:
        """Return a concise text representation of a data sample."""
        head = df.head(self._sample_head)
        n_random = min(self._sample_random, max(0, len(df) - self._sample_head))
        if n_random > 0:
            random_rows = df.iloc[self._sample_head:].sample(
                n=n_random, random_state=42
            )
            sample = pd.concat([head, random_rows])
        else:
            sample = head
        return sample.to_string(max_rows=self._sample_head + self._sample_random)

    def _parse_schema_response(
        self,
        result: dict[str, Any],
        df: pd.DataFrame,
    ) -> InferredSchema:
        columns: list[ColumnSchema] = []
        for raw in result.get("columns", []):
            try:
                columns.append(ColumnSchema(**raw))
            except Exception:  # noqa: BLE001
                continue

        # Ensure every DataFrame column is represented.
        existing_names = {c.name for c in columns}
        for col in df.columns:
            if col not in existing_names:
                columns.append(
                    ColumnSchema(
                        name=col,
                        inferred_type=str(df[col].dtype),
                        nullable=bool(df[col].isna().any()),
                        description="",
                        sample_values=df[col].dropna().head(3).tolist(),
                    )
                )

        confidence = float(result.get("confidence", 0.5))
        return InferredSchema(columns=columns, confidence=confidence)

    def _fallback_schema(self, df: pd.DataFrame) -> InferredSchema:
        """Build a schema purely from pandas metadata when AI is unavailable."""
        columns = [
            ColumnSchema(
                name=col,
                inferred_type=str(df[col].dtype),
                nullable=bool(df[col].isna().any()),
                description="",
                sample_values=df[col].dropna().head(3).tolist(),
            )
            for col in df.columns
        ]
        return InferredSchema(columns=columns, confidence=0.3)

    @staticmethod
    def _fallback_documentation(schema: InferredSchema) -> str:
        lines = ["# Schema Documentation\n"]
        lines.append("| Column | Type | Nullable | Description |")
        lines.append("|--------|------|----------|-------------|")
        for col in schema.columns:
            lines.append(
                f"| {col.name} | {col.inferred_type} | "
                f"{'Yes' if col.nullable else 'No'} | {col.description} |"
            )
        if schema.relationships:
            lines.append("\n## Relationships\n")
            for rel in schema.relationships:
                lines.append(
                    f"- **{rel.source_table}.{rel.source_column}** → "
                    f"**{rel.target_table}.{rel.target_column}** "
                    f"(confidence: {rel.confidence:.0%})"
                )
        return "\n".join(lines)
