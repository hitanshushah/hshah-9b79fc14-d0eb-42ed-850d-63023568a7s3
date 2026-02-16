import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../core/api.config';

export interface UserListItem {
  id: string;
  username: string;
  email: string;
  organizationId: string;
  roleId: string;
  role: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationItem {
  id: string;
  name: string;
  parentId: string | null;
}

@Injectable({ providedIn: 'root' })
export class ControlPanelService {
  constructor(private http: HttpClient) {}

  listUsers(organizationId?: string): Observable<UserListItem[]> {
    const url = `${API_URL}/users`;
    if (organizationId) {
      return this.http.get<UserListItem[]>(url, {
        params: { organizationId },
      });
    }
    return this.http.get<UserListItem[]>(url);
  }

  listOrganizations(): Observable<OrganizationItem[]> {
    return this.http.get<OrganizationItem[]>(`${API_URL}/organizations`);
  }
}
