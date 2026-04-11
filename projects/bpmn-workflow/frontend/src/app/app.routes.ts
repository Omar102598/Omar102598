import { Routes } from '@angular/router';
import { ProcessListComponent } from './components/process-list/process-list.component';
import { TaskBoardComponent } from './components/task-board/task-board.component';

export const routes: Routes = [
  { path: '', redirectTo: 'processes', pathMatch: 'full' },
  { path: 'processes', component: ProcessListComponent },
  { path: 'tasks', component: TaskBoardComponent }
];
