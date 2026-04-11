################################################################################
# AKS Module – Variables
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

variable "aks_subnet_id" {
  description = "ID of the subnet for AKS nodes."
  type        = string
}

variable "kubernetes_version" {
  description = "Kubernetes version."
  type        = string
}

variable "system_node_vm_size" {
  description = "VM size for system node pool."
  type        = string
}

variable "user_node_vm_size" {
  description = "VM size for user node pool."
  type        = string
}

variable "min_node_count" {
  description = "Minimum nodes per pool."
  type        = number
}

variable "max_node_count" {
  description = "Maximum nodes per pool."
  type        = number
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)."
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources."
  type        = map(string)
}
