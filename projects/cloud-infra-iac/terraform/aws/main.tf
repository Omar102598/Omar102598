# ==============================================================================
# AWS Infrastructure - Root Module
# Enterprise multi-AZ deployment with EKS, RDS, and comprehensive monitoring
# ==============================================================================

locals {
  name_prefix = "${var.project_name}-${var.environment}"

  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Owner       = var.owner
    CostCenter  = var.cost_center
  }
}

# ------------------------------------------------------------------------------
# Networking
# ------------------------------------------------------------------------------
module "vpc" {
  source = "./modules/vpc"

  name_prefix        = local.name_prefix
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  environment        = var.environment
  enable_flow_logs   = var.enable_vpc_flow_logs
  log_retention_days = var.log_retention_days

  tags = local.common_tags
}

# ------------------------------------------------------------------------------
# Kubernetes (EKS)
# ------------------------------------------------------------------------------
module "eks" {
  source = "./modules/eks"

  name_prefix        = local.name_prefix
  cluster_version    = var.eks_cluster_version
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  node_instance_types = var.eks_node_instance_types
  node_min_size      = var.eks_node_min_size
  node_max_size      = var.eks_node_max_size
  node_desired_size  = var.eks_node_desired_size
  environment        = var.environment

  tags = local.common_tags

  depends_on = [module.vpc]
}

# ------------------------------------------------------------------------------
# Database (RDS PostgreSQL)
# ------------------------------------------------------------------------------
module "rds" {
  source = "./modules/rds"

  name_prefix            = local.name_prefix
  vpc_id                 = module.vpc.vpc_id
  private_subnet_ids     = module.vpc.private_subnet_ids
  instance_class         = var.rds_instance_class
  engine_version         = var.rds_engine_version
  allocated_storage      = var.rds_allocated_storage
  max_allocated_storage  = var.rds_max_allocated_storage
  database_name          = var.rds_database_name
  backup_retention_period = var.rds_backup_retention_period
  multi_az               = var.rds_multi_az
  eks_security_group_id  = module.eks.node_security_group_id
  environment            = var.environment

  tags = local.common_tags

  depends_on = [module.vpc]
}

# ------------------------------------------------------------------------------
# Monitoring & Observability
# ------------------------------------------------------------------------------
module "monitoring" {
  source = "./modules/monitoring"

  name_prefix            = local.name_prefix
  environment            = var.environment
  eks_cluster_name       = module.eks.cluster_name
  rds_instance_id        = module.rds.instance_id
  vpc_id                 = module.vpc.vpc_id
  alert_email_endpoints  = var.alert_email_endpoints
  log_retention_days     = var.log_retention_days
  enable_detailed_monitoring = var.enable_detailed_monitoring

  tags = local.common_tags

  depends_on = [module.eks, module.rds]
}
