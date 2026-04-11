import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { Task, TaskStatus } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { WebSocketService } from '../../services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-kanban-board',
  template: `
    <div class="kanban-board" *ngIf="projectId">
      <h2>Kanban Board</h2>
      <div class="kanban-columns" cdkDropListGroup>
        <div *ngFor="let column of columns" class="kanban-column">
          <div class="column-header">
            <span>{{ column.label }}</span>
            <span class="task-count">{{ getTasksByStatus(column.status).length }}</span>
          </div>
          <div
            class="column-tasks"
            cdkDropList
            [cdkDropListData]="getTasksByStatus(column.status)"
            [id]="column.status"
            (cdkDropListDropped)="onTaskDrop($event, column.status)">
            <div
              *ngFor="let task of getTasksByStatus(column.status)"
              class="task-card"
              cdkDrag>
              <div class="task-title">{{ task.title }}</div>
              <div class="task-meta">
                <span class="priority priority-{{ task.priority | lowercase }}">{{ task.priority }}</span>
                <span class="story-points" *ngIf="task.storyPoints">{{ task.storyPoints }}pt</span>
              </div>
              <div class="task-assignee" *ngIf="task.assignee">{{ task.assignee }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class KanbanBoardComponent implements OnInit, OnDestroy {
  @Input() projectId: string | null = null;

  tasks: Task[] = [];
  private wsSubscription: Subscription | null = null;

  columns = [
    { status: TaskStatus.BACKLOG, label: 'Backlog' },
    { status: TaskStatus.TODO, label: 'To Do' },
    { status: TaskStatus.IN_PROGRESS, label: 'In Progress' },
    { status: TaskStatus.IN_REVIEW, label: 'In Review' },
    { status: TaskStatus.DONE, label: 'Done' }
  ];

  constructor(
    private taskService: TaskService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    if (this.projectId) {
      this.loadTasks();
      this.wsSubscription = this.webSocketService.connect(this.projectId).subscribe({
        next: (update) => this.handleWebSocketUpdate(update),
        error: (err) => console.error('WebSocket error', err)
      });
    }
  }

  ngOnDestroy(): void {
    this.webSocketService.disconnect();
    this.wsSubscription?.unsubscribe();
  }

  loadTasks(): void {
    if (!this.projectId) return;
    this.taskService.getByProject(this.projectId).subscribe({
      next: (tasks) => this.tasks = tasks,
      error: (err) => console.error('Failed to load tasks', err)
    });
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasks.filter(t => t.status === status);
  }

  onTaskDrop(event: CdkDragDrop<Task[]>, targetStatus: TaskStatus): void {
    if (event.previousContainer !== event.container) {
      const task = event.previousContainer.data[event.previousIndex];
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.taskService.updateStatus(task.id, targetStatus).subscribe({
        error: (err) => console.error('Failed to update task status', err)
      });
    }
  }

  private handleWebSocketUpdate(update: any): void {
    const taskIndex = this.tasks.findIndex(t => t.id === update.taskId);
    if (taskIndex !== -1) {
      this.tasks[taskIndex] = { ...this.tasks[taskIndex], status: update.status };
    }
  }
}
