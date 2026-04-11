"""OpenAI API wrapper with caching, rate limiting, and retry logic."""

from __future__ import annotations

import hashlib
import json
import time
import threading
from collections import OrderedDict
from dataclasses import dataclass, field
from typing import Any, Generator

import openai
import tiktoken
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

__all__ = [
    "OpenAIClient",
    "OpenAIClientError",
    "RateLimitError",
    "TokenLimitError",
    "CachedResponse",
]


class OpenAIClientError(Exception):
    """Base exception for OpenAI client errors."""


class RateLimitError(OpenAIClientError):
    """Raised when the API rate limit is exceeded."""


class TokenLimitError(OpenAIClientError):
    """Raised when the token limit for a request is exceeded."""


@dataclass(frozen=True, slots=True)
class CachedResponse:
    """Immutable cached API response with metadata."""

    response: str
    timestamp: float
    token_count: int


class _TokenBucket:
    """Thread-safe token-bucket rate limiter."""

    def __init__(self, tokens_per_second: float, max_tokens: int) -> None:
        self._rate = tokens_per_second
        self._max = float(max_tokens)
        self._tokens = float(max_tokens)
        self._last_refill = time.monotonic()
        self._lock = threading.Lock()

    def acquire(self, tokens: int = 1) -> None:
        """Block until *tokens* are available, then consume them."""
        while True:
            with self._lock:
                self._refill()
                if self._tokens >= tokens:
                    self._tokens -= tokens
                    return
            time.sleep(0.05)

    def _refill(self) -> None:
        now = time.monotonic()
        elapsed = now - self._last_refill
        self._tokens = min(self._max, self._tokens + elapsed * self._rate)
        self._last_refill = now


class _LRUCache:
    """Thread-safe LRU cache with optional TTL (seconds)."""

    def __init__(self, max_size: int = 128, ttl: float | None = None) -> None:
        self._max_size = max_size
        self._ttl = ttl
        self._data: OrderedDict[str, CachedResponse] = OrderedDict()
        self._lock = threading.Lock()

    def get(self, key: str) -> CachedResponse | None:
        with self._lock:
            entry = self._data.get(key)
            if entry is None:
                return None
            if self._ttl is not None and (time.time() - entry.timestamp) > self._ttl:
                del self._data[key]
                return None
            self._data.move_to_end(key)
            return entry

    def put(self, key: str, value: CachedResponse) -> None:
        with self._lock:
            if key in self._data:
                self._data.move_to_end(key)
            self._data[key] = value
            if len(self._data) > self._max_size:
                self._data.popitem(last=False)


