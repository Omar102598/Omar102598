import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Project } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-project-list',
  template: `
    <div class="project-list">
      <div class="project-list-header">
        <h2>Projects</h2>
        <button (click)="openNewProjectForm()">+ New Project</button>
      </div>

      <div *ngIf="showForm" class="project-form">
        <input [(ngModel)]="newProject.name" placeholder="Project Name" />
        <input [(ngModel)]="newProject.description" placeholder="Description" />
        <input [(ngModel)]="newProject.owner" placeholder="Owner" />
        <button (click)="createProject()">Create</button>
        <button (click)="showForm = false">Cancel</button>
      </div>

      <div class="project-items">
        <div
          *ngFor="let project of projects"
          class="project-item"
          [class.selected]="selectedProject?.id === project.id"
          (click)="selectProject(project)">
          <div class="project-name">{{ project.name }}</div>
          <div class="project-meta">
            <span class="project-status status-{{ project.status | lowercase }}">{{ project.status }}</span>
            <span class="project-owner">{{ project.owner }}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProjectListComponent implements OnInit {
  @Output() projectSelected = new EventEmitter<Project>();

  projects: Project[] = [];
  selectedProject: Project | null = null;
  showForm = false;
  newProject: Partial<Project> = {};

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.getAll().subscribe({
      next: (projects) => this.projects = projects,
      error: (err) => console.error('Failed to load projects', err)
    });
  }

  selectProject(project: Project): void {
    this.selectedProject = project;
    this.projectSelected.emit(project);
  }

  openNewProjectForm(): void {
    this.newProject = {};
    this.showForm = true;
  }

  createProject(): void {
    if (!this.newProject.name) return;
    this.projectService.create(this.newProject).subscribe({
      next: () => {
        this.showForm = false;
        this.newProject = {};
        this.loadProjects();
      },
      error: (err) => console.error('Failed to create project', err)
    });
  }
}
