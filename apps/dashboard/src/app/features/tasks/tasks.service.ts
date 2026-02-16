import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../core/api.config';

export interface Status {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  statusId: string;
  status?: Status;
  orderIndex: number;
  category?: string | null;
  ownerId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  owner?: { id: string; email: string; username?: string };
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  statusId?: string;
  category?: string;
  organizationId?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  statusId?: string;
  orderIndex?: number;
  category?: string;
}

@Injectable({ providedIn: 'root' })
export class TasksService {
  constructor(private http: HttpClient) {}

  list(): Observable<Task[]> {
    return this.http.get<Task[]>(`${API_URL}/tasks`);
  }

  get(id: string): Observable<Task> {
    return this.http.get<Task>(`${API_URL}/tasks/${id}`);
  }

  create(dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${API_URL}/tasks`, dto);
  }

  update(id: string, dto: UpdateTaskDto): Observable<Task> {
    return this.http.put<Task>(`${API_URL}/tasks/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/tasks/${id}`);
  }

  listStatuses(): Observable<Status[]> {
    return this.http.get<Status[]>(`${API_URL}/statuses`);
  }

  listCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_URL}/categories`);
  }

  createCategory(name: string): Observable<Category> {
    return this.http.post<Category>(`${API_URL}/categories`, { name });
  }
}

export interface Category {
  id: string;
  userId: string | null;
  categoryName: string;
  createdAt?: string;
}