class OpenAIClient:
    """High-level OpenAI API client with caching and rate limiting.

    Parameters
    ----------
    api_key:
        OpenAI API key.  Defaults to a placeholder for development.
    model:
        Chat model identifier.
    max_retries:
        Maximum number of retries on transient failures.
    cache_size:
        Maximum number of cached responses.
    cache_ttl:
        Time-to-live (seconds) for cached responses.  ``None`` = no expiry.
    requests_per_second:
        Token-bucket refill rate for rate limiting.
    """

    def __init__(
        self,
        api_key: str = "PLACEHOLDER_OPENAI_API_KEY",
        model: str = "gpt-4o",
        max_retries: int = 3,
        cache_size: int = 128,
        cache_ttl: float | None = 300.0,
        requests_per_second: float = 10.0,
    ) -> None:
        self._api_key = api_key
        self._model = model
        self._max_retries = max_retries
        self._client = openai.OpenAI(api_key=api_key)
        self._cache = _LRUCache(max_size=cache_size, ttl=cache_ttl)
        self._rate_limiter = _TokenBucket(
            tokens_per_second=requests_per_second,
            max_tokens=int(requests_per_second * 2),
        )
        try:
            self._encoding = tiktoken.encoding_for_model(model)
        except KeyError:
            self._encoding = tiktoken.get_encoding("cl100k_base")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def complete(
        self,
        prompt: str,
        system_prompt: str = "You are a helpful assistant.",
        temperature: float = 0.0,
        max_tokens: int = 4096,
    ) -> str:
        """Return a chat-completion response, using the cache when possible."""
        cache_key = self._cache_key(prompt, system_prompt, temperature, max_tokens)
        cached = self._cache.get(cache_key)
        if cached is not None:
            return cached.response

        self._check_rate_limit()
        response_text = self._call_with_retry(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        self._cache.put(
            cache_key,
            CachedResponse(
                response=response_text,
                timestamp=time.time(),
                token_count=self.count_tokens(response_text),
            ),
        )
        return response_text

    def complete_json(
        self,
        prompt: str,
        system_prompt: str = "You are a helpful assistant. Always respond with valid JSON.",
    ) -> dict[str, Any]:
        """Return a parsed JSON dict from a chat-completion call."""
        cache_key = self._cache_key(prompt, system_prompt, 0.0, 4096, json_mode=True)
        cached = self._cache.get(cache_key)
        if cached is not None:
            return json.loads(cached.response)

        self._check_rate_limit()
        response_text = self._call_json_with_retry(
            prompt=prompt,
            system_prompt=system_prompt,
        )
        try:
            parsed: dict[str, Any] = json.loads(response_text)
        except json.JSONDecodeError as exc:
            raise OpenAIClientError(
                f"Failed to parse JSON response: {exc}"
            ) from exc

        self._cache.put(
            cache_key,
            CachedResponse(
                response=response_text,
                timestamp=time.time(),
                token_count=self.count_tokens(response_text),
            ),
        )
        return parsed

    def stream_complete(
        self,
        prompt: str,
        system_prompt: str = "You are a helpful assistant.",
        temperature: float = 0.0,
        max_tokens: int = 4096,
    ) -> Generator[str, None, None]:
        """Yield streamed response chunks from the API."""
        self._check_rate_limit()
        try:
            stream = self._client.chat.completions.create(
                model=self._model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True,
            )
            for chunk in stream:
                delta = chunk.choices[0].delta
                if delta.content:
                    yield delta.content
        except openai.RateLimitError as exc:
            raise RateLimitError(str(exc)) from exc
        except openai.APIError as exc:
            raise OpenAIClientError(str(exc)) from exc

    def count_tokens(self, text: str) -> int:
        """Return the number of tokens in *text* for the configured model."""
        return len(self._encoding.encode(text))

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _check_rate_limit(self) -> None:
        """Block until the rate limiter allows a new request."""
        self._rate_limiter.acquire()

    @retry(
        retry=retry_if_exception_type(openai.RateLimitError),
        wait=wait_exponential(multiplier=1, min=1, max=30),
        stop=stop_after_attempt(3),
        reraise=True,
    )
    def _call_with_retry(
        self,
        prompt: str,
        system_prompt: str,
        temperature: float,
        max_tokens: int,
    ) -> str:
        try:
            total_prompt_tokens = self.count_tokens(system_prompt) + self.count_tokens(prompt)
            if total_prompt_tokens + max_tokens > 128_000:
                raise TokenLimitError(
                    f"Request would use ~{total_prompt_tokens + max_tokens} tokens, "
                    "exceeding the 128 000-token context window."
                )
            response = self._client.chat.completions.create(
                model=self._model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
                temperature=temperature,
                max_tokens=max_tokens,
            )
            return response.choices[0].message.content or ""
        except openai.RateLimitError:
            raise
        except openai.APIError as exc:
            raise OpenAIClientError(str(exc)) from exc

    @retry(
        retry=retry_if_exception_type(openai.RateLimitError),
        wait=wait_exponential(multiplier=1, min=1, max=30),
        stop=stop_after_attempt(3),
        reraise=True,
    )
    def _call_json_with_retry(
        self,
        prompt: str,
        system_prompt: str,
    ) -> str:
        try:
            response = self._client.chat.completions.create(
                model=self._model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.0,
                response_format={"type": "json_object"},
            )
            return response.choices[0].message.content or "{}"
        except openai.RateLimitError:
            raise
        except openai.APIError as exc:
            raise OpenAIClientError(str(exc)) from exc

    @staticmethod
    def _cache_key(
        prompt: str,
        system_prompt: str,
        temperature: float,
        max_tokens: int,
        *,
        json_mode: bool = False,
    ) -> str:
        raw = f"{prompt}|{system_prompt}|{temperature}|{max_tokens}|{json_mode}"
        return hashlib.sha256(raw.encode()).hexdigest()
