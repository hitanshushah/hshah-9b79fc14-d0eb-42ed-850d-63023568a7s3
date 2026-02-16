import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { AuthService } from '../../core/auth.service';
import { OrganizationsService } from '../../core/organizations.service';
import { TasksService, Task, Status } from '../tasks/tasks.service';

type StatusBucket = 'complete' | 'in_progress' | 'blocked' | 'todo';

export interface OrgTaskStats {
  orgId: string;
  orgName: string;
  total: number;
  complete: number;
  inProgress: number;
  blocked: number;
  todo: number;
  percentComplete: number;
}

@Component({
  selector: 'app-task-graph',
  standalone: true,
  imports: [CommonModule, RouterLink, ChartModule],
  templateUrl: './task-graph.component.html',
  styleUrl: './task-graph.component.scss',
})
export class TaskGraphComponent implements OnInit {
  private tasksService = inject(TasksService);
  private organizationsService = inject(OrganizationsService);
  protected auth = inject(AuthService);

  tasks = signal<Task[]>([]);
  statuses = signal<Status[]>([]);
  organizations = signal<Array<{ id: string; name: string }>>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  /** Counts by bucket: complete (done), in_progress, blocked, todo */
  counts = computed(() => {
    const tasks = this.tasks();
    const statuses = this.statuses();
    const statusByName = new Map(statuses.map((s) => [s.name, s.id]));
    const bucket: Record<StatusBucket, number> = {
      complete: 0,
      in_progress: 0,
      blocked: 0,
      todo: 0,
    };
    const doneId = statusByName.get('done');
    const inProgressId = statusByName.get('in_progress');
    const blockedId = statusByName.get('blocked');
    const todoId = statusByName.get('todo');
    for (const t of tasks) {
      if (t.statusId === doneId) bucket.complete++;
      else if (t.statusId === inProgressId) bucket.in_progress++;
      else if (t.statusId === blockedId) bucket.blocked++;
      else if (t.statusId === todoId) bucket.todo++;
      else bucket.todo++; // other statuses count as todo
    }
    return bucket;
  });

  total = computed(() => this.tasks().length);
  completeCount = computed(() => this.counts().complete);
  inProgressCount = computed(() => this.counts().in_progress);
  blockedCount = computed(() => this.counts().blocked);
  todoCount = computed(() => this.counts().todo);
  percentComplete = computed(() => {
    const t = this.total();
    if (t === 0) return 0;
    return Math.round((this.counts().complete / t) * 100);
  });

  chartData = computed(() => {
    const c = this.counts();
    return {
      labels: ['Complete', 'In Progress', 'Blocked', 'To Do'],
      datasets: [
        {
          data: [c.complete, c.in_progress, c.blocked, c.todo],
          backgroundColor: ['#22c55e', '#3b82f6', '#ef4444', '#94a3b8'],
          hoverBackgroundColor: ['#16a34a', '#2563eb', '#dc2626', '#64748b'],
        },
      ],
    };
  });

  chartOptions = {
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 16,
        },
      },
    },
  };

  /** Task counts per organization (only when tasks span more than one org) */
  orgStats = computed((): OrgTaskStats[] => {
    const tasks = this.tasks();
    const statuses = this.statuses();
    const orgs = this.organizations();
    const statusByName = new Map(statuses.map((s) => [s.name, s.id]));
    const doneId = statusByName.get('done');
    const inProgressId = statusByName.get('in_progress');
    const blockedId = statusByName.get('blocked');
    const todoId = statusByName.get('todo');
    const nameById = new Map(orgs.map((o) => [o.id, o.name]));

    const byOrg = new Map<
      string,
      { complete: number; inProgress: number; blocked: number; todo: number }
    >();
    for (const t of tasks) {
      const orgId = t.organizationId ?? '';
      if (!byOrg.has(orgId)) {
        byOrg.set(orgId, { complete: 0, inProgress: 0, blocked: 0, todo: 0 });
      }
      const b = byOrg.get(orgId)!;
      if (t.statusId === doneId) b.complete++;
      else if (t.statusId === inProgressId) b.inProgress++;
      else if (t.statusId === blockedId) b.blocked++;
      else if (t.statusId === todoId) b.todo++;
      else b.todo++;
    }

    return Array.from(byOrg.entries())
      .filter(([orgId, b]) => orgId && (b.complete + b.inProgress + b.blocked + b.todo) > 0)
      .map(([orgId, b]) => {
        const total = b.complete + b.inProgress + b.blocked + b.todo;
        return {
          orgId,
          orgName: nameById.get(orgId) ?? orgId,
          total,
          complete: b.complete,
          inProgress: b.inProgress,
          blocked: b.blocked,
          todo: b.todo,
          percentComplete: total === 0 ? 0 : Math.round((b.complete / total) * 100),
        };
      })
      .sort((a, b) => a.orgName.localeCompare(b.orgName));
  });

  /** Show per-organization section when more than one org has tasks */
  showPerOrganization = computed(() => this.orgStats().length > 1);

  ngOnInit(): void {
    this.organizationsService.list().subscribe({
      next: (list) => this.organizations.set(list),
      error: () => this.organizations.set([]),
    });
    this.tasksService.listStatuses().subscribe({
      next: (list) => this.statuses.set(list),
      error: () => this.statuses.set([]),
    });
    this.tasksService.list().subscribe({
      next: (list) => {
        this.tasks.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to load tasks');
        this.loading.set(false);
      },
    });
  }
}
