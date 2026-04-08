// Main orchestration template - deploys all infrastructure modules
targetScope = 'subscription'

// ─── Parameters ───────────────────────────────────────────────────────────────

@description('Project name used as a prefix for all resources.')
@minLength(2)
@maxLength(12)
param projectName string

@description('Deployment environment.')
@allowed([
  'dev'
  'staging'
  'prod'
])
param environment string

@description('Primary Azure region for all resources.')
param location string = 'eastus'

@description('Team or individual responsible for the resources.')
param owner string

@description('Cost center for billing and charge-back.')
param costCenter string

@secure()
@description('Administrator password for Azure SQL Server.')
param sqlAdminPassword string

@description('Email address for monitoring alert notifications.')
param alertEmailAddress string

// ─── Variables ────────────────────────────────────────────────────────────────

var namePrefix = '${projectName}-${environment}'
var resourceGroupName = 'rg-${namePrefix}'

var commonTags = {
  Project: projectName
  Environment: environment
  Owner: owner
  CostCenter: costCenter
  ManagedBy: 'Bicep'
  LastDeployed: utcNow('yyyy-MM-dd')
}

// ─── Resource Group ───────────────────────────────────────────────────────────

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
  tags: commonTags
}

// ─── Module Deployments ───────────────────────────────────────────────────────

// Monitoring must deploy first so other modules can reference the workspace
module monitoring './modules/monitoring.bicep' = {
  name: 'monitoring-${uniqueString(deployment().name)}'
  scope: rg
  params: {
    namePrefix: namePrefix
    location: location
    environment: environment
    tags: commonTags
    alertEmailAddress: alertEmailAddress
  }
}

module networking './modules/networking.bicep' = {
  name: 'networking-${uniqueString(deployment().name)}'
  scope: rg
  params: {
    namePrefix: namePrefix
    location: location
    environment: environment
    tags: commonTags
  }
}

module compute './modules/compute.bicep' = {
  name: 'compute-${uniqueString(deployment().name)}'
  scope: rg
  params: {
    namePrefix: namePrefix
    location: location
    environment: environment
    aksSubnetId: networking.outputs.aksSubnetId
    appServiceSubnetId: networking.outputs.appServiceSubnetId
    logAnalyticsWorkspaceId: monitoring.outputs.logAnalyticsWorkspaceId
    tags: commonTags
  }
}

module database './modules/database.bicep' = {
  name: 'database-${uniqueString(deployment().name)}'
  scope: rg
  params: {
    namePrefix: namePrefix
    location: location
    environment: environment
    privateEndpointsSubnetId: networking.outputs.privateEndpointsSubnetId
    sqlAdminPassword: sqlAdminPassword
    tags: commonTags
  }
}

module aiServices './modules/ai-services.bicep' = {
  name: 'aiServices-${uniqueString(deployment().name)}'
  scope: rg
  params: {
    namePrefix: namePrefix
    location: location
    environment: environment
    privateEndpointsSubnetId: networking.outputs.privateEndpointsSubnetId
    logAnalyticsWorkspaceId: monitoring.outputs.logAnalyticsWorkspaceId
    tags: commonTags
  }
}

// ─── Outputs ──────────────────────────────────────────────────────────────────

output resourceGroupName string = rg.name
output vnetId string = networking.outputs.vnetId
output aksClusterName string = compute.outputs.aksClusterName
output appServiceDefaultHostName string = compute.outputs.appServiceDefaultHostName
output sqlServerFqdn string = database.outputs.sqlServerFqdn
output cosmosDbEndpoint string = database.outputs.cosmosDbEndpoint
output openAiEndpoint string = aiServices.outputs.openAiEndpoint
output applicationInsightsConnectionString string = monitoring.outputs.applicationInsightsConnectionString
