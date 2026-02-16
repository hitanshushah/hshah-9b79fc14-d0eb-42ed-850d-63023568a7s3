import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_URL } from './api.config';

export interface LoginResponse {
  access_token: string;
  user: { id: string; email: string; role: string; organizationId: string | null };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token = signal<string | null>(this.getStoredToken());
  private user = signal<LoginResponse['user'] | null>(this.getStoredUser());
  loading = signal(false);
  error = signal<string | null>(null);

  isLoggedIn = computed(() => !!this.token());
  currentUser = computed(() => this.user());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  private getStoredToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  }

  private getStoredUser(): LoginResponse['user'] | null {
    try {
      const u = typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null;
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    this.loading.set(true);
    this.error.set(null);
    return this.http
      .post<LoginResponse>(`${API_URL}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          this.token.set(res.access_token);
          this.user.set(res.user);
          localStorage.setItem('token', res.access_token);
          localStorage.setItem('user', JSON.stringify(res.user));
          this.loading.set(false);
        }),
      );
  }

  logout(): void {
    this.token.set(null);
    this.user.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.token();
  }
}
