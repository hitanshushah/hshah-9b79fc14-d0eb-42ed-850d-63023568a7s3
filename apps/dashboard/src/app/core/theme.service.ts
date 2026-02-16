import { Injectable, signal, computed } from '@angular/core';

const STORAGE_KEY = 'dashboard-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkMode = signal<boolean>(this.getStored());

  isDark = computed(() => this.darkMode());

  constructor() {
    this.apply(this.darkMode());
  }

  private getStored(): boolean {
    if (typeof localStorage === 'undefined') return false;
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'dark') return true;
    if (v === 'light') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }

  private apply(dark: boolean): void {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }

  toggle(): void {
    const next = !this.darkMode();
    this.darkMode.set(next);
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    this.apply(next);
  }

  setDark(dark: boolean): void {
    if (this.darkMode() === dark) return;
    this.darkMode.set(dark);
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
    this.apply(dark);
  }
}
