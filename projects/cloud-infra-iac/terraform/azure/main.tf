################################################################################
# Root Module – Azure Cloud Infrastructure
################################################################################

locals {
  name_prefix = "${var.project_name}-${var.environment}"

  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    Owner       = var.owner
    CostCenter  = var.cost_center
    ManagedBy   = "terraform"
  }
}

# ─── Resource Group ───────────────────────────────────────────────────────────

resource "azurerm_resource_group" "main" {
  name     = "rg-${local.name_prefix}"
  location = var.azure_region
  tags     = local.common_tags
}

# ─── Virtual Network ─────────────────────────────────────────────────────────

module "vnet" {
  source = "./modules/vnet"

  name_prefix         = local.name_prefix
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  address_space       = var.vnet_address_space
  environment         = var.environment
  tags                = local.common_tags
}

# ─── Azure Kubernetes Service ─────────────────────────────────────────────────

module "aks" {
  source = "./modules/aks"

  name_prefix          = local.name_prefix
  resource_group_name  = azurerm_resource_group.main.name
  location             = azurerm_resource_group.main.location
  aks_subnet_id        = module.vnet.aks_subnet_id
  kubernetes_version   = var.aks_kubernetes_version
  system_node_vm_size  = var.aks_system_node_vm_size
  user_node_vm_size    = var.aks_user_node_vm_size
  min_node_count       = var.aks_min_node_count
  max_node_count       = var.aks_max_node_count
  environment          = var.environment
  tags                 = local.common_tags
}

# ─── SQL Database ─────────────────────────────────────────────────────────────

module "sql" {
  source = "./modules/sql"

  name_prefix                = local.name_prefix
  resource_group_name        = azurerm_resource_group.main.name
  location                   = azurerm_resource_group.main.location
  private_endpoints_subnet_id = module.vnet.private_endpoints_subnet_id
  sku_name                   = var.sql_sku_name
  max_size_gb                = var.sql_max_size_gb
  backup_retention_days      = var.sql_backup_retention_days
  environment                = var.environment
  tags                       = local.common_tags
}

# ─── AI Services ──────────────────────────────────────────────────────────────

module "ai_services" {
  source = "./modules/ai-services"

  name_prefix                  = local.name_prefix
  resource_group_name          = azurerm_resource_group.main.name
  location                     = azurerm_resource_group.main.location
  private_endpoints_subnet_id  = module.vnet.private_endpoints_subnet_id
  log_analytics_workspace_id   = module.aks.log_analytics_workspace_id
  openai_model_name            = var.openai_model_name
  openai_model_version         = var.openai_model_version
  environment                  = var.environment
  tags                         = local.common_tags
}
