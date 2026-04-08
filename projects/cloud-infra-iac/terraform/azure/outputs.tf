################################################################################
# Root Outputs – Azure Cloud Infrastructure
################################################################################

output "resource_group_name" {
  description = "Name of the Azure resource group."
  value       = azurerm_resource_group.main.name
}

output "vnet_id" {
  description = "ID of the virtual network."
  value       = module.vnet.vnet_id
}

output "aks_cluster_name" {
  description = "Name of the AKS cluster."
  value       = module.aks.cluster_name
}

output "aks_kube_config" {
  description = "Raw kubeconfig for the AKS cluster."
  value       = module.aks.kube_config_raw
  sensitive   = true
}

output "sql_server_fqdn" {
  description = "Fully qualified domain name of the SQL server."
  value       = module.sql.server_fqdn
  sensitive   = true
}

output "sql_database_name" {
  description = "Name of the SQL database."
  value       = module.sql.database_name
}

output "openai_endpoint" {
  description = "Endpoint URL for the Azure OpenAI service."
  value       = module.ai_services.openai_endpoint
}

output "log_analytics_workspace_id" {
  description = "ID of the Log Analytics workspace."
  value       = module.aks.log_analytics_workspace_id
}
