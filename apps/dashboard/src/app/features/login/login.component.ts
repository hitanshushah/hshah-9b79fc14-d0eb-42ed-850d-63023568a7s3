import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ThemeToggleComponent } from '../../core/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ThemeToggleComponent],
  template: `
    <div class="login-root relative min-h-screen flex items-center justify-center px-4 bg-slate-100 dark:bg-slate-900">
      <div class="absolute right-4 top-4">
        <app-theme-toggle />
      </div>
      <div class="flex flex-col items-center gap-8 w-full max-w-sm">
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white text-center tracking-tight">
          Task Management System
        </h1>
        <div class="w-full rounded-xl bg-white p-8 shadow-xl dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <h2 class="text-xl font-semibold text-slate-800 mb-6 dark:text-white">Sign in</h2>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
              placeholder="admin@example.com"
            />
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <p class="mt-1 text-sm text-red-600 dark:text-red-400">Valid email required</p>
            }
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
              placeholder="••••••••"
            />
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <p class="mt-1 text-sm text-red-600 dark:text-red-400">Password required</p>
            }
          </div>
          @if (auth.error()) {
            <p class="text-sm text-red-600 dark:text-red-400">{{ auth.error() }}</p>
          }
          <button
            type="submit"
            [disabled]="form.invalid || auth.loading()"
            class="w-full rounded-lg bg-black py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-blue-700"
          >
            {{ auth.loading() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit() {
    if (this.form.invalid) return;
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.auth.loading.set(false);
        this.auth.error.set(err?.error?.message || 'Login failed');
      },
    });
  }
}
