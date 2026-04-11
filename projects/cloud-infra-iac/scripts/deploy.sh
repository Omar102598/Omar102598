#!/usr/bin/env bash
# ==============================================================================
# Infrastructure Deployment Script
# Deploys Terraform or Bicep infrastructure for the specified cloud and environment
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC} $*"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }

usage() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Deploy cloud infrastructure using Terraform or Bicep.

Options:
  -c, --cloud       Cloud provider: aws, azure, bicep          (required)
  -e, --environment Target environment: dev, staging, prod      (required)
  -a, --action      Deployment action: plan, apply, destroy     (default: plan)
  -r, --region      Cloud region override                       (optional)
      --auto-approve Skip confirmation prompts (use with caution)
  -h, --help        Show this help message

Examples:
  $(basename "$0") -c aws -e dev -a plan
  $(basename "$0") -c azure -e staging -a apply
  $(basename "$0") -c bicep -e prod -a apply
  $(basename "$0") -c aws -e prod -a apply --auto-approve
EOF
  exit 0
}

# Defaults
CLOUD=""
ENVIRONMENT=""
ACTION="plan"
REGION=""
AUTO_APPROVE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    -c|--cloud)       CLOUD="$2"; shift 2 ;;
    -e|--environment) ENVIRONMENT="$2"; shift 2 ;;
    -a|--action)      ACTION="$2"; shift 2 ;;
    -r|--region)      REGION="$2"; shift 2 ;;
    --auto-approve)   AUTO_APPROVE=true; shift ;;
    -h|--help)        usage ;;
    *)                log_error "Unknown option: $1"; usage ;;
  esac
done

# Validate required parameters
if [[ -z "$CLOUD" ]] || [[ -z "$ENVIRONMENT" ]]; then
  log_error "Cloud provider and environment are required."
  usage
fi

if [[ ! "$CLOUD" =~ ^(aws|azure|bicep)$ ]]; then
  log_error "Invalid cloud provider: $CLOUD. Must be aws, azure, or bicep."
  exit 1
fi

if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
  log_error "Invalid environment: $ENVIRONMENT. Must be dev, staging, or prod."
  exit 1
fi

if [[ ! "$ACTION" =~ ^(plan|apply|destroy)$ ]]; then
  log_error "Invalid action: $ACTION. Must be plan, apply, or destroy."
  exit 1
fi

# Safety check for production
if [[ "$ENVIRONMENT" == "prod" ]] && [[ "$AUTO_APPROVE" == true ]]; then
  log_warn "Auto-approve is enabled for PRODUCTION. Proceeding in 10 seconds..."
  log_warn "Press Ctrl+C to cancel."
  sleep 10
fi

