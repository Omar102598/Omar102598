################################################################################
# VNet Module – Outputs
################################################################################

output "vnet_id" {
  description = "ID of the virtual network."
  value       = azurerm_virtual_network.main.id
}

output "vnet_name" {
  description = "Name of the virtual network."
  value       = azurerm_virtual_network.main.name
}

output "aks_subnet_id" {
  description = "ID of the AKS subnet."
  value       = azurerm_subnet.aks.id
}

output "app_gateway_subnet_id" {
  description = "ID of the Application Gateway subnet."
  value       = azurerm_subnet.app_gateway.id
}

output "database_subnet_id" {
  description = "ID of the database subnet."
  value       = azurerm_subnet.database.id
}

output "private_endpoints_subnet_id" {
  description = "ID of the private endpoints subnet."
  value       = azurerm_subnet.private_endpoints.id
}

output "management_subnet_id" {
  description = "ID of the management subnet."
  value       = azurerm_subnet.management.id
}
