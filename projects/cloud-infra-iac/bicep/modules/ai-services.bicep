// AI Services module - Azure OpenAI, Cognitive Services, Diagnostics
// ─── Parameters ───────────────────────────────────────────────────────────────

@description('Naming prefix for all resources.')
param namePrefix string

@description('Azure region for resource deployment.')
param location string

@description('Deployment environment.')
@allowed(['dev', 'staging', 'prod'])
param environment string

@description('Subnet resource ID for private endpoints.')
param privateEndpointsSubnetId string

@description('Log Analytics workspace resource ID for diagnostics.')
param logAnalyticsWorkspaceId string

@description('Tags to apply to all resources.')
param tags object

// ─── Variables ────────────────────────────────────────────────────────────────

var openAiName = 'oai-${namePrefix}-${uniqueString(resourceGroup().id)}'
var cognitiveServicesName = 'cog-${namePrefix}-${uniqueString(resourceGroup().id)}'

var isProd = environment == 'prod'
var isDev = environment == 'dev'

// ─── Azure OpenAI ─────────────────────────────────────────────────────────────

resource openAi 'Microsoft.CognitiveServices/accounts@2024-04-01-preview' = {
  name: openAiName
  location: location
  tags: tags
  kind: 'OpenAI'
  sku: {
    name: 'S0'
  }
  properties: {
    customSubDomainName: openAiName
    publicNetworkAccess: isDev ? 'Enabled' : 'Disabled'
    networkAcls: isProd
      ? {
          defaultAction: 'Deny'
          ipRules: []
          virtualNetworkRules: []
        }
      : {
          defaultAction: 'Allow'
        }
  }
}

// ─── OpenAI GPT-4 Deployment ──────────────────────────────────────────────────

resource gpt4Deployment 'Microsoft.CognitiveServices/accounts/deployments@2024-04-01-preview' = {
  parent: openAi
  name: 'gpt-4'
  sku: {
    name: 'Standard'
    capacity: 10
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: 'gpt-4'
      version: '0613'
    }
  }
}

// ─── Cognitive Services Multi-Service Account ─────────────────────────────────

resource cognitiveServices 'Microsoft.CognitiveServices/accounts@2024-04-01-preview' = {
  name: cognitiveServicesName
  location: location
  tags: tags
  kind: 'CognitiveServices'
  sku: {
    name: 'S0'
  }
  properties: {
    customSubDomainName: cognitiveServicesName
    publicNetworkAccess: isDev ? 'Enabled' : 'Disabled'
  }
}

// ─── Diagnostic Settings for OpenAI ──────────────────────────────────────────

resource openAiDiagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: 'diag-${openAiName}'
  scope: openAi
  properties: {
    workspaceId: logAnalyticsWorkspaceId
    logs: [
      {
        categoryGroup: 'allLogs'
        enabled: true
        retentionPolicy: {
          enabled: false
          days: 0
        }
      }
    ]
    metrics: [
      {
        category: 'AllMetrics'
        enabled: true
        retentionPolicy: {
          enabled: false
          days: 0
        }
      }
    ]
  }
}

// ─── Private Endpoint for OpenAI (prod only) ─────────────────────────────────

resource openAiPrivateEndpoint 'Microsoft.Network/privateEndpoints@2024-01-01' = if (isProd) {
  name: 'pe-${openAiName}'
  location: location
  tags: tags
  properties: {
    subnet: {
      id: privateEndpointsSubnetId
    }
    privateLinkServiceConnections: [
      {
        name: 'openAiConnection'
        properties: {
          privateLinkServiceId: openAi.id
          groupIds: [
            'account'
          ]
        }
      }
    ]
  }
}

// ─── Outputs ──────────────────────────────────────────────────────────────────

output openAiEndpoint string = openAi.properties.endpoint
output openAiId string = openAi.id
output cognitiveServicesEndpoint string = cognitiveServices.properties.endpoint
