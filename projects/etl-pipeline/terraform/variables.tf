# =============================================================================
# Terraform Variables
# =============================================================================

variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (e.g., development, staging, production)"
  type        = string
  default     = "development"

  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be one of: development, staging, production."
  }
}

variable "project_name" {
  description = "Name of the project, used for resource naming and tagging"
  type        = string
  default     = "ai-etl-pipeline"
}

# ── Database Variables ───────────────────────────────────────────────────────

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "db_allocated_storage" {
  description = "Allocated storage for the RDS instance in GB"
  type        = number
  default     = 50
}

variable "db_name" {
  description = "Name of the database to create"
  type        = string
  default     = "etl_warehouse"
}

variable "db_username" {
  description = "Master username for the RDS instance"
  type        = string
  default     = "etl_admin"
}

variable "db_password" {
  description = "Master password for the RDS instance"
  type        = string
  sensitive   = true
}

# ── S3 Variables ─────────────────────────────────────────────────────────────

variable "s3_bucket_name" {
  description = "Name of the S3 bucket for the data lake"
  type        = string
  default     = "ai-etl-pipeline-data-lake"
}

# ── Lambda Variables ─────────────────────────────────────────────────────────

variable "lambda_function_name" {
  description = "Name of the Lambda function used to trigger ETL jobs"
  type        = string
  default     = "ai-etl-pipeline-trigger"
}
