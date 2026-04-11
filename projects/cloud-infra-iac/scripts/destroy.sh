#!/usr/bin/env bash
# ==============================================================================
# Infrastructure Destroy Script
# Safely destroys infrastructure with multiple confirmation gates
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

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

Destroy cloud infrastructure with safety checks.

Options:
  -c, --cloud       Cloud provider: aws, azure, bicep      (required)
  -e, --environment Target environment: dev, staging, prod  (required)
  -r, --region      Cloud region override                   (optional)
      --confirm     Confirmation phrase (required for prod)
  -h, --help        Show this help message

Examples:
  $(basename "$0") -c aws -e dev
  $(basename "$0") -c azure -e staging
  $(basename "$0") -c aws -e prod --confirm "destroy-prod-aws"
EOF
  exit 0
}

CLOUD=""
ENVIRONMENT=""
REGION=""
CONFIRM_PHRASE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -c|--cloud)       CLOUD="$2"; shift 2 ;;
    -e|--environment) ENVIRONMENT="$2"; shift 2 ;;
    -r|--region)      REGION="$2"; shift 2 ;;
    --confirm)        CONFIRM_PHRASE="$2"; shift 2 ;;
    -h|--help)        usage ;;
    *)                log_error "Unknown option: $1"; usage ;;
  esac
done

if [[ -z "$CLOUD" ]] || [[ -z "$ENVIRONMENT" ]]; then
  log_error "Cloud provider and environment are required."
  usage
fi

if [[ ! "$CLOUD" =~ ^(aws|azure|bicep)$ ]]; then
  log_error "Invalid cloud provider: $CLOUD"
  exit 1
fi

if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
  log_error "Invalid environment: $ENVIRONMENT"
  exit 1
fi

# Production safety gate
if [[ "$ENVIRONMENT" == "prod" ]]; then
  expected_phrase="destroy-prod-${CLOUD}"
  if [[ "$CONFIRM_PHRASE" != "$expected_phrase" ]]; then
    log_error "Production destroy requires confirmation phrase."
    log_error "Use: --confirm \"$expected_phrase\""
    exit 1
  fi

  log_warn "╔══════════════════════════════════════════════╗"
  log_warn "║  WARNING: PRODUCTION INFRASTRUCTURE DESTROY  ║"
  log_warn "╚══════════════════════════════════════════════╝"
  log_warn ""
  log_warn "You are about to destroy PRODUCTION infrastructure."
  log_warn "This action is IRREVERSIBLE."
  log_warn ""

  echo -n "Type the environment name to confirm (prod): "
  read -r user_confirm
  if [[ "$user_confirm" != "prod" ]]; then
    log_error "Confirmation failed. Aborting."
    exit 1
  fi

  echo -n "Type 'I understand the consequences' to proceed: "
  read -r user_confirm2
  if [[ "$user_confirm2" != "I understand the consequences" ]]; then
    log_error "Confirmation failed. Aborting."
    exit 1
  fi
fi

# Non-production confirmation
if [[ "$ENVIRONMENT" != "prod" ]]; then
  log_warn "This will DESTROY all $CLOUD resources in $ENVIRONMENT."
  echo -n "Continue? (yes/no): "
  read -r confirm
  if [[ "$confirm" != "yes" ]]; then
    log_warn "Destroy cancelled."
    exit 0
  fi
fi

log_info "======================================"
log_info "Infrastructure Destroy"
log_info "Cloud:       $CLOUD"
log_info "Environment: $ENVIRONMENT"
log_info "======================================"

destroy_terraform() {
  local cloud_dir="$PROJECT_ROOT/terraform/$1"
  cd "$cloud_dir"

  log_info "Initializing Terraform..."
  terraform init \
    -backend-config="key=${1}/${ENVIRONMENT}/terraform.tfstate" \
    -reconfigure

  terraform workspace select "$ENVIRONMENT" 2>/dev/null || {
    log_error "Workspace $ENVIRONMENT does not exist."
    exit 1
  }

  local var_file=""
  if [[ -f "environments/${ENVIRONMENT}.tfvars" ]]; then
    var_file="-var-file=environments/${ENVIRONMENT}.tfvars"
  fi

  log_info "Planning destroy..."
  terraform plan \
    -destroy \
    -var="environment=${ENVIRONMENT}" \
    ${var_file:+"$var_file"} \
    -out="tfplan-destroy-${ENVIRONMENT}"

  log_warn "Executing destroy..."
  terraform apply "tfplan-destroy-${ENVIRONMENT}"

  log_success "Terraform destroy complete for $CLOUD/$ENVIRONMENT."
}

destroy_bicep() {
  local project_name="${PROJECT_NAME:-myapp}"
  local rg_name="${project_name}-${ENVIRONMENT}-rg"

  log_info "Listing resources in resource group: $rg_name"
  az resource list --resource-group "$rg_name" --output table || true

  log_warn "Deleting resource group: $rg_name"
  az group delete \
    --name "$rg_name" \
    --yes \
    --no-wait

  log_success "Resource group deletion initiated: $rg_name"
  log_info "Deletion is running asynchronously. Check the Azure portal for status."
}

case "$CLOUD" in
  aws|azure) destroy_terraform "$CLOUD" ;;
  bicep)     destroy_bicep ;;
esac
