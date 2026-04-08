// Database module - Azure SQL, Cosmos DB, and Private Endpoints
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

@secure()
@description('Administrator password for Azure SQL Server.')
param sqlAdminPassword string

@description('Tags to apply to all resources.')
param tags object

// ─── Variables ────────────────────────────────────────────────────────────────

var sqlServerName = 'sql-${namePrefix}-${uniqueString(resourceGroup().id)}'
var sqlDatabaseName = 'sqldb-${namePrefix}'
var cosmosAccountName = 'cosmos-${namePrefix}-${uniqueString(resourceGroup().id)}'
var cosmosDbName = 'db-${namePrefix}'
var cosmosContainerName = 'main-container'
var sqlAdminLogin = '${namePrefix}-admin'

var isProd = environment == 'prod'
var isDev = environment == 'dev'

// ─── Azure SQL Server ─────────────────────────────────────────────────────────

resource sqlServer 'Microsoft.Sql/servers@2023-08-01-preview' = {
  name: sqlServerName
  location: location
  tags: tags
  properties: {
    administratorLogin: sqlAdminLogin
    administratorLoginPassword: sqlAdminPassword
    version: '12.0'
    minimalTlsVersion: '1.2'
    publicNetworkAccess: isProd ? 'Disabled' : 'Enabled'
  }
}

// ─── Azure SQL Database ───────────────────────────────────────────────────────

resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-08-01-preview' = {
  parent: sqlServer
  name: sqlDatabaseName
  location: location
  tags: tags
  sku: {
    name: isProd ? 'GP_Gen5' : 'GP_S_Gen5'
    tier: 'GeneralPurpose'
    capacity: isProd ? 4 : 1
    family: 'Gen5'
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: isProd ? 34359738368 : 2147483648 // 32GB prod, 2GB dev
    zoneRedundant: isProd
  }
}

// ─── SQL Short-Term Backup ────────────────────────────────────────────────────

resource sqlBackupShortTerm 'Microsoft.Sql/servers/databases/backupShortTermRetentionPolicies@2023-08-01-preview' = {
  parent: sqlDatabase
  name: 'default'
  properties: {
    retentionDays: isProd ? 35 : 7
    diffBackupIntervalInHours: isProd ? 12 : 24
  }
}

// ─── SQL Long-Term Backup ─────────────────────────────────────────────────────

resource sqlBackupLongTerm 'Microsoft.Sql/servers/databases/backupLongTermRetentionPolicies@2023-08-01-preview' = {
  parent: sqlDatabase
  name: 'default'
  properties: {
    weeklyRetention: isProd ? 'P4W' : 'P1W'
    monthlyRetention: isProd ? 'P12M' : 'P1M'
    yearlyRetention: isProd ? 'P5Y' : 'PT0S'
    weekOfYear: 1
  }
}

// ─── SQL Audit Settings ───────────────────────────────────────────────────────

resource sqlAudit 'Microsoft.Sql/servers/auditingSettings@2023-08-01-preview' = {
  parent: sqlServer
  name: 'default'
  properties: {
    state: 'Enabled'
    isAzureMonitorTargetEnabled: true
    retentionDays: isProd ? 90 : 30
  }
}

// ─── Private Endpoint for SQL Server ──────────────────────────────────────────

resource sqlPrivateEndpoint 'Microsoft.Network/privateEndpoints@2024-01-01' = {
  name: 'pe-${sqlServerName}'
  location: location
  tags: tags
  properties: {
    subnet: {
      id: privateEndpointsSubnetId
    }
    privateLinkServiceConnections: [
      {
        name: 'sqlServerConnection'
        properties: {
          privateLinkServiceId: sqlServer.id
          groupIds: [
            'sqlServer'
          ]
        }
      }
    ]
  }
}

// ─── Cosmos DB Account ────────────────────────────────────────────────────────

resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2024-02-15-preview' = {
  name: cosmosAccountName
  location: location
  tags: tags
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: isProd
      }
    ]
    enableMultipleWriteLocations: false
    capabilities: isDev
      ? [
          {
            name: 'EnableServerless'
          }
        ]
      : []
    backupPolicy: {
      type: 'Periodic'
      periodicModeProperties: {
        backupIntervalInMinutes: isProd ? 60 : 240
        backupRetentionIntervalInHours: isProd ? 720 : 168
        backupStorageRedundancy: isProd ? 'Geo' : 'Local'
      }
    }
  }
}

// ─── Cosmos DB SQL Database ───────────────────────────────────────────────────

resource cosmosDb 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-02-15-preview' = {
  parent: cosmosAccount
  name: cosmosDbName
  properties: {
    resource: {
      id: cosmosDbName
    }
    options: isDev
      ? {}
      : {
          throughput: 400
        }
  }
}

// ─── Cosmos DB Container ──────────────────────────────────────────────────────

resource cosmosContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-02-15-preview' = {
  parent: cosmosDb
  name: cosmosContainerName
  properties: {
    resource: {
      id: cosmosContainerName
      partitionKey: {
        paths: [
          '/tenantId'
        ]
        kind: 'Hash'
      }
      indexingPolicy: {
        indexingMode: 'consistent'
        automatic: true
        includedPaths: [
          {
            path: '/*'
          }
        ]
        excludedPaths: [
          {
            path: '/"_etag"/?'
          }
        ]
      }
      defaultTtl: isProd ? -1 : 2592000 // no expiry in prod, 30 days in dev
    }
  }
}

// ─── Outputs ──────────────────────────────────────────────────────────────────

output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName
output sqlDatabaseName string = sqlDatabase.name
output cosmosDbEndpoint string = cosmosAccount.properties.documentEndpoint
output cosmosDbName string = cosmosDb.name
