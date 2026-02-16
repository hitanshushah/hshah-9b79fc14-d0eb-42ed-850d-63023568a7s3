import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../core/api.config';

export interface AuditLogUser {
  id: string;
  email: string;
  username?: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  user?: AuditLogUser;
  action: string;
  resourceType: string;
  resourceId: string | null;
  timestamp: string;
  metadata: Record<string, unknown> | null;
}

@Injectable({ providedIn: 'root' })
export class AuditService {
  constructor(private http: HttpClient) {}

  getLogs(): Observable<AuditLogEntry[]> {
    return this.http.get<AuditLogEntry[]>(`${API_URL}/audit-log`);
  }
}
