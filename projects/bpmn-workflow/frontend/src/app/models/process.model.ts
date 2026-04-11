export interface Process {
  id: string;
  processDefinitionKey: string;
  businessKey: string;
  status: ProcessStatus;
  initiatedBy: string;
  variables: string;
  createdAt: string;
  updatedAt: string;
}

export type ProcessStatus = 'ACTIVE' | 'SUSPENDED' | 'COMPLETED' | 'TERMINATED';

export interface ProcessRequest {
  processDefinitionKey: string;
  businessKey?: string;
  initiatedBy: string;
  variables?: string;
}
