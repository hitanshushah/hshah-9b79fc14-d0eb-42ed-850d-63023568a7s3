import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './api.config';

export interface UserListItem {
  id: string;
  username: string;
  email: string;
  organizationId: string;
  roleId: string;
  role?: { id: string; name: string } | null;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private http: HttpClient) {}

  list(): Observable<UserListItem[]> {
    return this.http.get<UserListItem[]>(`${API_URL}/users`);
  }
}
