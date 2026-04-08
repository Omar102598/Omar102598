################################################################################
# SQL Module – SQL Server, Database, Key Vault, Private Endpoint
################################################################################

data "azurerm_client_config" "current" {}

# ─── Admin Password ───────────────────────────────────────────────────────────

resource "random_password" "sql_admin" {
  length           = 32
  special          = true
  override_special = "!@#$%^&*()-_=+"
  min_upper        = 4
  min_lower        = 4
  min_numeric      = 4
  min_special      = 4
}

# ─── Key Vault ────────────────────────────────────────────────────────────────

resource "azurerm_key_vault" "sql" {
  name                       = "kv-sql-${replace(var.name_prefix, "-", "")}"
  resource_group_name        = var.resource_group_name
  location                   = var.location
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  soft_delete_retention_days = 90
  purge_protection_enabled   = true
  enable_rbac_authorization  = true
  tags                       = var.tags

  network_acls {
    default_action = "Deny"
    bypass         = "AzureServices"
  }
}

resource "azurerm_role_assignment" "kv_secrets_officer" {
  scope                = azurerm_key_vault.sql.id
  role_definition_name = "Key Vault Secrets Officer"
  principal_id         = data.azurerm_client_config.current.object_id
}

resource "azurerm_key_vault_secret" "sql_admin_password" {
  name         = "sql-admin-password"
  value        = random_password.sql_admin.result
  key_vault_id = azurerm_key_vault.sql.id
  tags         = var.tags

  depends_on = [azurerm_role_assignment.kv_secrets_officer]
}

# ─── SQL Server ───────────────────────────────────────────────────────────────

resource "azurerm_mssql_server" "main" {
  name                          = "sql-${var.name_prefix}"
  resource_group_name           = var.resource_group_name
  location                      = var.location
  version                       = "12.0"
  administrator_login           = "sqladmin"
  administrator_login_password  = random_password.sql_admin.result
  minimum_tls_version           = "1.2"
  public_network_access_enabled = var.environment == "prod" ? false : true
  tags                          = var.tags

  azuread_administrator {
    login_username = "AzureAD Admin"
    object_id      = data.azurerm_client_config.current.object_id
    tenant_id      = data.azurerm_client_config.current.tenant_id
  }
}

# ─── SQL Database ─────────────────────────────────────────────────────────────

resource "azurerm_mssql_database" "main" {
  name                 = "sqldb-${var.name_prefix}"
  server_id            = azurerm_mssql_server.main.id
  sku_name             = var.sku_name
  max_size_gb          = var.max_size_gb
  zone_redundant       = var.environment == "prod" ? true : false
  storage_account_type = var.environment == "prod" ? "Geo" : "Local"
  tags                 = var.tags

  short_term_retention_policy {
    retention_days           = var.backup_retention_days
    backup_interval_in_hours = var.environment == "prod" ? 12 : 24
  }

  dynamic "long_term_retention_policy" {
    for_each = var.environment == "prod" ? [1] : []
    content {
      weekly_retention  = "P4W"
      monthly_retention = "P12M"
      yearly_retention  = "P5Y"
      week_of_year      = 1
    }
  }

  threat_detection_policy {
    state                = "Enabled"
    email_account_admins = "Enabled"
    retention_days       = var.backup_retention_days
  }

  lifecycle {
    prevent_destroy = true
  }
}

# ─── Auditing ─────────────────────────────────────────────────────────────────

resource "azurerm_mssql_server_extended_auditing_policy" "main" {
  server_id              = azurerm_mssql_server.main.id
  retention_in_days      = var.backup_retention_days
  log_monitoring_enabled = true
}

# ─── Firewall Rule (dev only) ────────────────────────────────────────────────

resource "azurerm_mssql_firewall_rule" "allow_azure_services" {
  count            = var.environment == "dev" ? 1 : 0
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# ─── Private Endpoint ─────────────────────────────────────────────────────────

resource "azurerm_private_endpoint" "sql" {
  name                = "pe-sql-${var.name_prefix}"
  resource_group_name = var.resource_group_name
  location            = var.location
  subnet_id           = var.private_endpoints_subnet_id
  tags                = var.tags

  private_service_connection {
    name                           = "psc-sql-${var.name_prefix}"
    private_connection_resource_id = azurerm_mssql_server.main.id
    subresource_names              = ["sqlServer"]
    is_manual_connection           = false
  }

  private_dns_zone_group {
    name                 = "pdz-sql"
    private_dns_zone_ids = [azurerm_private_dns_zone.sql.id]
  }
}

resource "azurerm_private_dns_zone" "sql" {
  name                = "privatelink.database.windows.net"
  resource_group_name = var.resource_group_name
  tags                = var.tags
}

resource "azurerm_private_dns_zone_virtual_network_link" "sql" {
  name                  = "vnetlink-sql-${var.name_prefix}"
  resource_group_name   = var.resource_group_name
  private_dns_zone_name = azurerm_private_dns_zone.sql.name
  virtual_network_id    = local.vnet_id
  registration_enabled  = false
  tags                  = var.tags
}

locals {
  # Derive VNet ID from the subnet ID
  vnet_id = join("/", slice(split("/", var.private_endpoints_subnet_id), 0, 9))
}
