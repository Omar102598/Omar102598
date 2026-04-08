################################################################################
# Root Variables – Azure Cloud Infrastructure
################################################################################

# ─── Project Metadata ─────────────────────────────────────────────────────────

variable "project_name" {
  description = "Name of the project. Used as a prefix for all resources."
  type        = string

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{2,24}$", var.project_name))
    error_message = "project_name must be 3-25 characters, lowercase alphanumeric and hyphens only, starting with a letter."
  }
}

variable "environment" {
  description = "Deployment environment (dev, staging, or prod)."
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be one of: dev, staging, prod."
  }
}

variable "azure_region" {
  description = "Azure region for all resources."
  type        = string
  default     = "eastus"
}

variable "owner" {
  description = "Team or individual responsible for this infrastructure."
  type        = string
}

variable "cost_center" {
  description = "Cost center code for billing and chargeback."
  type        = string
}

# ─── Networking ───────────────────────────────────────────────────────────────

variable "vnet_address_space" {
  description = "Address space for the virtual network."
  type        = list(string)
  default     = ["10.0.0.0/16"]

  validation {
    condition     = length(var.vnet_address_space) > 0
    error_message = "At least one address space CIDR block is required."
  }
}

# ─── AKS ──────────────────────────────────────────────────────────────────────

variable "aks_kubernetes_version" {
  description = "Kubernetes version for AKS cluster."
  type        = string
  default     = "1.28"
}

variable "aks_system_node_vm_size" {
  description = "VM size for the AKS system node pool."
  type        = string
  default     = "Standard_D4s_v5"
}

variable "aks_user_node_vm_size" {
  description = "VM size for the AKS user (workload) node pool."
  type        = string
  default     = "Standard_D8s_v5"
}

variable "aks_min_node_count" {
  description = "Minimum number of nodes per AKS node pool."
  type        = number
  default     = 2

  validation {
    condition     = var.aks_min_node_count >= 1
    error_message = "aks_min_node_count must be at least 1."
  }
}

variable "aks_max_node_count" {
  description = "Maximum number of nodes per AKS node pool."
  type        = number
  default     = 10

  validation {
    condition     = var.aks_max_node_count >= 1
    error_message = "aks_max_node_count must be at least 1."
  }
}

# ─── SQL Database ─────────────────────────────────────────────────────────────

variable "sql_sku_name" {
  description = "SKU name for the Azure SQL Database."
  type        = string
  default     = "GP_Gen5_4"
}

variable "sql_max_size_gb" {
  description = "Maximum size of the SQL database in GB."
  type        = number
  default     = 256
}

variable "sql_backup_retention_days" {
  description = "Number of days to retain SQL backups."
  type        = number
  default     = 30

  validation {
    condition     = var.sql_backup_retention_days >= 7
    error_message = "sql_backup_retention_days must be at least 7."
  }
}

# ─── AI / OpenAI ──────────────────────────────────────────────────────────────

variable "openai_model_name" {
  description = "Name of the OpenAI model to deploy."
  type        = string
  default     = "gpt-4"
}

variable "openai_model_version" {
  description = "Version of the OpenAI model to deploy."
  type        = string
  default     = "0613"
}

# ─── Monitoring & Alerting ────────────────────────────────────────────────────

variable "alert_email_endpoints" {
  description = "List of email addresses for alert notifications."
  type        = list(string)

  validation {
    condition     = length(var.alert_email_endpoints) > 0
    error_message = "At least one alert email endpoint is required."
  }
}

variable "log_retention_days" {
  description = "Number of days to retain logs in Log Analytics."
  type        = number
  default     = 90

  validation {
    condition     = var.log_retention_days >= 30
    error_message = "log_retention_days must be at least 30."
  }
}
