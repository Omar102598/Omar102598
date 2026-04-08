// Monitoring module - Log Analytics, Application Insights, Alerts, Dashboard
// ─── Parameters ───────────────────────────────────────────────────────────────

@description('Naming prefix for all resources.')
param namePrefix string

@description('Azure region for resource deployment.')
param location string

@description('Deployment environment.')
@allowed(['dev', 'staging', 'prod'])
param environment string

@description('Tags to apply to all resources.')
param tags object

@description('Email address for alert notifications.')
param alertEmailAddress string

// ─── Variables ────────────────────────────────────────────────────────────────

var logAnalyticsName = 'log-${namePrefix}'
var appInsightsName = 'appi-${namePrefix}'
var actionGroupName = 'ag-${namePrefix}-alerts'
var dashboardName = 'dash-${namePrefix}'

var retentionByEnvironment = {
  dev: 30
  staging: 90
  prod: 365
}

// ─── Log Analytics Workspace ──────────────────────────────────────────────────

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: retentionByEnvironment[environment]
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
}

// ─── Application Insights ─────────────────────────────────────────────────────

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    IngestionMode: 'LogAnalytics'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// ─── Action Group ─────────────────────────────────────────────────────────────

resource actionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: actionGroupName
  location: 'global'
  tags: tags
  properties: {
    groupShortName: 'Alerts'
    enabled: true
    emailReceivers: [
      {
        name: 'PrimaryEmail'
        emailAddress: alertEmailAddress
        useCommonAlertSchema: true
      }
    ]
  }
}

// ─── Metric Alert: High CPU ──────────────────────────────────────────────────

resource highCpuAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: 'alert-${namePrefix}-high-cpu'
  location: 'global'
  tags: tags
  properties: {
    description: 'Alert when average CPU exceeds 80%'
    severity: 2
    enabled: true
    scopes: [
      resourceGroup().id
    ]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT15M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.MultiResourceMultiMetricCriteria'
      allOf: [
        {
          name: 'HighCPU'
          metricName: 'Percentage CPU'
          metricNamespace: 'Microsoft.Compute/virtualMachines'
          operator: 'GreaterThan'
          threshold: 80
          timeAggregation: 'Average'
          criterionType: 'StaticThresholdCriterion'
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroup.id
      }
    ]
  }
}

// ─── Metric Alert: High Memory ───────────────────────────────────────────────

resource highMemoryAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: 'alert-${namePrefix}-high-memory'
  location: 'global'
  tags: tags
  properties: {
    description: 'Alert when average memory exceeds 80%'
    severity: 2
    enabled: true
    scopes: [
      resourceGroup().id
    ]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT15M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.MultiResourceMultiMetricCriteria'
      allOf: [
        {
          name: 'HighMemory'
          metricName: 'Available Memory Bytes'
          metricNamespace: 'Microsoft.Compute/virtualMachines'
          operator: 'LessThan'
          threshold: 20
          timeAggregation: 'Average'
          criterionType: 'StaticThresholdCriterion'
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroup.id
      }
    ]
  }
}

// ─── Activity Log Alert: Service Health ──────────────────────────────────────

resource serviceHealthAlert 'Microsoft.Insights/activityLogAlerts@2020-10-01' = {
  name: 'alert-${namePrefix}-service-health'
  location: 'global'
  tags: tags
  properties: {
    description: 'Alert on Azure Service Health incidents'
    enabled: true
    scopes: [
      resourceGroup().id
    ]
    condition: {
      allOf: [
        {
          field: 'category'
          equals: 'ServiceHealth'
        }
        {
          field: 'properties.incidentType'
          equals: 'Incident'
        }
      ]
    }
    actions: {
      actionGroups: [
        {
          actionGroupId: actionGroup.id
        }
      ]
    }
  }
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

resource dashboard 'Microsoft.Portal/dashboards@2020-09-01-preview' = {
  name: dashboardName
  location: location
  tags: union(tags, {
    'hidden-title': 'Monitoring Dashboard - ${namePrefix}'
  })
  properties: {
    lenses: [
      {
        order: 0
        parts: [
          {
            position: {
              x: 0
              y: 0
              colSpan: 6
              rowSpan: 4
            }
            metadata: {
              type: 'Extension/Microsoft_OperationsManagementSuite_Workspace/PartType/LogsDashboardPart'
              inputs: [
                {
                  name: 'resourceTypeMode'
                  value: 'workspace'
                }
                {
                  name: 'ComponentId'
                  value: appInsights.id
                }
              ]
              #disable-next-line BCP036
              settings: {
                content: {
                  title: 'Application Insights Overview'
                  description: 'Application performance and availability'
                }
              }
            }
          }
          {
            position: {
              x: 6
              y: 0
              colSpan: 6
              rowSpan: 4
            }
            metadata: {
              type: 'Extension/HubsExtension/PartType/MonitorChartPart'
              inputs: [
                {
                  name: 'options'
                  value: {
                    chart: {
                      metrics: [
                        {
                          resourceMetadata: {
                            id: appInsights.id
                          }
                          name: 'requests/count'
                          aggregationType: 7
                        }
                      ]
                      title: 'Request Count'
                      visualization: {
                        chartType: 2
                      }
                    }
                  }
                }
              ]
              settings: {}
            }
          }
        ]
      }
    ]
    metadata: {
      model: {
        timeRange: {
          value: {
            relative: {
              duration: 24
              timeUnit: 1
            }
          }
          type: 'MsPortalFx.Composition.Configuration.ValueTypes.TimeRange'
        }
      }
    }
  }
}

// ─── Outputs ──────────────────────────────────────────────────────────────────

output logAnalyticsWorkspaceId string = logAnalytics.id
output logAnalyticsWorkspaceName string = logAnalytics.name
output applicationInsightsConnectionString string = appInsights.properties.ConnectionString
output applicationInsightsInstrumentationKey string = appInsights.properties.InstrumentationKey
