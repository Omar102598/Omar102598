import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppComponent } from './app.component';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { KanbanBoardComponent } from './components/kanban-board/kanban-board.component';
import { SprintManagerComponent } from './components/sprint-manager/sprint-manager.component';

@NgModule({
  declarations: [
    AppComponent,
    ProjectListComponent,
    KanbanBoardComponent,
    SprintManagerComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
