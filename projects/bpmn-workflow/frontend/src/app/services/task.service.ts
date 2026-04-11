import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskRequest } from '../models/task.model';
import { Page } from './process.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly apiUrl = '/api/tasks';

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 20): Observable<Page<Task>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Task>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  getByProcess(processInstanceId: string): Observable<Page<Task>> {
    return this.http.get<Page<Task>>(`${this.apiUrl}/process/${processInstanceId}`);
  }

  create(request: TaskRequest): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, request);
  }

  assign(id: string, assignee: string): Observable<Task> {
    const params = new HttpParams().set('assignee', assignee);
    return this.http.post<Task>(`${this.apiUrl}/${id}/assign`, {}, { params });
  }

  start(id: string): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/${id}/start`, {});
  }

  complete(id: string): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/${id}/complete`, {});
  }

  cancel(id: string): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/${id}/cancel`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
