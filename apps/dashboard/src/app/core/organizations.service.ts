import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './api.config';

export interface Organization {
  id: string;
  name: string;
  parentId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class OrganizationsService {
  constructor(private http: HttpClient) {}

  list(): Observable<Organization[]> {
    return this.http.get<Organization[]>(`${API_URL}/organizations`);
  }
}
