"""Structured logging configuration built on *structlog*."""

from __future__ import annotations

import logging
import sys
import uuid
from contextvars import ContextVar
from pathlib import Path

import structlog

__all__ = [
    "setup_logging",
    "get_logger",
    "set_correlation_id",
    "get_correlation_id",
]

_correlation_id_var: ContextVar[str] = ContextVar("correlation_id", default="")


# ------------------------------------------------------------------
# Correlation ID helpers
# ------------------------------------------------------------------

def set_correlation_id(cid: str | None = None) -> str:
    """Set (or generate) a correlation ID for the current async/thread context.

    Returns the correlation ID that was set.
    """
    value = cid if cid else uuid.uuid4().hex
    _correlation_id_var.set(value)
    return value


def get_correlation_id() -> str:
    """Return the current correlation ID, or an empty string if unset."""
    return _correlation_id_var.get()


# ------------------------------------------------------------------
# Custom structlog processors
# ------------------------------------------------------------------

def _add_correlation_id(
    logger: structlog.types.WrappedLogger,
    method_name: str,
    event_dict: structlog.types.EventDict,
) -> structlog.types.EventDict:
    """Inject the correlation ID into every log event."""
    cid = get_correlation_id()
    if cid:
        event_dict["correlation_id"] = cid
    return event_dict


def _add_log_level(
    logger: structlog.types.WrappedLogger,
    method_name: str,
    event_dict: structlog.types.EventDict,
) -> structlog.types.EventDict:
    """Normalise the log level key to ``level``."""
    event_dict["level"] = method_name.upper()
    return event_dict


# ------------------------------------------------------------------
# Setup
# ------------------------------------------------------------------

def setup_logging(
    level: str = "INFO",
    json_format: bool = False,
    log_file: str | Path | None = None,
) -> None:
    """Configure *structlog* and the stdlib :mod:`logging` root logger.

    Parameters
    ----------
    level:
        Minimum log level (e.g. ``"DEBUG"``, ``"INFO"``).
    json_format:
        If ``True``, render every log line as a JSON object.
    log_file:
        Optional path to a file where logs should also be written.
    """
    log_level = getattr(logging, level.upper(), logging.INFO)

    # --- stdlib logging setup -----------------------------------------------
    root = logging.getLogger()
    root.setLevel(log_level)
    # Remove existing handlers to avoid duplicates on repeated calls.
    root.handlers.clear()

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    root.addHandler(console_handler)

    if log_file is not None:
        file_handler = logging.FileHandler(str(log_file), encoding="utf-8")
        file_handler.setLevel(log_level)
        root.addHandler(file_handler)

    # --- structlog processor chain ------------------------------------------
    shared_processors: list[structlog.types.Processor] = [
        structlog.contextvars.merge_contextvars,
        _add_correlation_id,
        _add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.UnicodeDecoder(),
    ]

    if json_format:
        renderer: structlog.types.Processor = structlog.processors.JSONRenderer()
    else:
        renderer = structlog.dev.ConsoleRenderer()

    structlog.configure(
        processors=[
            *shared_processors,
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    formatter = structlog.stdlib.ProcessorFormatter(
        processors=[
            structlog.stdlib.ProcessorFormatter.remove_processors_meta,
            renderer,
        ],
    )

    for handler in root.handlers:
        handler.setFormatter(formatter)


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    """Return a bound *structlog* logger pre-populated with *name*.

    Parameters
    ----------
    name:
        Usually ``__name__`` of the calling module.
    """
    return structlog.get_logger(name)
