import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sprint } from '../models/sprint.model';

@Injectable({
  providedIn: 'root'
})
export class SprintService {
  private readonly baseUrl = '/api/sprints';

  constructor(private http: HttpClient) {}

  getByProject(projectId: string): Observable<Sprint[]> {
    return this.http.get<Sprint[]>(`${this.baseUrl}/project/${projectId}`);
  }

  getById(id: string): Observable<Sprint> {
    return this.http.get<Sprint>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<Sprint>): Observable<Sprint> {
    return this.http.post<Sprint>(this.baseUrl, data);
  }

  update(id: string, data: Partial<Sprint>): Observable<Sprint> {
    return this.http.put<Sprint>(`${this.baseUrl}/${id}`, data);
  }

  activate(id: string): Observable<Sprint> {
    return this.http.post<Sprint>(`${this.baseUrl}/${id}/activate`, {});
  }

  complete(id: string): Observable<Sprint> {
    return this.http.post<Sprint>(`${this.baseUrl}/${id}/complete`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
