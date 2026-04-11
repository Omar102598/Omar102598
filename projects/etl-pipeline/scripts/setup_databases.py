#!/usr/bin/env python3
"""Database setup script for the ETL pipeline.

Creates all required tables, indexes, and audit infrastructure using SQLAlchemy DDL.
"""

from __future__ import annotations

import argparse
import sys

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    DateTime,
    Float,
    Index,
    Integer,
    MetaData,
    Numeric,
    String,
    Table,
    Text,
    create_engine,
    func,
    text,
)


metadata = MetaData()

# ── Dimension Tables ─────────────────────────────────────────────────────────

dim_customers = Table(
    "dim_customers",
    metadata,
    Column("id", BigInteger, primary_key=True),
    Column("name", String(255), nullable=False),
    Column("email", String(255), nullable=False),
    Column("segment", String(100)),
    Column("total_orders", Integer, nullable=False, server_default=text("0")),
    Column("total_revenue", Numeric(18, 2), nullable=False, server_default=text("0.00")),
    Column("avg_order_value", Numeric(18, 2)),
    Column("customer_tenure_days", Integer),
    Column("is_active", Boolean, server_default=text("true")),
    Column("last_order_date", DateTime(timezone=True)),
    Column("created_at", DateTime(timezone=True), nullable=False),
    Column(
        "updated_at",
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    ),
)

dim_date = Table(
    "dim_date",
    metadata,
    Column("date_key", Integer, primary_key=True),
    Column("full_date", DateTime(timezone=True), nullable=False),
    Column("year", Integer, nullable=False),
    Column("quarter", Integer, nullable=False),
    Column("month", Integer, nullable=False),
    Column("week", Integer, nullable=False),
    Column("day_of_week", Integer, nullable=False),
    Column("day_name", String(10), nullable=False),
    Column("is_weekend", Boolean, nullable=False),
    Column("is_holiday", Boolean, nullable=False, server_default=text("false")),
    Column("fiscal_year", Integer),
    Column("fiscal_quarter", Integer),
)

dim_products = Table(
    "dim_products",
    metadata,
    Column("id", BigInteger, primary_key=True),
    Column("name", String(255), nullable=False),
    Column("category", String(100)),
    Column("subcategory", String(100)),
    Column("unit_price", Numeric(18, 2)),
    Column("is_active", Boolean, server_default=text("true")),
    Column("created_at", DateTime(timezone=True), nullable=False),
    Column(
        "updated_at",
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    ),
)

# ── Fact Tables ──────────────────────────────────────────────────────────────

fact_transactions = Table(
    "fact_transactions",
    metadata,
    Column("id", BigInteger, primary_key=True),
    Column("customer_id", BigInteger, nullable=False),
    Column("product_id", BigInteger),
    Column("amount", Numeric(18, 2), nullable=False),
    Column("currency", String(3), nullable=False, server_default=text("'USD'")),
    Column("amount_usd", Numeric(18, 2)),
    Column("status", String(50), nullable=False),
    Column("payment_method", String(50)),
    Column("transaction_date", DateTime(timezone=True), nullable=False),
    Column("fiscal_quarter", Integer),
    Column("is_high_value", Boolean, server_default=text("false")),
    Column("created_at", DateTime(timezone=True), nullable=False),
    Column(
        "updated_at",
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    ),
)

# ── Staging Tables ───────────────────────────────────────────────────────────

stg_customers = Table(
    "stg_customers",
    metadata,
    Column("id", BigInteger),
    Column("name", String(255)),
    Column("email", String(255)),
    Column("segment", String(100)),
    Column("total_orders", Integer),
    Column("total_revenue", Numeric(18, 2)),
    Column("last_order_date", DateTime(timezone=True)),
    Column("created_at", DateTime(timezone=True)),
    Column("loaded_at", DateTime(timezone=True), server_default=func.now()),
)

