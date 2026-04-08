#!/usr/bin/env bash
# ==============================================================================
# Infrastructure Validation Script
# Validates Terraform configurations and Bicep templates
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
log_success() { echo -e "${GREEN}[✓]${NC} $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error()   { echo -e "${RED}[✗]${NC} $*" >&2; }

ERRORS=0
WARNINGS=0

# ==============================================================================
# Terraform Validation
# ==============================================================================
validate_terraform() {
  local dir="$1"
  local name="$2"

  if [[ ! -d "$dir" ]]; then
    log_error "Directory not found: $dir"
    ((ERRORS++))
    return
  fi

  log_info "Validating Terraform: $name"

  cd "$dir"

  # Format check
  if terraform fmt -check -recursive -diff > /dev/null 2>&1; then
    log_success "$name: Format check passed"
  else
    log_warn "$name: Format issues detected (run 'terraform fmt -recursive')"
    ((WARNINGS++))
  fi

  # Initialize (skip backend for validation)
  if terraform init -backend=false -upgrade > /dev/null 2>&1; then
    log_success "$name: Init successful"
  else
    log_error "$name: Init failed"
    ((ERRORS++))
    return
  fi

  # Validate
  if terraform validate > /dev/null 2>&1; then
    log_success "$name: Validation passed"
  else
    log_error "$name: Validation failed"
    terraform validate
    ((ERRORS++))
  fi

  cd "$PROJECT_ROOT"
}

# ==============================================================================
# Bicep Validation
# ==============================================================================
validate_bicep() {
  local bicep_dir="$PROJECT_ROOT/bicep"

  if [[ ! -d "$bicep_dir" ]]; then
    log_error "Bicep directory not found: $bicep_dir"
    ((ERRORS++))
    return
  fi

  log_info "Validating Bicep templates"

  # Check if az CLI is available
  if ! command -v az &> /dev/null; then
    log_warn "Azure CLI not found. Skipping Bicep validation."
    ((WARNINGS++))
    return
  fi

  # Build main template (catches syntax errors)
  if az bicep build --file "$bicep_dir/main.bicep" > /dev/null 2>&1; then
    log_success "Bicep: main.bicep build successful"
  else
    log_error "Bicep: main.bicep build failed"
    az bicep build --file "$bicep_dir/main.bicep" 2>&1 || true
    ((ERRORS++))
  fi

  # Validate individual modules
  for module in "$bicep_dir"/modules/*.bicep; do
    local module_name
    module_name=$(basename "$module")
    if az bicep build --file "$module" > /dev/null 2>&1; then
      log_success "Bicep: $module_name build successful"
    else
      log_error "Bicep: $module_name build failed"
      ((ERRORS++))
    fi
  done

  # Validate parameter files
  for param_file in "$bicep_dir"/parameters/*.bicepparam; do
    local param_name
    param_name=$(basename "$param_file")
    if [[ -f "$param_file" ]]; then
      log_success "Bicep: Parameter file exists - $param_name"
    fi
  done
}

# ==============================================================================
# Security Checks
# ==============================================================================
check_security() {
  log_info "Running security checks"

  # Check for hardcoded secrets
  local secret_patterns=(
    'password\s*=\s*"[^"]*[A-Za-z0-9]'
    'secret\s*=\s*"[^"]*[A-Za-z0-9]'
    'AKIA[0-9A-Z]{16}'
    'aws_secret_access_key\s*=\s*"'
  )

  for pattern in "${secret_patterns[@]}"; do
    local matches
    matches=$(grep -rn --include="*.tf" --include="*.bicep" -iE "$pattern" "$PROJECT_ROOT" 2>/dev/null | grep -v 'example\|placeholder\|PLACEHOLDER\|CHANGE_ME\|random_password\|var\.\|param\s' || true)
    if [[ -n "$matches" ]]; then
      log_warn "Potential hardcoded secret detected:"
      echo "$matches"
      ((WARNINGS++))
    fi
  done

  log_success "Security scan complete"
}

# ==============================================================================
# File Structure Validation
# ==============================================================================
check_structure() {
  log_info "Validating project structure"

  local required_files=(
    "terraform/aws/main.tf"
    "terraform/aws/variables.tf"
    "terraform/aws/outputs.tf"
    "terraform/aws/providers.tf"
    "terraform/azure/main.tf"
    "terraform/azure/variables.tf"
    "terraform/azure/outputs.tf"
    "terraform/azure/providers.tf"
    "bicep/main.bicep"
    "scripts/deploy.sh"
    "scripts/destroy.sh"
    "README.md"
  )

  for file in "${required_files[@]}"; do
    if [[ -f "$PROJECT_ROOT/$file" ]]; then
      log_success "Found: $file"
    else
      log_error "Missing: $file"
      ((ERRORS++))
    fi
  done
}

# ==============================================================================
# Main Execution
# ==============================================================================
log_info "======================================"
log_info "Infrastructure Validation Suite"
log_info "======================================"
echo ""

check_structure
echo ""

validate_terraform "$PROJECT_ROOT/terraform/aws" "AWS"
echo ""

validate_terraform "$PROJECT_ROOT/terraform/azure" "Azure"
echo ""

validate_bicep
echo ""

check_security
echo ""

log_info "======================================"
if [[ $ERRORS -gt 0 ]]; then
  log_error "Validation FAILED: $ERRORS error(s), $WARNINGS warning(s)"
  exit 1
else
  log_success "Validation PASSED: $ERRORS error(s), $WARNINGS warning(s)"
  exit 0
fi
