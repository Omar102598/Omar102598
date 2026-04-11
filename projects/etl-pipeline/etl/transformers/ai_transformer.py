"""AI-powered data transformations using an OpenAI client wrapper.

Provides sentiment analysis, named-entity recognition, auto-categorisation,
text summarisation, and context-driven data enrichment.  All heavy operations
batch multiple rows per API call to minimise cost and latency.
"""

from __future__ import annotations

import json
import math
from enum import Enum
from typing import Any

import pandas as pd
import structlog
from pydantic import BaseModel, Field

from etl.transformers.base_transformer import BaseTransformer, TransformError

logger: structlog.stdlib.BoundLogger = structlog.get_logger(__name__)

__all__ = ["AITransformer", "AITransformConfig", "AIOperation"]


# ---------------------------------------------------------------------------
# Enums & configuration models
# ---------------------------------------------------------------------------

class AIOperation(str, Enum):
    """Available AI-powered operations."""

    SENTIMENT = "sentiment"
    ENTITIES = "entities"
    CATEGORIZE = "categorize"
    SUMMARIZE = "summarize"
    ENRICH = "enrich"


class OperationSpec(BaseModel):
    """Configuration for a single AI operation.

    Attributes:
        operation: Which AI operation to run.
        column: Source text column.
        output_column: Name for the result column (auto-generated if omitted).
        categories: Explicit categories for ``CATEGORIZE`` operation.
        context: Free-text context/instructions for ``ENRICH`` operation.
        max_length: Target length hint for ``SUMMARIZE``.
    """

    operation: AIOperation
    column: str
    output_column: str | None = None
    categories: list[str] | None = None
    context: str | None = None
    max_length: int | None = None


class AITransformConfig(BaseModel):
    """Top-level config driving :class:`AITransformer`.

    Attributes:
        operations: Ordered list of AI operations to execute.
        batch_size: Number of rows to process per API call.
    """

    operations: list[OperationSpec] = Field(default_factory=list)
    batch_size: int = Field(default=20, ge=1, le=100)


# ---------------------------------------------------------------------------
# AITransformer
# ---------------------------------------------------------------------------

