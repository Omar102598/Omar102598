import { Component } from '@angular/core';
import { Project } from './models/project.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'Project Management Platform';
  selectedProject: Project | null = null;

  onProjectSelected(project: Project): void {
    this.selectedProject = project;
  }
}
