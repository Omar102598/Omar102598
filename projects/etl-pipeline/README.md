# AI-Powered ETL Pipeline

Enterprise data pipeline with AI-driven quality checks, anomaly detection, and automated schema mapping.

## Tech Stack
- **Language:** Python 3.11+
- **Orchestration:** Apache Airflow
- **Data Processing:** pandas, SQLAlchemy
- **AI Integration:** OpenAI API for data profiling, anomaly explanation, schema inference
- **Databases:** PostgreSQL, MySQL, SQL Server
- **Infrastructure:** Docker, Terraform (AWS S3, Glue, RDS, Lambda)

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Extractors  │────▶│ Transformers │────▶│   Loaders   │
│  (DB/API/    │     │ (Clean/Map/  │     │ (DB/Data    │
│   File)      │     │  AI Enrich)  │     │  Warehouse) │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │                    │
       └────────────────────┼────────────────────┘
                            ▼
                   ┌─────────────────┐
                   │  Quality Checks │
                   │  (AI-Powered    │
                   │   Validation)   │
                   └─────────────────┘
```

## Features
- Multi-source extraction (databases, REST APIs, files)
- AI-powered data categorization and enrichment
- Statistical + AI anomaly detection
- Automated schema inference using LLMs
- Data quality reports with AI insights
- SCD Type 2 support for data warehousing
- Airflow DAGs for orchestration

## Status
🚧 **Implementation in progress** — Architecture and design complete, code coming soon.