class AITransformer(BaseTransformer):
    """Transformer that delegates to an OpenAI-compatible client.

    Parameters:
        name: Human-readable identifier.
        openai_client: Client wrapper exposing ``chat_completion(messages, **kw)``.
            Expected interface (duck-typed)::

                class OpenAIClient:
                    def chat_completion(
                        self,
                        messages: list[dict[str, str]],
                        *,
                        temperature: float = 0.0,
                        response_format: dict | None = None,
                    ) -> str: ...

        config: An :class:`AITransformConfig` describing which operations to
            run and their parameters.
    """

    def __init__(
        self,
        name: str,
        openai_client: Any,
        config: AITransformConfig | None = None,
    ) -> None:
        super().__init__(name)
        self._client = openai_client
        self.config = config or AITransformConfig()

    # ------------------------------------------------------------------
    # Public AI methods
    # ------------------------------------------------------------------

    def analyze_sentiment(
        self,
        df: pd.DataFrame,
        column: str,
        output_column: str = "sentiment",
        *,
        batch_size: int = 20,
    ) -> pd.DataFrame:
        """Batch sentiment analysis on a text column.

        Each row receives a float score in ``[-1.0, 1.0]`` and a label
        (``positive``, ``negative``, ``neutral``).

        Args:
            df: Input DataFrame.
            column: Source text column.
            output_column: Base name for result columns.
            batch_size: Rows per API call.

        Returns:
            DataFrame with ``<output_column>_score`` and
            ``<output_column>_label`` columns added.
        """
        self._assert_column(df, column)
        df = df.copy()

        system = (
            "You are a sentiment analysis engine. "
            "For each text, return a JSON array of objects with keys "
            '"score" (float -1.0 to 1.0) and "label" ("positive", "negative", or "neutral").'
        )
        results = self._batch_process(
            texts=df[column].astype(str).tolist(),
            system_prompt=system,
            user_template="Analyze sentiment for these texts:\n{texts}",
            batch_size=batch_size,
        )

        df[f"{output_column}_score"] = [
            self._safe_get(r, "score", 0.0) for r in results
        ]
        df[f"{output_column}_label"] = [
            self._safe_get(r, "label", "neutral") for r in results
        ]

        self._log.info("sentiment_analyzed", column=column, rows=len(df))
        return df

    def extract_entities(
        self,
        df: pd.DataFrame,
        column: str,
        output_column: str = "entities",
        *,
        batch_size: int = 20,
    ) -> pd.DataFrame:
        """Named-entity recognition on a text column.

        Extracts persons, organisations, and locations.

        Args:
            df: Input DataFrame.
            column: Source text column.
            output_column: Result column containing entity dicts.
            batch_size: Rows per API call.

        Returns:
            DataFrame with *output_column* containing dicts
            ``{"persons": [...], "organizations": [...], "locations": [...]}``.
        """
        self._assert_column(df, column)
        df = df.copy()

        system = (
            "You are a named-entity recognition engine. "
            "For each text, return a JSON array of objects with keys "
            '"persons" (list[str]), "organizations" (list[str]), '
            'and "locations" (list[str]).'
        )
        results = self._batch_process(
            texts=df[column].astype(str).tolist(),
            system_prompt=system,
            user_template="Extract entities from these texts:\n{texts}",
            batch_size=batch_size,
        )

        default_entities: dict[str, list[str]] = {
            "persons": [],
            "organizations": [],
            "locations": [],
        }
        df[output_column] = [
            {
                "persons": self._safe_get(r, "persons", []),
                "organizations": self._safe_get(r, "organizations", []),
                "locations": self._safe_get(r, "locations", []),
            }
            if isinstance(r, dict)
            else default_entities.copy()
            for r in results
        ]

        self._log.info("entities_extracted", column=column, rows=len(df))
        return df

    def categorize(
        self,
        df: pd.DataFrame,
        column: str,
        output_column: str = "category",
        *,
        categories: list[str] | None = None,
        batch_size: int = 20,
    ) -> pd.DataFrame:
        """Auto-categorise text rows.

        When *categories* is supplied the model picks from that list;
        otherwise it discovers categories on its own.

        Args:
            df: Input DataFrame.
            column: Source text column.
            output_column: Result column.
            categories: Explicit category list, or ``None`` for discovery.
            batch_size: Rows per API call.

        Returns:
            DataFrame with *output_column* added.
        """
        self._assert_column(df, column)
        df = df.copy()

        if categories:
            cat_hint = f"Choose from these categories: {', '.join(categories)}. "
        else:
            cat_hint = "Discover appropriate categories. "

        system = (
            "You are a text classification engine. "
            f"{cat_hint}"
            'For each text, return a JSON array of objects with keys '
            '"category" (str) and "confidence" (float 0-1).'
        )
        results = self._batch_process(
            texts=df[column].astype(str).tolist(),
            system_prompt=system,
            user_template="Categorize these texts:\n{texts}",
            batch_size=batch_size,
        )

        df[output_column] = [
            self._safe_get(r, "category", "unknown") for r in results
        ]
        df[f"{output_column}_confidence"] = [
            self._safe_get(r, "confidence", 0.0) for r in results
        ]

        self._log.info("texts_categorized", column=column, rows=len(df))
        return df

    def summarize(
        self,
        df: pd.DataFrame,
        column: str,
        output_column: str = "summary",
        *,
        max_length: int | None = None,
        batch_size: int = 10,
    ) -> pd.DataFrame:
        """Summarise long text values.

        Args:
            df: Input DataFrame.
            column: Source text column.
            output_column: Result column.
            max_length: Advisory maximum character count for summaries.
            batch_size: Rows per API call.

        Returns:
            DataFrame with *output_column* added.
        """
        self._assert_column(df, column)
        df = df.copy()

        length_hint = (
            f" Keep each summary under {max_length} characters."
            if max_length
            else ""
        )
        system = (
            "You are a text summarization engine. "
            "For each text, return a JSON array of objects with a single key "
            f'"summary" (str).{length_hint}'
        )
        results = self._batch_process(
            texts=df[column].astype(str).tolist(),
            system_prompt=system,
            user_template="Summarize these texts:\n{texts}",
            batch_size=batch_size,
        )

        df[output_column] = [
            self._safe_get(r, "summary", "") for r in results
        ]

        self._log.info("texts_summarized", column=column, rows=len(df))
        return df

    def enrich_data(
        self,
        df: pd.DataFrame,
        column: str,
        output_column: str = "enrichment",
        *,
        context: str = "",
        batch_size: int = 20,
    ) -> pd.DataFrame:
        """AI-powered data enrichment based on free-text context.

        Args:
            df: Input DataFrame.
            column: Source text column.
            output_column: Result column.
            context: Instructions describing what enrichment to produce.
            batch_size: Rows per API call.

        Returns:
            DataFrame with *output_column* added.
        """
        self._assert_column(df, column)
        df = df.copy()

        system = (
            "You are a data enrichment engine. "
            f"Context: {context}. "
            "For each text, return a JSON array of objects with a key "
            '"enrichment" containing the enriched data (string or object).'
        )
        results = self._batch_process(
            texts=df[column].astype(str).tolist(),
            system_prompt=system,
            user_template="Enrich these data points:\n{texts}",
            batch_size=batch_size,
        )

        df[output_column] = [
            self._safe_get(r, "enrichment", None) for r in results
        ]

        self._log.info("data_enriched", column=column, rows=len(df))
        return df

    # ------------------------------------------------------------------
    # BaseTransformer interface
    # ------------------------------------------------------------------

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Apply all configured AI operations sequentially.

        Args:
            df: Input DataFrame.

        Returns:
            DataFrame augmented with AI-generated columns.
        """
        for spec in self.config.operations:
            out_col = spec.output_column or f"{spec.column}_{spec.operation.value}"
            batch = spec.max_length if spec.operation == AIOperation.SUMMARIZE else self.config.batch_size

            match spec.operation:
                case AIOperation.SENTIMENT:
                    df = self.analyze_sentiment(
                        df, spec.column, out_col,
                        batch_size=self.config.batch_size,
                    )
                case AIOperation.ENTITIES:
                    df = self.extract_entities(
                        df, spec.column, out_col,
                        batch_size=self.config.batch_size,
                    )
                case AIOperation.CATEGORIZE:
                    df = self.categorize(
                        df, spec.column, out_col,
                        categories=spec.categories,
                        batch_size=self.config.batch_size,
                    )
                case AIOperation.SUMMARIZE:
                    df = self.summarize(
                        df, spec.column, out_col,
                        max_length=spec.max_length,
                        batch_size=self.config.batch_size,
                    )
                case AIOperation.ENRICH:
                    df = self.enrich_data(
                        df, spec.column, out_col,
                        context=spec.context or "",
                        batch_size=self.config.batch_size,
                    )

        return df

    def validate(self, df: pd.DataFrame) -> bool:
        """Check that all configured source columns exist."""
        required = {spec.column for spec in self.config.operations}
        return required.issubset(set(df.columns))

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _batch_process(
        self,
        *,
        texts: list[str],
        system_prompt: str,
        user_template: str,
        batch_size: int,
    ) -> list[dict[str, Any]]:
        """Send *texts* to the AI client in batches.

        Each batch produces a JSON array with one entry per input row.  The
        method concatenates all batch results and returns a flat list aligned
        with the input.
        """
        all_results: list[dict[str, Any]] = []
        total_batches = math.ceil(len(texts) / batch_size)

        for batch_idx in range(total_batches):
            start = batch_idx * batch_size
            end = start + batch_size
            batch_texts = texts[start:end]

            numbered = "\n".join(
                f"{i + 1}. {t}" for i, t in enumerate(batch_texts)
            )
            user_msg = user_template.format(texts=numbered)

            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_msg},
            ]

            try:
                raw = self._client.chat_completion(
                    messages,
                    temperature=0.0,
                    response_format={"type": "json_object"},
                )
                parsed = self._parse_response(raw, expected_count=len(batch_texts))
            except TransformError:
                raise
            except Exception as exc:
                self._log.error(
                    "ai_batch_failed",
                    batch=batch_idx,
                    error=str(exc),
                )
                parsed = [{}] * len(batch_texts)

            all_results.extend(parsed)

        return all_results

    @staticmethod
    def _parse_response(
        raw: str,
        *,
        expected_count: int,
    ) -> list[dict[str, Any]]:
        """Parse the JSON response from the AI model.

        Handles both ``{"results": [...]}`` wrappers and bare arrays.
        Falls back to a list of empty dicts on malformed responses.
        """
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            return [{}] * expected_count

        if isinstance(data, list):
            results = data
        elif isinstance(data, dict):
            # Accept the first list-valued key as results
            for value in data.values():
                if isinstance(value, list):
                    results = value
                    break
            else:
                results = [data]
        else:
            results = [{}] * expected_count

        # Pad or truncate to align with input
        if len(results) < expected_count:
            results.extend([{}] * (expected_count - len(results)))
        elif len(results) > expected_count:
            results = results[:expected_count]

        return results

    @staticmethod
    def _safe_get(mapping: Any, key: str, default: Any) -> Any:
        """Extract *key* from *mapping*, returning *default* on any failure."""
        if isinstance(mapping, dict):
            return mapping.get(key, default)
        return default

    def _assert_column(self, df: pd.DataFrame, column: str) -> None:
        """Raise :class:`TransformError` if *column* is not in *df*."""
        if column not in df.columns:
            raise TransformError(
                f"Column '{column}' not found in DataFrame "
                f"(available: {list(df.columns)})",
                transformer=self.name,
            )
