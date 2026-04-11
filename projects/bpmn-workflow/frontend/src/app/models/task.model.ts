export interface Task {
  id: string;
  processInstanceId: string;
  taskName: string;
  assignee: string;
  candidateGroup: string;
  priority: number;
  status: TaskStatus;
  dueDate: string;
  completedAt: string;
  createdAt: string;
}

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface TaskRequest {
  processInstanceId: string;
  taskName: string;
  assignee?: string;
  candidateGroup?: string;
  priority?: number;
  dueDate?: string;
}
