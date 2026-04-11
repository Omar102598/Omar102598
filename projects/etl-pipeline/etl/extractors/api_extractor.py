"""REST API extractor with pagination, rate-limiting, and OAuth2 support.

Provides a high-level interface for pulling data from JSON REST APIs into
:class:`pandas.DataFrame` objects, including automatic token refresh, cursor /
offset / page-based pagination, and configurable rate limiting.
"""

from __future__ import annotations

import enum
import time
from dataclasses import dataclass, field
from typing import Any

import pandas as pd
import requests
import structlog
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from etl.extractors.base_extractor import (
    BaseExtractor,
    ConnectionError,
    ExtractionError,
)

logger: structlog.stdlib.BoundLogger = structlog.get_logger(__name__)

__all__ = ["APIExtractor", "PaginationType", "AuthConfig"]


# ---------------------------------------------------------------------------
# Supporting types
# ---------------------------------------------------------------------------


class PaginationType(enum.Enum):
    """Supported REST pagination strategies."""

    NONE = "none"
    CURSOR = "cursor"
    OFFSET = "offset"
    PAGE = "page"


@dataclass(slots=True)
class AuthConfig:
    """Authentication configuration for the API extractor.

    For **API key** auth set *auth_type* to ``"api_key"`` and supply
    *api_key*, *api_key_header* (defaults to ``X-API-Key``).

    For **OAuth2** set *auth_type* to ``"oauth2"`` and supply
    *client_id*, *client_secret*, *token_url*, and optionally *scopes*.
    """

    auth_type: str  # "api_key" or "oauth2"
    api_key: str | None = None
    api_key_header: str = "X-API-Key"
    client_id: str | None = None
    client_secret: str | None = None
    token_url: str | None = None
    scopes: list[str] = field(default_factory=list)


