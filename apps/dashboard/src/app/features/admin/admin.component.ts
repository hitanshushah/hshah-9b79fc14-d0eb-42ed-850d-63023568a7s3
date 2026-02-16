import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ControlPanelService,
  UserListItem,
  OrganizationItem,
} from './control-panel.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="admin-root">
      <main class="p-6">
        <div class="mb-4 flex items-center gap-3">
          <a
            routerLink="/"
            class="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            ← Back
          </a>
          <h1 class="text-xl font-semibold text-slate-800 dark:text-slate-100">Control Panel</h1>
        </div>
        <h2 class="mb-4 text-lg font-medium text-slate-700 dark:text-slate-300">View Users</h2>
        @if (error()) {
          <div class="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
            {{ error() }}
          </div>
        }
        @if (loading()) {
          <p class="text-slate-500 dark:text-slate-400">Loading users…</p>
        } @else {
          <div class="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800">
            <table class="min-w-full text-left text-sm">
              <thead class="border-b border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-700">
                <tr>
                  <th class="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">Username</th>
                  <th class="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">Email</th>
                  <th class="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">Organization</th>
                  <th class="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">Role</th>
                </tr>
              </thead>
              <tbody class="dark:bg-slate-800">
                @for (u of users(); track u.id) {
                  <tr class="border-b border-slate-100 hover:bg-slate-50/50 dark:border-slate-600 dark:hover:bg-slate-700/50">
                    <td class="px-4 py-3 text-slate-800 dark:text-slate-100">{{ u.username }}</td>
                    <td class="px-4 py-3 text-slate-600 dark:text-slate-300">{{ u.email }}</td>
                    <td class="px-4 py-3 text-slate-600 dark:text-slate-300">{{ orgName(u.organizationId) }}</td>
                    <td class="px-4 py-3 text-slate-600 dark:text-slate-300">{{ u.role?.name ?? '—' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (users().length === 0) {
            <p class="mt-4 text-slate-500 dark:text-slate-400">No users found.</p>
          }
        }
      </main>
    </div>
  `,
})
export class AdminComponent implements OnInit {
  private controlPanel = inject(ControlPanelService);

  users = signal<UserListItem[]>([]);
  organizations = signal<OrganizationItem[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  orgName(organizationId: string): string {
    const org = this.organizations().find((o) => o.id === organizationId);
    return org?.name ?? organizationId;
  }

  ngOnInit(): void {
    this.loading.set(true);
    this.error.set(null);
    this.controlPanel.listUsers().subscribe({
      next: (list) => {
        this.users.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || err?.message || 'Failed to load users');
        this.loading.set(false);
      },
    });
    this.controlPanel.listOrganizations().subscribe({
      next: (list) => this.organizations.set(list),
      error: () => {},
    });
  }
}
