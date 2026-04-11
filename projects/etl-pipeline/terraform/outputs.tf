# =============================================================================
# Terraform Outputs
# =============================================================================

output "rds_endpoint" {
  description = "Endpoint of the RDS PostgreSQL instance"
  value       = aws_db_instance.warehouse.endpoint
}

output "s3_bucket_arn" {
  description = "ARN of the S3 data lake bucket"
  value       = aws_s3_bucket.data_lake.arn
}

output "lambda_function_arn" {
  description = "ARN of the Lambda trigger function"
  value       = aws_lambda_function.trigger.arn
}

output "glue_job_name" {
  description = "Name of the Glue ETL job"
  value       = aws_glue_job.etl.name
}
