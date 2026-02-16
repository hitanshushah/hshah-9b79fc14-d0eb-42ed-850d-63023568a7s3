import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="app-layout flex min-h-screen flex-col bg-surface-100 dark:bg-slate-900">
      <app-navbar />
      <main class="flex-1 overflow-auto">
        <router-outlet />
      </main>
    </div>
  `,
})
export class LayoutComponent {}
