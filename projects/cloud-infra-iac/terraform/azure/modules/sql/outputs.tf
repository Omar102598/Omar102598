################################################################################
# SQL Module – Outputs
################################################################################

output "server_name" {
  description = "Name of the SQL server."
  value       = azurerm_mssql_server.main.name
}

output "server_fqdn" {
  description = "Fully qualified domain name of the SQL server."
  value       = azurerm_mssql_server.main.fully_qualified_domain_name
  sensitive   = true
}

output "database_name" {
  description = "Name of the SQL database."
  value       = azurerm_mssql_database.main.name
}

output "database_id" {
  description = "ID of the SQL database."
  value       = azurerm_mssql_database.main.id
}

output "key_vault_id" {
  description = "ID of the Key Vault storing SQL credentials."
  value       = azurerm_key_vault.sql.id
}

output "private_endpoint_ip" {
  description = "Private IP address of the SQL private endpoint."
  value       = azurerm_private_endpoint.sql.private_service_connection[0].private_ip_address
}
