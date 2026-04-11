import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="task-board">
      <div class="header">
        <h2>Task Board</h2>
        <button class="btn-primary" (click)="loadTasks()">Refresh</button>
      </div>

      <div class="loading" *ngIf="loading">Loading tasks...</div>
      <div class="error" *ngIf="error">{{ error }}</div>

      <div class="columns" *ngIf="!loading">
        <div class="column" *ngFor="let col of columns">
          <h3 class="col-title">{{ col.label }} <span class="count">{{ getTasksByStatus(col.status).length }}</span></h3>
          <div class="task-card" *ngFor="let task of getTasksByStatus(col.status)">
            <div class="task-name">{{ task.taskName }}</div>
            <div class="task-meta">
              <span *ngIf="task.assignee">👤 {{ task.assignee }}</span>
              <span *ngIf="task.candidateGroup">👥 {{ task.candidateGroup }}</span>
              <span class="priority">P{{ task.priority }}</span>
            </div>
            <div class="task-actions">
              <button *ngIf="task.status === 'PENDING'" (click)="startTask(task.id)">Start</button>
              <button *ngIf="task.status === 'IN_PROGRESS'" (click)="completeTask(task.id)">Complete</button>
              <button *ngIf="task.status !== 'COMPLETED' && task.status !== 'CANCELLED'" (click)="cancelTask(task.id)">Cancel</button>
            </div>
          </div>
          <div class="empty-col" *ngIf="getTasksByStatus(col.status).length === 0">No tasks</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .task-board { padding: 1rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .columns { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
    .column { background: #f8f9fa; border-radius: 8px; padding: 1rem; min-height: 400px; }
    .col-title { margin: 0 0 1rem 0; font-size: 0.9rem; text-transform: uppercase; color: #6c757d; }
    .count { background: #dee2e6; border-radius: 12px; padding: 2px 8px; font-size: 0.75rem; }
    .task-card { background: white; border-radius: 6px; padding: 0.75rem; margin-bottom: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .task-name { font-weight: 600; margin-bottom: 0.5rem; }
    .task-meta { font-size: 0.8rem; color: #6c757d; margin-bottom: 0.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .priority { background: #e9ecef; border-radius: 3px; padding: 1px 4px; }
    .task-actions button { font-size: 0.75rem; padding: 0.2rem 0.4rem; margin-right: 0.25rem; cursor: pointer; }
    .empty-col { text-align: center; color: #adb5bd; font-size: 0.85rem; padding: 2rem 0; }
    .error { color: #dc3545; padding: 1rem; }
    .loading { padding: 2rem; text-align: center; color: #6c757d; }
  `]
})
export class TaskBoardComponent implements OnInit {
  tasks: Task[] = [];
  loading = false;
  error = '';

  columns = [
    { status: 'PENDING' as const, label: 'Pending' },
    { status: 'IN_PROGRESS' as const, label: 'In Progress' },
    { status: 'COMPLETED' as const, label: 'Completed' },
    { status: 'CANCELLED' as const, label: 'Cancelled' }
  ];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.error = '';
    this.taskService.getAll(0, 100).subscribe({
      next: (page) => {
        this.tasks = page.content;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load tasks: ' + err.message;
        this.loading = false;
      }
    });
  }

  getTasksByStatus(status: string): Task[] {
    return this.tasks.filter(t => t.status === status);
  }

  startTask(id: string): void {
    this.taskService.start(id).subscribe({ next: () => this.loadTasks() });
  }

  completeTask(id: string): void {
    this.taskService.complete(id).subscribe({ next: () => this.loadTasks() });
  }

  cancelTask(id: string): void {
    this.taskService.cancel(id).subscribe({ next: () => this.loadTasks() });
  }
}
