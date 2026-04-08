################################################################################
# AI Services Module – Outputs
################################################################################

output "openai_endpoint" {
  description = "Endpoint URL for the Azure OpenAI service."
  value       = azurerm_cognitive_account.openai.endpoint
}

output "openai_id" {
  description = "ID of the Azure OpenAI account."
  value       = azurerm_cognitive_account.openai.id
}

output "openai_primary_key" {
  description = "Primary access key for the Azure OpenAI service."
  value       = azurerm_cognitive_account.openai.primary_access_key
  sensitive   = true
}

output "cognitive_services_endpoint" {
  description = "Endpoint URL for the Cognitive Services account."
  value       = azurerm_cognitive_account.cognitive.endpoint
}

output "cognitive_services_id" {
  description = "ID of the Cognitive Services account."
  value       = azurerm_cognitive_account.cognitive.id
}
