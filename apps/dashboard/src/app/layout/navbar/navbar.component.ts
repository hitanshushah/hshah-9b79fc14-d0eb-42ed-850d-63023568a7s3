import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ThemeToggleComponent } from '../../core/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, ThemeToggleComponent],
  template: `
    <div class="relative">
    <header class="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <a
        routerLink="/"
        class="text-xl font-semibold text-slate-800 hover:text-slate-600 dark:text-slate-100 dark:hover:text-slate-300"
      >
        Task Management
      </a>

      <div class="hidden md:flex md:items-center md:gap-4">
        <app-theme-toggle />
        <span class="text-sm text-slate-500 dark:text-slate-100">{{ auth.currentUser()?.email }}</span>
        <button
          type="button"
          (click)="auth.logout()"
          class="rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-black dark:hover:bg-slate-500"
        >
          Logout
        </button>
      </div>

      <div class="flex items-center gap-2 md:hidden">
        <app-theme-toggle />
        <button
          type="button"
          (click)="menuOpen.set(!menuOpen())"
          class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          [attr.aria-expanded]="menuOpen()"
          aria-label="Open menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6">
            <line x1="4" x2="20" y1="12" y2="12"/>
            <line x1="4" x2="20" y1="6" y2="6"/>
            <line x1="4" x2="20" y1="18" y2="18"/>
          </svg>
        </button>
      </div>
    </header>

    @if (menuOpen()) {
      <div
        class="fixed inset-0 z-40 md:hidden"
        (click)="menuOpen.set(false)"
        aria-hidden="true"
      ></div>
    }

    @if (menuOpen()) {
      <div
        class="absolute right-4 top-full z-50 mt-1 min-w-[200px] rounded-lg border border-slate-200 bg-white py-2 shadow-lg dark:border-slate-600 dark:bg-slate-800 md:hidden"
      >
        <div class="border-b border-slate-100 px-4 py-3 dark:border-slate-600">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">Signed in as</p>
          <p class="mt-0.5 truncate text-sm text-slate-800 dark:text-slate-200">{{ auth.currentUser()?.email }}</p>
        </div>
        <div class="px-2 py-1">
          <button
            type="button"
            (click)="auth.logout(); menuOpen.set(false)"
            class="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
      </div>
    }
    </div>
  `,
})
export class NavbarComponent {
  protected auth = inject(AuthService);
  menuOpen = signal(false);
}
