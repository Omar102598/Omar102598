import { Component, Input, OnInit } from '@angular/core';
import { Sprint } from '../../models/sprint.model';
import { SprintService } from '../../services/sprint.service';

@Component({
  selector: 'app-sprint-manager',
  template: `
    <div class="sprint-manager" *ngIf="projectId">
      <div class="sprint-header">
        <h2>Sprints</h2>
        <button (click)="openNewSprintForm()">+ New Sprint</button>
      </div>

      <div *ngIf="showForm" class="sprint-form">
        <input [(ngModel)]="newSprint.name" placeholder="Sprint Name" />
        <input [(ngModel)]="newSprint.goal" placeholder="Sprint Goal" />
        <input [(ngModel)]="newSprint.velocity" type="number" placeholder="Velocity" />
        <button (click)="createSprint()">Create</button>
        <button (click)="showForm = false">Cancel</button>
      </div>

      <div class="sprint-list">
        <div *ngFor="let sprint of sprints" class="sprint-item">
          <div class="sprint-info">
            <span class="sprint-name">{{ sprint.name }}</span>
            <span class="sprint-status status-{{ sprint.status | lowercase }}">{{ sprint.status }}</span>
            <span class="sprint-velocity" *ngIf="sprint.velocity">{{ sprint.velocity }} pts</span>
          </div>
          <div class="sprint-goal" *ngIf="sprint.goal">{{ sprint.goal }}</div>
          <div class="sprint-actions">
            <button
              *ngIf="sprint.status === 'PLANNED'"
              (click)="activateSprint(sprint.id)">
              Activate
            </button>
            <button
              *ngIf="sprint.status === 'ACTIVE'"
              (click)="completeSprint(sprint.id)">
              Complete
            </button>
            <button (click)="deleteSprint(sprint.id)" class="danger">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SprintManagerComponent implements OnInit {
  @Input() projectId: string | null = null;

  sprints: Sprint[] = [];
  showForm = false;
  newSprint: Partial<Sprint> = {};

  constructor(private sprintService: SprintService) {}

  ngOnInit(): void {
    this.loadSprints();
  }

  loadSprints(): void {
    if (!this.projectId) return;
    this.sprintService.getByProject(this.projectId).subscribe({
      next: (sprints) => this.sprints = sprints,
      error: (err) => console.error('Failed to load sprints', err)
    });
  }

  openNewSprintForm(): void {
    this.newSprint = { projectId: this.projectId || undefined };
    this.showForm = true;
  }

  createSprint(): void {
    if (!this.newSprint.name || !this.projectId) return;
    this.sprintService.create({ ...this.newSprint, projectId: this.projectId }).subscribe({
      next: () => {
        this.showForm = false;
        this.newSprint = {};
        this.loadSprints();
      },
      error: (err) => console.error('Failed to create sprint', err)
    });
  }

  activateSprint(id: string): void {
    this.sprintService.activate(id).subscribe({
      next: () => this.loadSprints(),
      error: (err) => console.error('Failed to activate sprint', err)
    });
  }

  completeSprint(id: string): void {
    this.sprintService.complete(id).subscribe({
      next: () => this.loadSprints(),
      error: (err) => console.error('Failed to complete sprint', err)
    });
  }

  deleteSprint(id: string): void {
    if (!confirm('Delete this sprint?')) return;
    this.sprintService.delete(id).subscribe({
      next: () => this.loadSprints(),
      error: (err) => console.error('Failed to delete sprint', err)
    });
  }
}
