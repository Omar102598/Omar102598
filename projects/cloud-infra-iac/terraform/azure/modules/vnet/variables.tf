################################################################################
# VNet Module – Variables
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

variable "address_space" {
  description = "Virtual network address space."
  type        = list(string)
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)."
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources."
  type        = map(string)
}