stg_transactions = Table(
    "stg_transactions",
    metadata,
    Column("id", BigInteger),
    Column("customer_id", BigInteger),
    Column("amount", Numeric(18, 2)),
    Column("currency", String(3)),
    Column("status", String(50)),
    Column("payment_method", String(50)),
    Column("created_at", DateTime(timezone=True)),
    Column("updated_at", DateTime(timezone=True)),
    Column("loaded_at", DateTime(timezone=True), server_default=func.now()),
)

# ── Audit Tables ─────────────────────────────────────────────────────────────

audit_pipeline_runs = Table(
    "audit_pipeline_runs",
    metadata,
    Column("id", BigInteger, primary_key=True, autoincrement=True),
    Column("pipeline_name", String(255), nullable=False),
    Column("run_id", String(255), nullable=False, unique=True),
    Column("status", String(50), nullable=False),
    Column("started_at", DateTime(timezone=True), nullable=False),
    Column("completed_at", DateTime(timezone=True)),
    Column("rows_extracted", BigInteger, server_default=text("0")),
    Column("rows_transformed", BigInteger, server_default=text("0")),
    Column("rows_loaded", BigInteger, server_default=text("0")),
    Column("rows_rejected", BigInteger, server_default=text("0")),
    Column("error_message", Text),
    Column("execution_time_seconds", Float),
    Column("created_at", DateTime(timezone=True), server_default=func.now()),
)

audit_data_quality = Table(
    "audit_data_quality",
    metadata,
    Column("id", BigInteger, primary_key=True, autoincrement=True),
    Column("pipeline_name", String(255), nullable=False),
    Column("run_id", String(255), nullable=False),
    Column("check_type", String(100), nullable=False),
    Column("table_name", String(255), nullable=False),
    Column("column_name", String(255)),
    Column("passed", Boolean, nullable=False),
    Column("details", Text),
    Column("checked_at", DateTime(timezone=True), server_default=func.now()),
)

# ── Indexes ──────────────────────────────────────────────────────────────────

INDEXES = [
    Index("ix_dim_customers_email", dim_customers.c.email),
    Index("ix_dim_customers_segment", dim_customers.c.segment),
    Index("ix_dim_customers_is_active", dim_customers.c.is_active),
    Index("ix_dim_date_full_date", dim_date.c.full_date),
    Index("ix_dim_products_category", dim_products.c.category),
    Index("ix_fact_transactions_customer_id", fact_transactions.c.customer_id),
    Index("ix_fact_transactions_date", fact_transactions.c.transaction_date),
    Index("ix_fact_transactions_status", fact_transactions.c.status),
    Index(
        "ix_fact_transactions_customer_date",
        fact_transactions.c.customer_id,
        fact_transactions.c.transaction_date,
    ),
    Index("ix_audit_pipeline_runs_name", audit_pipeline_runs.c.pipeline_name),
    Index("ix_audit_pipeline_runs_status", audit_pipeline_runs.c.status),
    Index("ix_audit_data_quality_run_id", audit_data_quality.c.run_id),
]


def setup_database(connection_string: str) -> None:
    """Create all tables and indexes in the target database."""
    engine = create_engine(connection_string, echo=True)

    print(f"Connecting to database: {engine.url.render_as_string(hide_password=True)}")
    metadata.create_all(engine)
    print("All tables and indexes created successfully.")

    with engine.connect() as conn:
        result = conn.execute(
            text(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema = 'public' ORDER BY table_name"
            )
        )
        tables = [row[0] for row in result]
        print(f"\nCreated tables ({len(tables)}):")
        for table_name in tables:
            print(f"  - {table_name}")

    engine.dispose()


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Set up ETL pipeline database tables and indexes.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--connection-string",
        default="postgresql+psycopg2://etl_user:password@localhost:5432/etl_warehouse",
        help="SQLAlchemy database connection string.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    """Entry point."""
    args = parse_args(argv)
    try:
        setup_database(args.connection_string)
    except Exception as exc:
        print(f"ERROR: Database setup failed: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
