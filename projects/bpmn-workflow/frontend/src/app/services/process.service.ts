import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Process, ProcessRequest } from '../models/process.model';

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProcessService {
  private readonly apiUrl = '/api/processes';

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 20): Observable<Page<Process>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Process>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Process> {
    return this.http.get<Process>(`${this.apiUrl}/${id}`);
  }

  start(request: ProcessRequest): Observable<Process> {
    return this.http.post<Process>(this.apiUrl, request);
  }

  suspend(id: string): Observable<Process> {
    return this.http.post<Process>(`${this.apiUrl}/${id}/suspend`, {});
  }

  resume(id: string): Observable<Process> {
    return this.http.post<Process>(`${this.apiUrl}/${id}/resume`, {});
  }

  complete(id: string): Observable<Process> {
    return this.http.post<Process>(`${this.apiUrl}/${id}/complete`, {});
  }

  terminate(id: string): Observable<Process> {
    return this.http.post<Process>(`${this.apiUrl}/${id}/terminate`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
