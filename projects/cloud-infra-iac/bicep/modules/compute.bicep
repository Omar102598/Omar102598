// Compute module - AKS, App Service, Container Apps
// ─── Parameters ───────────────────────────────────────────────────────────────

@description('Naming prefix for all resources.')
param namePrefix string

@description('Azure region for resource deployment.')
param location string

@description('Deployment environment.')
@allowed(['dev', 'staging', 'prod'])
param environment string

@description('Subnet resource ID for the AKS cluster.')
param aksSubnetId string

@description('Subnet resource ID for App Service VNet integration.')
param appServiceSubnetId string

@description('Log Analytics workspace resource ID for monitoring.')
param logAnalyticsWorkspaceId string

@description('Tags to apply to all resources.')
param tags object

// ─── Variables ────────────────────────────────────────────────────────────────

var aksClusterName = 'aks-${namePrefix}'
var appServicePlanName = 'asp-${namePrefix}'
var appServiceName = 'app-${namePrefix}'
var containerAppsEnvName = 'cae-${namePrefix}'
var containerAppName = 'ca-${namePrefix}-nginx'

var isProd = environment == 'prod'

var minReplicasByEnv = {
  dev: 0
  staging: 1
  prod: 2
}
var maxReplicasByEnv = {
  dev: 1
  staging: 3
  prod: 10
}

// ─── AKS Cluster ──────────────────────────────────────────────────────────────

resource aksCluster 'Microsoft.ContainerService/managedClusters@2024-02-01' = {
  name: aksClusterName
  location: location
  tags: tags
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    kubernetesVersion: '1.28'
    dnsPrefix: '${namePrefix}-aks'
    enableRBAC: true
    agentPoolProfiles: [
      {
        name: 'systempool'
        count: 2
        minCount: 2
        maxCount: 5
        vmSize: 'Standard_D4s_v5'
        osType: 'Linux'
        mode: 'System'
        enableAutoScaling: true
        availabilityZones: [
          '1'
          '2'
          '3'
        ]
        vnetSubnetID: aksSubnetId
        type: 'VirtualMachineScaleSets'
      }
      {
        name: 'userpool'
        count: 1
        minCount: 1
        maxCount: 10
        vmSize: 'Standard_D8s_v5'
        osType: 'Linux'
        mode: 'User'
        enableAutoScaling: true
        availabilityZones: [
          '1'
          '2'
          '3'
        ]
        vnetSubnetID: aksSubnetId
        type: 'VirtualMachineScaleSets'
      }
    ]
    networkProfile: {
      networkPlugin: 'azure'
      networkPolicy: 'calico'
      serviceCidr: '172.16.0.0/16'
      dnsServiceIP: '172.16.0.10'
    }
    addonProfiles: {
      omsagent: {
        enabled: true
        config: {
          logAnalyticsWorkspaceResourceID: logAnalyticsWorkspaceId
        }
      }
    }
    oidcIssuerProfile: {
      enabled: true
    }
    securityProfile: {
      workloadIdentity: {
        enabled: true
      }
    }
  }
}

// ─── App Service Plan ─────────────────────────────────────────────────────────

resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: appServicePlanName
  location: location
  tags: tags
  kind: 'linux'
  sku: {
    name: isProd ? 'P1v3' : 'B1'
  }
  properties: {
    reserved: true
  }
}

// ─── App Service ──────────────────────────────────────────────────────────────

resource appService 'Microsoft.Web/sites@2023-12-01' = {
  name: appServiceName
  location: location
  tags: tags
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    virtualNetworkSubnetId: appServiceSubnetId
    siteConfig: {
      linuxFxVersion: 'NODE|18-lts'
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      alwaysOn: isProd
      appSettings: [
        {
          name: 'ENVIRONMENT'
          value: environment
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~18'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
      ]
    }
  }
}

// ─── Container Apps Environment ───────────────────────────────────────────────

resource containerAppsEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: containerAppsEnvName
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: reference(logAnalyticsWorkspaceId, '2023-09-01').customerId
        sharedKey: listKeys(logAnalyticsWorkspaceId, '2023-09-01').primarySharedKey
      }
    }
    zoneRedundant: isProd
  }
}

// ─── Container App (nginx example) ───────────────────────────────────────────

resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: containerAppName
  location: location
  tags: tags
  properties: {
    managedEnvironmentId: containerAppsEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 80
        transport: 'auto'
        allowInsecure: false
      }
    }
    template: {
      containers: [
        {
          name: 'nginx'
          image: 'docker.io/library/nginx:stable-alpine'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
        }
      ]
      scale: {
        minReplicas: minReplicasByEnv[environment]
        maxReplicas: maxReplicasByEnv[environment]
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '50'
              }
            }
          }
        ]
      }
    }
  }
}

// ─── Outputs ──────────────────────────────────────────────────────────────────

output aksClusterName string = aksCluster.name
output aksClusterId string = aksCluster.id
output appServiceName string = appService.name
output appServiceDefaultHostName string = appService.properties.defaultHostName
output containerAppsEnvironmentId string = containerAppsEnv.id