# ==============================================================================
# Terraform Deployment
# ==============================================================================
deploy_terraform() {
  local cloud_dir="$PROJECT_ROOT/terraform/$1"

  if [[ ! -d "$cloud_dir" ]]; then
    log_error "Terraform directory not found: $cloud_dir"
    exit 1
  fi

  cd "$cloud_dir"
  log_info "Working directory: $cloud_dir"

  # Initialize Terraform
  log_info "Initializing Terraform..."
  terraform init \
    -backend-config="key=${1}/${ENVIRONMENT}/terraform.tfstate" \
    -upgrade \
    -reconfigure

  # Select or create workspace
  log_info "Selecting workspace: $ENVIRONMENT"
  terraform workspace select "$ENVIRONMENT" 2>/dev/null || terraform workspace new "$ENVIRONMENT"

  # Set var file
  local var_file=""
  if [[ -f "environments/${ENVIRONMENT}.tfvars" ]]; then
    var_file="-var-file=environments/${ENVIRONMENT}.tfvars"
  fi

  local common_vars="-var=environment=${ENVIRONMENT}"
  if [[ -n "$REGION" ]]; then
    if [[ "$1" == "aws" ]]; then
      common_vars="$common_vars -var=aws_region=${REGION}"
    else
      common_vars="$common_vars -var=azure_region=${REGION}"
    fi
  fi

  case "$ACTION" in
    plan)
      log_info "Running Terraform plan..."
      terraform plan \
        $common_vars \
        ${var_file:+"$var_file"} \
        -out="tfplan-${ENVIRONMENT}" \
        -detailed-exitcode || true
      log_success "Plan complete. Review the output above."
      ;;
    apply)
      log_info "Running Terraform plan..."
      terraform plan \
        $common_vars \
        ${var_file:+"$var_file"} \
        -out="tfplan-${ENVIRONMENT}"

      if [[ "$AUTO_APPROVE" == true ]]; then
        log_info "Applying Terraform changes (auto-approved)..."
        terraform apply "tfplan-${ENVIRONMENT}"
      else
        echo ""
        read -rp "Do you want to apply these changes? (yes/no): " confirm
        if [[ "$confirm" == "yes" ]]; then
          terraform apply "tfplan-${ENVIRONMENT}"
        else
          log_warn "Apply cancelled."
          exit 0
        fi
      fi
      log_success "Apply complete."
      ;;
    destroy)
      if [[ "$ENVIRONMENT" == "prod" ]]; then
        log_error "Destroy is not allowed in production via this script."
        log_error "Use the destroy.sh script with additional safeguards."
        exit 1
      fi
      log_warn "This will DESTROY all resources in $ENVIRONMENT!"
      if [[ "$AUTO_APPROVE" == true ]]; then
        terraform destroy $common_vars ${var_file:+"$var_file"} -auto-approve
      else
        terraform destroy $common_vars ${var_file:+"$var_file"}
      fi
      log_success "Destroy complete."
      ;;
  esac
}

# ==============================================================================
# Bicep Deployment
# ==============================================================================
deploy_bicep() {
  local bicep_dir="$PROJECT_ROOT/bicep"
  local param_file="$bicep_dir/parameters/${ENVIRONMENT}.bicepparam"

  if [[ ! -f "$param_file" ]]; then
    log_error "Parameter file not found: $param_file"
    exit 1
  fi

  cd "$bicep_dir"
  log_info "Working directory: $bicep_dir"

  local deployment_name="infra-${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S)"
  local location="${REGION:-eastus}"

  case "$ACTION" in
    plan)
      log_info "Running Bicep what-if analysis..."
      az deployment sub what-if \
        --name "$deployment_name" \
        --location "$location" \
        --template-file main.bicep \
        --parameters "$param_file" \
        --result-format FullResourcePayloads
      log_success "What-if analysis complete."
      ;;
    apply)
      log_info "Validating Bicep template..."
      az deployment sub validate \
        --name "$deployment_name" \
        --location "$location" \
        --template-file main.bicep \
        --parameters "$param_file"

      log_info "Deploying Bicep template..."
      if [[ "$AUTO_APPROVE" == true ]]; then
        az deployment sub create \
          --name "$deployment_name" \
          --location "$location" \
          --template-file main.bicep \
          --parameters "$param_file" \
          --confirm-with-what-if
      else
        az deployment sub create \
          --name "$deployment_name" \
          --location "$location" \
          --template-file main.bicep \
          --parameters "$param_file" \
          --confirm-with-what-if
      fi
      log_success "Bicep deployment complete: $deployment_name"
      ;;
    destroy)
      if [[ "$ENVIRONMENT" == "prod" ]]; then
        log_error "Destroy is not allowed in production via this script."
        exit 1
      fi
      log_warn "Bicep does not natively support destroy. Use destroy.sh for resource group deletion."
      exit 1
      ;;
  esac
}

# ==============================================================================
# Main Execution
# ==============================================================================
log_info "======================================"
log_info "Infrastructure Deployment"
log_info "Cloud:       $CLOUD"
log_info "Environment: $ENVIRONMENT"
log_info "Action:      $ACTION"
log_info "Region:      ${REGION:-default}"
log_info "======================================"

case "$CLOUD" in
  aws|azure) deploy_terraform "$CLOUD" ;;
  bicep)     deploy_bicep ;;
esac
