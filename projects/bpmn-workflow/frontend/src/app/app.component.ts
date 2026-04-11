import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <nav class="navbar">
        <div class="brand">
          <span class="brand-icon">⚙️</span>
          <span class="brand-name">BPMN Workflow Engine</span>
        </div>
        <ul class="nav-links">
          <li><a routerLink="/processes" routerLinkActive="active">Processes</a></li>
          <li><a routerLink="/tasks" routerLinkActive="active">Task Board</a></li>
        </ul>
      </nav>
      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .app-shell { display: flex; flex-direction: column; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .navbar { background: #1a1a2e; color: white; display: flex; align-items: center; justify-content: space-between; padding: 0 1.5rem; height: 56px; }
    .brand { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 1.1rem; }
    .nav-links { list-style: none; display: flex; gap: 1rem; }
    .nav-links a { color: #ccc; text-decoration: none; padding: 0.5rem 0.75rem; border-radius: 4px; transition: background 0.2s; }
    .nav-links a:hover, .nav-links a.active { background: rgba(255,255,255,0.15); color: white; }
    .content { flex: 1; background: #f0f2f5; padding: 1.5rem; }
    .btn-primary { background: #0d6efd; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
    .btn-primary:hover { background: #0b5ed7; }
  `]
})
export class AppComponent {
  title = 'bpmn-workflow-frontend';
}
