#!/usr/bin/env python3
"""CLI script to run ETL pipelines based on YAML configuration."""

from __future__ import annotations

import argparse
import logging
import sys
import time
from pathlib import Path
from typing import Any

import structlog
import yaml

logger = structlog.get_logger(__name__)


def load_config(config_path: str) -> dict[str, Any]:
    """Load pipeline configuration from a YAML file."""
    path = Path(config_path)
    if not path.exists():
        raise FileNotFoundError(f"Configuration file not found: {config_path}")
    with open(path) as f:
        return yaml.safe_load(f)


def setup_logging(log_level: str) -> None:
    """Configure structured logging."""
    level = getattr(logging, log_level.upper(), logging.INFO)

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.StackInfoRenderer(),
            structlog.dev.set_exc_info,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(level),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )


def create_extractor(source_config: dict[str, Any]) -> Any:
    """Create an extractor instance based on source configuration."""
    source_type = source_config["type"]
    logger.info("creating_extractor", source_type=source_type)

    if source_type in ("postgres", "mysql"):
        connection = source_config["connection"]
        query = source_config.get("query", "")
        logger.info(
            "database_extractor_configured",
            connection=connection,
            query_preview=query[:100] if query else "",
        )
        return {"type": source_type, "connection": connection, "query": query}

    if source_type == "csv":
        path = source_config.get("path", "")
        logger.info("csv_extractor_configured", path=path)
        return {"type": source_type, "path": path}

    raise ValueError(f"Unsupported source type: {source_type}")


def create_transformer(transform_config: dict[str, Any]) -> Any:
    """Create a transformer instance based on transform configuration."""
    transform_type = transform_config["type"]
    config = transform_config.get("config", {})
    logger.info("creating_transformer", transform_type=transform_type)
    return {"type": transform_type, "config": config}


def create_loader(target_config: dict[str, Any]) -> Any:
    """Create a loader instance based on target configuration."""
    target_type = target_config["type"]
    logger.info("creating_loader", target_type=target_type)

    if target_type in ("postgres", "mysql"):
        return {
            "type": target_type,
            "connection": target_config["connection"],
            "table": target_config["table"],
            "write_mode": target_config.get("write_mode", "append"),
        }

    if target_type == "parquet":
        return {
            "type": target_type,
            "path": target_config["path"],
            "partition_by": target_config.get("partition_by", []),
        }

    raise ValueError(f"Unsupported target type: {target_type}")


def run_extract(extractors: list[dict[str, Any]], dry_run: bool) -> dict[str, Any]:
    """Execute the extraction phase."""
    logger.info("extract_phase_started", extractor_count=len(extractors))
    rows_extracted = 0

    for extractor in extractors:
        if dry_run:
            logger.info("dry_run_extract", extractor=extractor["type"])
            continue
        logger.info("extracting_data", source_type=extractor["type"])
        rows_extracted += 0  # Placeholder for actual extraction logic

    logger.info("extract_phase_completed", rows_extracted=rows_extracted)
    return {"rows_extracted": rows_extracted}


def run_transform(
    transformers: list[dict[str, Any]], dry_run: bool
) -> dict[str, Any]:
    """Execute the transformation phase."""
    logger.info("transform_phase_started", transformer_count=len(transformers))
    rows_transformed = 0

    for transformer in transformers:
        if dry_run:
            logger.info("dry_run_transform", transform_type=transformer["type"])
            continue
        logger.info("applying_transform", transform_type=transformer["type"])
        rows_transformed += 0  # Placeholder for actual transformation logic

    logger.info("transform_phase_completed", rows_transformed=rows_transformed)
    return {"rows_transformed": rows_transformed}


def run_load(loaders: list[dict[str, Any]], dry_run: bool) -> dict[str, Any]:
    """Execute the load phase."""
    logger.info("load_phase_started", loader_count=len(loaders))
    rows_loaded = 0

    for loader in loaders:
        if dry_run:
            logger.info("dry_run_load", target_type=loader["type"])
            continue
        logger.info("loading_data", target_type=loader["type"])
        rows_loaded += 0  # Placeholder for actual load logic

    logger.info("load_phase_completed", rows_loaded=rows_loaded)
    return {"rows_loaded": rows_loaded}


def run_pipeline(pipeline_name: str, config: dict[str, Any], dry_run: bool) -> None:
    """Orchestrate the full ETL pipeline execution."""
    pipelines = config.get("pipelines", {})
    if pipeline_name not in pipelines:
        available = ", ".join(pipelines.keys())
        raise ValueError(
            f"Pipeline '{pipeline_name}' not found. Available pipelines: {available}"
        )

    pipeline_cfg = pipelines[pipeline_name]
    logger.info(
        "pipeline_started",
        pipeline=pipeline_name,
        schedule=pipeline_cfg.get("schedule"),
        dry_run=dry_run,
    )

    start_time = time.monotonic()

    # Build components from config
    extractors = [create_extractor(src) for src in pipeline_cfg.get("sources", [])]
    transformers = [
        create_transformer(txn) for txn in pipeline_cfg.get("transforms", [])
    ]
    loaders = [create_loader(tgt) for tgt in pipeline_cfg.get("targets", [])]

    # Execute ETL phases
    extract_metrics = run_extract(extractors, dry_run)
    transform_metrics = run_transform(transformers, dry_run)
    load_metrics = run_load(loaders, dry_run)

    elapsed = time.monotonic() - start_time

    # Report metrics
    metrics = {
        "pipeline": pipeline_name,
        "dry_run": dry_run,
        "duration_seconds": round(elapsed, 3),
        **extract_metrics,
        **transform_metrics,
        **load_metrics,
    }
    logger.info("pipeline_completed", **metrics)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Run an ETL pipeline from YAML configuration.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "pipeline_name",
        help="Name of the pipeline to run (must match a key in the config file).",
    )
    parser.add_argument(
        "--config-path",
        default="config/pipeline_config.yaml",
        help="Path to the pipeline configuration YAML file.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate configuration and log actions without executing.",
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
        help="Logging verbosity level.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    """Entry point for the CLI."""
    args = parse_args(argv)
    setup_logging(args.log_level)

    logger.info(
        "cli_started",
        pipeline_name=args.pipeline_name,
        config_path=args.config_path,
        dry_run=args.dry_run,
    )

    try:
        config = load_config(args.config_path)
        run_pipeline(args.pipeline_name, config, args.dry_run)
    except FileNotFoundError:
        logger.error("config_not_found", config_path=args.config_path)
        return 1
    except ValueError as exc:
        logger.error("pipeline_error", error=str(exc))
        return 1
    except Exception:
        logger.exception("unexpected_error")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
