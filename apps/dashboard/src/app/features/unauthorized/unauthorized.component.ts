import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-slate-100 px-4">
      <h1 class="text-2xl font-bold text-red-600 mb-2">Forbidden</h1>
      <p class="text-slate-600 mb-6">You do not have permission to view this page.</p>
      <a
        routerLink="/"
        class="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Back to Dashboard
      </a>
    </div>
  `,
})
export class UnauthorizedComponent {}
