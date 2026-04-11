################################################################################
# SQL Module – Variables
################################################################################

variable "name_prefix" {
  description = "Naming prefix for all resources."
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group."
  type        = string
}

variable "location" {
  description = "Azure region."
  type        = string
}

variable "private_endpoints_subnet_id" {
  description = "ID of the subnet for private endpoints."
  type        = string
}

variable "sku_name" {
  description = "SKU name for the SQL database."
  type        = string
}

variable "max_size_gb" {
  description = "Maximum size of the SQL database in GB."
  type        = number
}

variable "backup_retention_days" {
  description = "Number of days to retain backups."
  type        = number
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)."
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources."
  type        = map(string)
}
