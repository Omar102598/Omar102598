output "instance_id" {
  description = "Identifier of the primary RDS instance"
  value       = aws_db_instance.primary.id
}

output "endpoint" {
  description = "Connection endpoint of the primary RDS instance (host:port)"
  value       = aws_db_instance.primary.endpoint
}

output "address" {
  description = "Hostname of the primary RDS instance"
  value       = aws_db_instance.primary.address
}

output "port" {
  description = "Port of the primary RDS instance"
  value       = aws_db_instance.primary.port
}

output "database_name" {
  description = "Name of the default database"
  value       = aws_db_instance.primary.db_name
}

output "read_replica_endpoint" {
  description = "Connection endpoint of the read replica (prod only)"
  value       = var.environment == "prod" ? aws_db_instance.replica[0].endpoint : null
}

output "security_group_id" {
  description = "ID of the RDS security group"
  value       = aws_security_group.rds.id
}

output "credentials_secret_arn" {
  description = "ARN of the Secrets Manager secret containing RDS credentials"
  value       = aws_secretsmanager_secret.rds_credentials.arn
}

output "kms_key_arn" {
  description = "ARN of the KMS key used for RDS encryption"
  value       = aws_kms_key.rds.arn
}
