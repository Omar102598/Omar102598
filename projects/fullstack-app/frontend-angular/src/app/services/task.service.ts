import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskStatus } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly baseUrl = '/api/tasks';

  constructor(private http: HttpClient) {}

  getByProject(projectId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/project/${projectId}`);
  }

  getById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, data);
  }

  update(id: string, data: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/${id}`, data);
  }

  updateStatus(id: string, status: TaskStatus): Observable<Task> {
    return this.http.patch<Task>(`${this.baseUrl}/${id}/status`, null, {
      params: { status }
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
