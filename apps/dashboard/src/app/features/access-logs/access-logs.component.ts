import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuditService, AuditLogEntry } from './audit.service';
import { AuthService } from '../../core/auth.service';
import { UsersService } from '../../core/users.service';
import { TasksService, Task } from '../tasks/tasks.service';

@Component({
  selector: 'app-access-logs',
  standalone: true,
  imports: [CommonModule, JsonPipe, RouterLink],
  templateUrl: './access-logs.component.html',
  styleUrl: './access-logs.component.scss',
})
export class AccessLogsComponent implements OnInit {
  private audit = inject(AuditService);
  private tasksService = inject(TasksService);
  private usersService = inject(UsersService);
  protected auth = inject(AuthService);

  logs = signal<AuditLogEntry[]>([]);
  tasks = signal<Task[]>([]);
  users = signal<{ id: string; username: string; email: string }[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  filterAction = signal<string>('');
  filterResource = signal<string>('');
  filterUser = signal<string>('');
  filterTask = signal<string>('');

  filteredLogs = computed(() => {
    let list = this.logs();
    const action = this.filterAction().toLowerCase();
    const resource = this.filterResource().toLowerCase();
    const userId = this.filterUser();
    const taskId = this.filterTask();
    if (action) {
      list = list.filter((e) => e.action.toLowerCase().includes(action));
    }
    if (resource) {
      list = list.filter(
        (e) =>
          e.resourceType.toLowerCase().includes(resource) ||
          (e.resourceId ?? '').toLowerCase().includes(resource)
      );
    }
    if (userId) {
      list = list.filter((e) => e.userId === userId);
    }
    if (taskId) {
      list = list.filter(
        (e) => e.resourceType === 'task' && e.resourceId === taskId
      );
    }
    return list;
  });

  ngOnInit(): void {
    this.tasksService.list().subscribe({
      next: (list) => this.tasks.set(list),
      error: () => this.tasks.set([]),
    });
    this.usersService.list().subscribe({
      next: (list) => this.users.set(list.map((u) => ({ id: u.id, username: u.username, email: u.email }))),
      error: () => this.users.set([]),
    });
    this.audit.getLogs().subscribe({
      next: (list) => {
        this.logs.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to load access logs');
        this.loading.set(false);
      },
    });
  }

  uniqueActions(): string[] {
    const set = new Set(this.logs().map((e) => e.action));
    return Array.from(set).sort();
  }

  uniqueResourceTypes(): string[] {
    const set = new Set(this.logs().map((e) => e.resourceType));
    return Array.from(set).sort();
  }

  /** Unique users for filter dropdown: id + label from users table (username) */
  uniqueUsers(): { id: string; label: string }[] {
    const userList = this.users();
    const idToLabel = new Map<string, string>(
      userList.map((u) => [u.id, u.username || u.email || u.id])
    );
    const seen = new Set<string>();
    for (const e of this.logs()) {
      seen.add(e.userId);
    }
    return Array.from(seen)
      .map((id) => ({ id, label: idToLabel.get(id) ?? id }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  actorLabel(entry: AuditLogEntry): string {
    const id = entry.userId;
    const userList = this.users();
    const u = userList.find((x) => x.id === id);
    if (u) return u.username || u.email || id;
    const fromEntry = entry.user;
    if (fromEntry) return (fromEntry as { username?: string }).username ?? fromEntry.email ?? id;
    return id.slice(0, 8) + '…';
  }

  /** User's initial (first letter) for timeline avatar circle. */
  actorInitial(entry: AuditLogEntry): string {
    const label = this.actorLabel(entry).trim();
    return label.length ? label.charAt(0).toUpperCase() : '?';
  }

  /** Display label for resource: task title when resourceType is task, else resourceId. */
  resourceDisplayLabel(entry: AuditLogEntry): string {
    if (!entry.resourceId) return '';
    if (entry.resourceType?.toLowerCase() === 'task') {
      const task = this.tasks().find((t) => t.id === entry.resourceId);
      return task?.title ?? entry.resourceId;
    }
    return entry.resourceId;
  }

  actionLabel(action: string): string {
    return action.replace(/\./g, ' · ');
  }

  formatTime(ts: string): string {
    const d = new Date(ts);
    const now = new Date();
    const sameDay =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    if (sameDay) {
      return d.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    }
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  setFilterAction(value: string): void {
    this.filterAction.set(value);
  }

  setFilterResource(value: string): void {
    this.filterResource.set(value);
  }

  setFilterUser(value: string): void {
    this.filterUser.set(value);
  }

  setFilterTask(value: string): void {
    this.filterTask.set(value);
  }
}