class APIExtractor(BaseExtractor):
    """Extract data from REST APIs with built-in resilience and pagination.

    Parameters:
        base_url: Root URL of the API (e.g. ``https://api.example.com/v1``).
        auth: Optional :class:`AuthConfig` for authentication.
        rate_limit_per_second: Maximum requests per second (0 = unlimited).
        timeout: Per-request timeout in seconds.
        max_retries: Retry ceiling passed to the base class.
    """

    def __init__(
        self,
        base_url: str,
        *,
        auth: AuthConfig | None = None,
        rate_limit_per_second: float = 0,
        timeout: float = 30.0,
        max_retries: int = 3,
    ) -> None:
        super().__init__(source_name=base_url, max_retries=max_retries)
        self._base_url = base_url.rstrip("/")
        self._auth = auth
        self._rate_limit = rate_limit_per_second
        self._timeout = timeout
        self._access_token: str | None = None
        self._token_expires_at: float = 0.0
        self._last_request_time: float = 0.0

        self._session = self._build_session()
        self._log = logger.bind(extractor="APIExtractor", base_url=self._base_url)

    # ------------------------------------------------------------------
    # Session construction
    # ------------------------------------------------------------------

    def _build_session(self) -> requests.Session:
        """Create a :class:`requests.Session` pre-configured with auth headers."""
        session = requests.Session()
        session.headers.update({"Accept": "application/json"})

        if self._auth is not None:
            if self._auth.auth_type == "api_key" and self._auth.api_key:
                session.headers[self._auth.api_key_header] = self._auth.api_key
            elif self._auth.auth_type == "oauth2":
                self._refresh_oauth2_token(session)

        return session

    # ------------------------------------------------------------------
    # OAuth2 token management
    # ------------------------------------------------------------------

    def _refresh_oauth2_token(self, session: requests.Session | None = None) -> None:
        """Request (or refresh) an OAuth2 access token via client-credentials grant.

        Raises:
            ConnectionError: If the token endpoint is unreachable or returns an error.
        """
        if self._auth is None or self._auth.auth_type != "oauth2":
            return

        if self._auth.token_url is None or self._auth.client_id is None or self._auth.client_secret is None:
            raise ConnectionError(
                "OAuth2 requires token_url, client_id, and client_secret.",
                source=self._base_url,
            )

        payload: dict[str, str] = {
            "grant_type": "client_credentials",
            "client_id": self._auth.client_id,
            "client_secret": self._auth.client_secret,
        }
        if self._auth.scopes:
            payload["scope"] = " ".join(self._auth.scopes)

        try:
            resp = requests.post(self._auth.token_url, data=payload, timeout=self._timeout)
            resp.raise_for_status()
        except requests.RequestException as exc:
            raise ConnectionError(
                f"OAuth2 token request failed: {exc}",
                source=self._base_url,
                cause=exc,
            ) from exc

        body = resp.json()
        self._access_token = body["access_token"]
        expires_in: int = body.get("expires_in", 3600)
        self._token_expires_at = time.monotonic() + expires_in - 30  # refresh 30 s early

        target = session or self._session
        target.headers["Authorization"] = f"Bearer {self._access_token}"
        self._log.info("oauth2_token_refreshed", expires_in=expires_in)

    def _ensure_valid_token(self) -> None:
        """Refresh the OAuth2 token if it has (or is about to) expire."""
        if (
            self._auth is not None
            and self._auth.auth_type == "oauth2"
            and time.monotonic() >= self._token_expires_at
        ):
            self._refresh_oauth2_token()

    # ------------------------------------------------------------------
    # Rate limiting
    # ------------------------------------------------------------------

    def _apply_rate_limit(self) -> None:
        """Sleep if necessary to honour the configured rate limit."""
        if self._rate_limit <= 0:
            return
        min_interval = 1.0 / self._rate_limit
        elapsed = time.monotonic() - self._last_request_time
        if elapsed < min_interval:
            time.sleep(min_interval - elapsed)
        self._last_request_time = time.monotonic()

    # ------------------------------------------------------------------
    # Core HTTP helper
    # ------------------------------------------------------------------

    def _request(
        self,
        method: str,
        endpoint: str,
        *,
        params: dict[str, Any] | None = None,
        json_body: dict[str, Any] | None = None,
    ) -> requests.Response:
        """Execute a single HTTP request with rate-limiting and retries.

        Raises:
            ExtractionError: On HTTP or network failures after retries.
        """
        self._ensure_valid_token()
        self._apply_rate_limit()

        url = f"{self._base_url}/{endpoint.lstrip('/')}" if not endpoint.startswith("http") else endpoint

        @retry(
            retry=retry_if_exception_type((requests.ConnectionError, requests.Timeout)),
            stop=stop_after_attempt(self.max_retries),
            wait=wait_exponential(multiplier=1, min=1, max=30),
            reraise=True,
        )
        def _do_request() -> requests.Response:
            resp = self._session.request(
                method,
                url,
                params=params,
                json=json_body,
                timeout=self._timeout,
            )
            resp.raise_for_status()
            return resp

        try:
            return _do_request()
        except requests.RequestException as exc:
            raise ExtractionError(
                f"API request failed: {method} {url} – {exc}",
                source=self._base_url,
                cause=exc,
            ) from exc

    # ------------------------------------------------------------------
    # Abstract interface implementation
    # ------------------------------------------------------------------

    def extract(
        self,
        *,
        endpoint: str = "",
        method: str = "GET",
        params: dict[str, Any] | None = None,
        json_body: dict[str, Any] | None = None,
        json_path: str | None = None,
        pagination: PaginationType = PaginationType.NONE,
        page_size: int = 100,
        max_pages: int = 0,
        cursor_field: str = "next_cursor",
        cursor_param: str = "cursor",
        offset_param: str = "offset",
        page_param: str = "page",
        total_field: str = "total",
        data_field: str = "data",
    ) -> pd.DataFrame:
        """Fetch data from *endpoint* and return a :class:`~pandas.DataFrame`.

        When *pagination* is not ``NONE`` the extractor will automatically walk
        through all pages, concatenating results into a single DataFrame.

        Args:
            endpoint: Relative API path (appended to *base_url*).
            method: HTTP method (``GET``, ``POST``, …).
            params: Query-string parameters.
            json_body: JSON request body for ``POST``/``PUT``.
            json_path: Dot-separated path into the JSON response to locate
                the records list (e.g. ``"results.items"``).
            pagination: Pagination strategy to use.
            page_size: Number of records per page requested from the API.
            max_pages: Safety cap (0 = unlimited).
            cursor_field: JSON key holding the next-page cursor.
            cursor_param: Query-parameter name for sending the cursor.
            offset_param: Query-parameter name for offset-based pagination.
            page_param: Query-parameter name for page-based pagination.
            total_field: JSON key holding the total record count (offset mode).
            data_field: JSON key holding the records list when using pagination.

        Returns:
            DataFrame built from the collected JSON records.
        """
        if pagination == PaginationType.NONE:
            resp = self._request(method, endpoint, params=params, json_body=json_body)
            records = self._extract_json_records(resp.json(), json_path)
            return pd.DataFrame(records)

        records = self._handle_pagination(
            endpoint=endpoint,
            method=method,
            params=params or {},
            json_body=json_body,
            pagination=pagination,
            page_size=page_size,
            max_pages=max_pages,
            cursor_field=cursor_field,
            cursor_param=cursor_param,
            offset_param=offset_param,
            page_param=page_param,
            total_field=total_field,
            data_field=data_field,
        )
        return pd.DataFrame(records)

    def validate_connection(self) -> bool:
        """Check reachability by issuing a ``HEAD`` request to *base_url*."""
        try:
            self._apply_rate_limit()
            resp = self._session.head(self._base_url, timeout=self._timeout)
            return resp.status_code < 500
        except requests.RequestException as exc:
            self._log.warning("connection_validation_failed", error=str(exc))
            return False

    def get_metadata(self) -> dict[str, Any]:
        """Return basic metadata about the configured API."""
        return {
            "base_url": self._base_url,
            "auth_type": self._auth.auth_type if self._auth else None,
            "rate_limit_per_second": self._rate_limit,
            "timeout": self._timeout,
        }

    # ------------------------------------------------------------------
    # Pagination
    # ------------------------------------------------------------------

    def _handle_pagination(
        self,
        *,
        endpoint: str,
        method: str,
        params: dict[str, Any],
        json_body: dict[str, Any] | None,
        pagination: PaginationType,
        page_size: int,
        max_pages: int,
        cursor_field: str,
        cursor_param: str,
        offset_param: str,
        page_param: str,
        total_field: str,
        data_field: str,
    ) -> list[dict[str, Any]]:
        """Walk through paginated API responses and accumulate records."""
        all_records: list[dict[str, Any]] = []
        page_num = 0

        match pagination:
            case PaginationType.CURSOR:
                cursor: str | None = None
                while True:
                    req_params = {**params, "limit": page_size}
                    if cursor is not None:
                        req_params[cursor_param] = cursor

                    resp = self._request(method, endpoint, params=req_params, json_body=json_body)
                    body = resp.json()
                    records = self._resolve_field(body, data_field)
                    all_records.extend(records if isinstance(records, list) else [records])

                    cursor = self._resolve_field(body, cursor_field) if cursor_field else None
                    page_num += 1
                    if not cursor or (max_pages and page_num >= max_pages):
                        break

            case PaginationType.OFFSET:
                offset = 0
                while True:
                    req_params = {**params, offset_param: offset, "limit": page_size}
                    resp = self._request(method, endpoint, params=req_params, json_body=json_body)
                    body = resp.json()
                    records = self._resolve_field(body, data_field)
                    records_list = records if isinstance(records, list) else [records]
                    all_records.extend(records_list)

                    total = self._resolve_field(body, total_field)
                    offset += page_size
                    page_num += 1
                    if (
                        not records_list
                        or (isinstance(total, int) and offset >= total)
                        or (max_pages and page_num >= max_pages)
                    ):
                        break

            case PaginationType.PAGE:
                current_page = 1
                while True:
                    req_params = {**params, page_param: current_page, "per_page": page_size}
                    resp = self._request(method, endpoint, params=req_params, json_body=json_body)
                    body = resp.json()
                    records = self._resolve_field(body, data_field)
                    records_list = records if isinstance(records, list) else [records]
                    all_records.extend(records_list)

                    current_page += 1
                    page_num += 1
                    if not records_list or (max_pages and page_num >= max_pages):
                        break

        self._log.info("pagination_complete", strategy=pagination.value, pages=page_num, records=len(all_records))
        return all_records

    # ------------------------------------------------------------------
    # JSON helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _resolve_field(data: Any, path: str) -> Any:
        """Walk a dot-separated *path* into a nested dict/list structure.

        Returns ``None`` if any segment along the path is missing.
        """
        current = data
        for key in path.split("."):
            if isinstance(current, dict):
                current = current.get(key)
            else:
                return None
            if current is None:
                return None
        return current

    @staticmethod
    def _extract_json_records(data: Any, json_path: str | None) -> list[dict[str, Any]]:
        """Extract a list of records from a JSON response.

        If *json_path* is given the records are found by walking the path;
        otherwise the root value is used directly.
        """
        if json_path is not None:
            target = data
            for key in json_path.split("."):
                if isinstance(target, dict):
                    target = target.get(key, [])
                else:
                    return []
            data = target

        if isinstance(data, list):
            return data
        if isinstance(data, dict):
            return [data]
        return []

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    def close(self) -> None:
        """Close the underlying :class:`requests.Session`."""
        self._session.close()
        self._log.info("session_closed")
