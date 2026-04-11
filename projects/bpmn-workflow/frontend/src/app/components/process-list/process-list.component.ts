import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Process } from '../../models/process.model';
import { ProcessService } from '../../services/process.service';

@Component({
  selector: 'app-process-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="process-list">
      <div class="header">
        <h2>Process Instances</h2>
        <button class="btn-primary" (click)="loadProcesses()">Refresh</button>
      </div>

      <div class="loading" *ngIf="loading">Loading processes...</div>
      <div class="error" *ngIf="error">{{ error }}</div>

      <table *ngIf="!loading && processes.length > 0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Definition Key</th>
            <th>Business Key</th>
            <th>Status</th>
            <th>Initiated By</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let process of processes">
            <td>{{ process.id | slice:0:8 }}...</td>
            <td>{{ process.processDefinitionKey }}</td>
            <td>{{ process.businessKey || '-' }}</td>
            <td><span [class]="'badge badge-' + process.status.toLowerCase()">{{ process.status }}</span></td>
            <td>{{ process.initiatedBy }}</td>
            <td>{{ process.createdAt | date:'short' }}</td>
            <td class="actions">
              <button *ngIf="process.status === 'ACTIVE'" (click)="suspend(process.id)">Suspend</button>
              <button *ngIf="process.status === 'SUSPENDED'" (click)="resume(process.id)">Resume</button>
              <button *ngIf="process.status === 'ACTIVE'" (click)="complete(process.id)">Complete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="empty" *ngIf="!loading && processes.length === 0">
        No process instances found.
      </div>
    </div>
  `,
  styles: [`
    .process-list { padding: 1rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e0e0e0; }
    th { background: #f5f5f5; font-weight: 600; }
    .badge { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }
    .badge-active { background: #d4edda; color: #155724; }
    .badge-suspended { background: #fff3cd; color: #856404; }
    .badge-completed { background: #cce5ff; color: #004085; }
    .badge-terminated { background: #f8d7da; color: #721c24; }
    .actions button { margin-right: 0.25rem; padding: 0.25rem 0.5rem; cursor: pointer; }
    .error { color: #dc3545; padding: 1rem; }
    .loading, .empty { padding: 2rem; text-align: center; color: #6c757d; }
  `]
})
export class ProcessListComponent implements OnInit {
  processes: Process[] = [];
  loading = false;
  error = '';

  constructor(private processService: ProcessService) {}

  ngOnInit(): void {
    this.loadProcesses();
  }

  loadProcesses(): void {
    this.loading = true;
    this.error = '';
    this.processService.getAll().subscribe({
      next: (page) => {
        this.processes = page.content;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load processes: ' + err.message;
        this.loading = false;
      }
    });
  }

  suspend(id: string): void {
    this.processService.suspend(id).subscribe({ next: () => this.loadProcesses() });
  }

  resume(id: string): void {
    this.processService.resume(id).subscribe({ next: () => this.loadProcesses() });
  }

  complete(id: string): void {
    this.processService.complete(id).subscribe({ next: () => this.loadProcesses() });
  }
}
