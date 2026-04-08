################################################################################
# AI Services Module – OpenAI, Cognitive Services, Private Endpoints
################################################################################

# ─── Azure OpenAI ─────────────────────────────────────────────────────────────

resource "azurerm_cognitive_account" "openai" {
  name                          = "oai-${var.name_prefix}"
  resource_group_name           = var.resource_group_name
  location                      = var.location
  kind                          = "OpenAI"
  sku_name                      = "S0"
  custom_subdomain_name         = "oai-${var.name_prefix}"
  public_network_access_enabled = var.environment == "dev" ? true : false
  tags                          = var.tags

  dynamic "network_acls" {
    for_each = var.environment == "prod" ? [1] : []
    content {
      default_action = "Deny"
    }
  }

  identity {
    type = "SystemAssigned"
  }
}

resource "azurerm_cognitive_deployment" "model" {
  name                 = "${var.openai_model_name}-${var.openai_model_version}"
  cognitive_account_id = azurerm_cognitive_account.openai.id

  model {
    format  = "OpenAI"
    name    = var.openai_model_name
    version = var.openai_model_version
  }

  scale {
    type     = "Standard"
    capacity = 10
  }
}

# ─── General Cognitive Services ───────────────────────────────────────────────

resource "azurerm_cognitive_account" "cognitive" {
  name                          = "cog-${var.name_prefix}"
  resource_group_name           = var.resource_group_name
  location                      = var.location
  kind                          = "CognitiveServices"
  sku_name                      = "S0"
  custom_subdomain_name         = "cog-${var.name_prefix}"
  public_network_access_enabled = var.environment == "dev" ? true : false
  tags                          = var.tags

  identity {
    type = "SystemAssigned"
  }
}

# ─── Private Endpoint for OpenAI ──────────────────────────────────────────────

resource "azurerm_private_endpoint" "openai" {
  name                = "pe-oai-${var.name_prefix}"
  resource_group_name = var.resource_group_name
  location            = var.location
  subnet_id           = var.private_endpoints_subnet_id
  tags                = var.tags

  private_service_connection {
    name                           = "psc-oai-${var.name_prefix}"
    private_connection_resource_id = azurerm_cognitive_account.openai.id
    subresource_names              = ["account"]
    is_manual_connection           = false
  }

  private_dns_zone_group {
    name                 = "pdz-openai"
    private_dns_zone_ids = [azurerm_private_dns_zone.openai.id]
  }
}

resource "azurerm_private_dns_zone" "openai" {
  name                = "privatelink.openai.azure.com"
  resource_group_name = var.resource_group_name
  tags                = var.tags
}

resource "azurerm_private_dns_zone_virtual_network_link" "openai" {
  name                  = "vnetlink-oai-${var.name_prefix}"
  resource_group_name   = var.resource_group_name
  private_dns_zone_name = azurerm_private_dns_zone.openai.name
  virtual_network_id    = local.vnet_id
  registration_enabled  = false
  tags                  = var.tags
}

locals {
  vnet_id = join("/", slice(split("/", var.private_endpoints_subnet_id), 0, 9))
}

# ─── Diagnostic Settings ─────────────────────────────────────────────────────

resource "azurerm_monitor_diagnostic_setting" "openai" {
  name                       = "diag-oai-${var.name_prefix}"
  target_resource_id         = azurerm_cognitive_account.openai.id
  log_analytics_workspace_id = var.log_analytics_workspace_id

  enabled_log {
    category = "Audit"
  }

  enabled_log {
    category = "RequestResponse"
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}
