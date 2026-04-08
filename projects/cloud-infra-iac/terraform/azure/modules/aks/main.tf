################################################################################
# AKS Module – Kubernetes Cluster, Node Pools, Log Analytics
################################################################################

data "azurerm_client_config" "current" {}

# ─── Managed Identity ─────────────────────────────────────────────────────────

resource "azurerm_user_assigned_identity" "aks" {
  name                = "id-aks-${var.name_prefix}"
  resource_group_name = var.resource_group_name
  location            = var.location
  tags                = var.tags
}

# ─── Log Analytics ────────────────────────────────────────────────────────────

resource "azurerm_log_analytics_workspace" "aks" {
  name                = "law-${var.name_prefix}"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = "PerGB2018"
  retention_in_days   = 90
  tags                = var.tags
}

resource "azurerm_log_analytics_solution" "container_insights" {
  solution_name         = "ContainerInsights"
  workspace_resource_id = azurerm_log_analytics_workspace.aks.id
  workspace_name        = azurerm_log_analytics_workspace.aks.name
  location              = var.location
  resource_group_name   = var.resource_group_name

  plan {
    publisher = "Microsoft"
    product   = "OMSGallery/ContainerInsights"
  }

  tags = var.tags
}

# ─── AKS Cluster ──────────────────────────────────────────────────────────────

resource "azurerm_kubernetes_cluster" "main" {
  name                = "aks-${var.name_prefix}"
  resource_group_name = var.resource_group_name
  location            = var.location
  dns_prefix          = "aks-${var.name_prefix}"
  kubernetes_version  = var.kubernetes_version
  sku_tier            = var.environment == "prod" ? "Standard" : "Free"
  tags                = var.tags

  # Private cluster in prod; public in dev/staging
  private_cluster_enabled = var.environment == "prod" ? true : false

  oidc_issuer_enabled       = true
  workload_identity_enabled = true

  default_node_pool {
    name                = "system"
    vm_size             = var.system_node_vm_size
    vnet_subnet_id      = var.aks_subnet_id
    os_disk_type        = "Managed"
    zones               = ["1", "2", "3"]
    enable_auto_scaling = true
    min_count           = var.min_node_count
    max_count           = var.max_node_count
    max_pods            = 50

    node_labels = {
      "nodepool-type" = "system"
      "environment"   = var.environment
    }

    upgrade_settings {
      max_surge = "33%"
    }
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.aks.id]
  }

  network_profile {
    network_plugin    = "azure"
    network_policy    = "calico"
    load_balancer_sku = "standard"
    outbound_type     = "userAssignedNATGateway"
    service_cidr      = "172.16.0.0/16"
    dns_service_ip    = "172.16.0.10"
  }

  oms_agent {
    log_analytics_workspace_id = azurerm_log_analytics_workspace.aks.id
  }

  azure_active_directory_role_based_access_control {
    managed            = true
    azure_rbac_enabled = true
    tenant_id          = data.azurerm_client_config.current.tenant_id
  }

  key_vault_secrets_provider {
    secret_rotation_enabled = true
  }

  maintenance_window {
    allowed {
      day   = "Sunday"
      hours = [2, 3, 4]
    }
  }

  lifecycle {
    ignore_changes = [
      default_node_pool[0].node_count,
    ]
  }
}

# ─── User Node Pool ──────────────────────────────────────────────────────────

resource "azurerm_kubernetes_cluster_node_pool" "user" {
  name                  = "user"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.main.id
  vm_size               = var.user_node_vm_size
  vnet_subnet_id        = var.aks_subnet_id
  os_disk_type          = "Managed"
  zones                 = ["1", "2", "3"]
  mode                  = "User"
  enable_auto_scaling   = true
  min_count             = var.min_node_count
  max_count             = var.max_node_count
  max_pods              = 50
  tags                  = var.tags

  node_labels = {
    "nodepool-type" = "user"
    "environment"   = var.environment
  }

  node_taints = [
    "workload=user:NoSchedule"
  ]

  upgrade_settings {
    max_surge = "33%"
  }

  lifecycle {
    ignore_changes = [
      node_count,
    ]
  }
}
