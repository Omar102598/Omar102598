################################################################################
# AI Services Module – Variables
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

variable "log_analytics_workspace_id" {
  description = "ID of the Log Analytics workspace for diagnostics."
  type        = string
}

variable "openai_model_name" {
  description = "Name of the OpenAI model to deploy."
  type        = string
}

variable "openai_model_version" {
  description = "Version of the OpenAI model to deploy."
  type        = string
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)."
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources."
  type        = map(string)
}
