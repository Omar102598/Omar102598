# Cloud Infrastructure as Code

Enterprise multi-cloud infrastructure management using **Terraform** and **Azure Bicep**, deploying production-grade infrastructure across AWS and Azure.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions CI/CD                       │
│  Validate → Plan → Cost Estimate → Approve → Apply           │
└────────────┬───────────────────────────────┬─────────────────┘
             │                               │
     ┌───────▼───────┐             ┌─────────▼────────┐
     │   AWS (TF)    │             │  Azure (TF/Bicep) │
     ├───────────────┤             ├──────────────────┤
     │ VPC (3-AZ)    │             │ VNet + NSGs      │
     │ EKS 1.28      │             │ AKS 1.28         │
     │ RDS PostgreSQL│             │ Azure SQL        │
     │ CloudWatch    │             │ Cosmos DB        │
     │ KMS/Secrets   │             │ Azure OpenAI     │
     │ S3 + DynamoDB │             │ Key Vault        │
     └───────────────┘             └──────────────────┘
```

## Features

| Category | Details |
|----------|---------|
| **Multi-Cloud** | AWS and Azure with consistent patterns |
| **IaC Tools** | Terraform (HCL) + Azure Bicep |
| **Compute** | EKS / AKS with autoscaling, node pools, workload identity |
| **Databases** | RDS PostgreSQL, Azure SQL, Cosmos DB |
| **AI Services** | Azure OpenAI (GPT-4), Cognitive Services |
| **Security** | KMS/Key Vault encryption, private endpoints, NSGs, IRSA |
| **Monitoring** | CloudWatch, Log Analytics, Application Insights |
| **CI/CD** | GitHub Actions with environment gates and cost estimation |

## Project Structure

```
cloud-infra-iac/
├── terraform/
│   ├── aws/                    # AWS infrastructure
│   │   ├── main.tf             # Root module orchestration
│   │   ├── variables.tf        # Input variables with validation
│   │   ├── outputs.tf          # Infrastructure outputs
│   │   ├── providers.tf        # Provider and backend config
│   │   ├── terraform.tfvars.example
│   │   └── modules/
│   │       ├── vpc/            # VPC, subnets, NAT, flow logs
│   │       ├── eks/            # EKS cluster, IRSA, autoscaler
│   │       ├── rds/            # PostgreSQL, encryption, backups
│   │       └── monitoring/     # CloudWatch dashboards & alarms
│   └── azure/                  # Azure infrastructure
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       ├── providers.tf
│       ├── terraform.tfvars.example
│       └── modules/
│           ├── vnet/           # Virtual network, NSGs, NAT
│           ├── aks/            # AKS cluster, node pools
│           ├── sql/            # Azure SQL, Key Vault
│           └── ai-services/    # OpenAI, Cognitive Services
├── bicep/                      # Azure Bicep templates
│   ├── main.bicep              # Subscription-level orchestration
│   ├── modules/
│   │   ├── networking.bicep    # VNet, subnets, App Gateway
│   │   ├── compute.bicep       # AKS, App Service, Container Apps
│   │   ├── database.bicep      # Azure SQL, Cosmos DB
│   │   ├── monitoring.bicep    # Log Analytics, App Insights
│   │   └── ai-services.bicep   # Azure OpenAI, Cognitive Services
│   └── parameters/
│       ├── dev.bicepparam
│       ├── staging.bicepparam
│       └── prod.bicepparam
├── scripts/
│   ├── deploy.sh               # Deployment automation
│   ├── destroy.sh              # Safe teardown with gates
│   └── validate.sh             # Validation suite
├── .github/workflows/
│   └── infrastructure.yml      # CI/CD pipeline
└── docs/
    └── architecture.md         # Architecture documentation
```

## Quick Start

### Prerequisites

- [Terraform](https://www.terraform.io/downloads) >= 1.6.0
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli) >= 2.55.0
- [AWS CLI](https://aws.amazon.com/cli/) >= 2.0
- Configured cloud credentials

### Deploy AWS Infrastructure

```bash
# Configure credentials
export AWS_ACCESS_KEY_ID="PLACEHOLDER_AWS_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="PLACEHOLDER_AWS_SECRET_KEY"

# Copy and edit variables
cp terraform/aws/terraform.tfvars.example terraform/aws/terraform.tfvars

# Deploy
./scripts/deploy.sh -c aws -e dev -a plan
./scripts/deploy.sh -c aws -e dev -a apply
```

### Deploy Azure Infrastructure (Terraform)

```bash
# Login to Azure
az login

# Copy and edit variables
cp terraform/azure/terraform.tfvars.example terraform/azure/terraform.tfvars

# Deploy
./scripts/deploy.sh -c azure -e dev -a plan
./scripts/deploy.sh -c azure -e dev -a apply
```

### Deploy Azure Infrastructure (Bicep)

```bash
# Login to Azure
az login

# Deploy
./scripts/deploy.sh -c bicep -e dev -a plan
./scripts/deploy.sh -c bicep -e dev -a apply
```

### Validate All Configurations

```bash
./scripts/validate.sh
```

## Environment Configuration

| Environment | Auto-approve | Multi-AZ | Backups | WAF |
|-------------|:------------:|:--------:|:-------:|:---:|
| `dev` | ✅ | ❌ | 7 days | ❌ |
| `staging` | ❌ | Partial | 14 days | ✅ |
| `prod` | ❌ | ✅ | 30 days | ✅ |

## Security Highlights

- **Encryption at rest** — KMS (AWS) and Key Vault (Azure) for all data stores
- **Encryption in transit** — TLS 1.2+ enforced on all endpoints
- **Private networking** — VPC endpoints, private endpoints, no public database access in production
- **Secrets management** — AWS Secrets Manager and Azure Key Vault with auto-rotation
- **Identity** — IRSA (AWS) and Workload Identity (Azure) for pod-level authentication
- **Network segmentation** — Isolated database subnets, NSGs, Network ACLs
- **WAF protection** — Application Gateway WAF v2 for web traffic (staging/prod)
- **Audit logging** — VPC Flow Logs, SQL audit, CloudTrail integration

## CI/CD Pipeline

The GitHub Actions workflow provides:

1. **Validation** — Format check, `terraform validate`, security scan
2. **Cost Estimation** — Infracost integration on pull requests
3. **Plan** — Terraform plan with PR comment output
4. **Apply** — Manual workflow dispatch with environment gates
5. **Concurrency** — Deployment locks prevent parallel applies

```bash
# Manual deployment trigger
gh workflow run infrastructure.yml \
  -f cloud=aws \
  -f environment=staging \
  -f action=apply
```

## Teardown

```bash
# Non-production (interactive confirmation)
./scripts/destroy.sh -c aws -e dev

# Production (requires confirmation phrase)
./scripts/destroy.sh -c aws -e prod --confirm "destroy-prod-aws"
```

## Documentation

- [Architecture Documentation](docs/architecture.md) — Detailed architecture with diagrams
- [Terraform AWS Variables](terraform/aws/terraform.tfvars.example) — AWS configuration reference
- [Terraform Azure Variables](terraform/azure/terraform.tfvars.example) — Azure configuration reference

## Technologies

| Tool | Version | Purpose |
|------|---------|---------|
| Terraform | >= 1.6.0 | Multi-cloud IaC |
| Azure Bicep | Latest | Azure-native IaC |
| AWS Provider | ~> 5.30 | AWS resource management |
| AzureRM Provider | ~> 3.85 | Azure resource management |
| GitHub Actions | v4 | CI/CD automation |
| Infracost | Latest | Cost estimation |
