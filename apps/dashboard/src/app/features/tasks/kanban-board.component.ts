import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  HostListener,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { take } from 'rxjs';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../core/auth.service';
import { OrganizationsService, Organization } from '../../core/organizations.service';
import { ThemeToggleComponent } from '../../core/theme-toggle/theme-toggle.component';
import { Task, Status, Category } from './tasks.service';
import * as TasksActions from './state/tasks.actions';
import {
  selectTasks,
  selectStatuses,
  selectCategories,
  selectTasksLoading,
  selectTasksError,
  selectStatusListIds,
} from './state/tasks.selectors';
import {
  TaskStatus,
  TASK_STATUS_ORDER,
  TASK_STATUS_COLORS,
  TASK_STATUS_HEADER_CLASSES,
  TASK_STATUS_PLACEHOLDER_CLASSES,
  TASK_STATUS_DEFAULT_HEADER_CLASS,
  TASK_STATUS_DEFAULT_PLACEHOLDER_CLASS,
  normalizeTaskStatus,
} from './task-status';

const OTHER_CATEGORY_VALUE = '__other__';

type SortOption = 'title' | 'createdAt' | 'updatedAt';

const SUBTLE_PALETTE = [
  '#94a88a',
  '#8b9cb3',
  '#b8a88a',
  '#9ca3af',
  '#a89bb3',
];

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    DragDropModule,
    Button,
    Dialog,
    InputTextModule,
    ThemeToggleComponent,
  ],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.scss',
})
export class KanbanBoardComponent implements OnInit {
  protected auth = inject(AuthService);
  private store = inject(Store);
  private actions$ = inject(Actions);
  private router = inject(Router);
  private organizationsService = inject(OrganizationsService);

  statuses = toSignal(this.store.select(selectStatuses), { initialValue: [] as Status[] });
  tasks = toSignal(this.store.select(selectTasks), { initialValue: [] as Task[] });
  categories = toSignal(this.store.select(selectCategories), { initialValue: [] as Category[] });
  loading = toSignal(this.store.select(selectTasksLoading), { initialValue: false });
  error = toSignal(this.store.select(selectTasksError), { initialValue: null as string | null });
  statusListIds = toSignal(this.store.select(selectStatusListIds), { initialValue: [] as string[] });

  statusesOrdered = computed(() => {
    const list = this.statuses();
    const order = TASK_STATUS_ORDER;
    const index = (name: string) => {
      const key = normalizeTaskStatus(name);
      if (!key) return order.length;
      const i = order.indexOf(key);
      return i === -1 ? order.length : i;
    };
    return [...list].sort((a, b) => index(a.name) - index(b.name));
  });

  statusListIdsOrdered = computed(() => this.statusesOrdered().map((s) => s.id));

  filterCategory = signal<string>('');
  filterSearch = signal<string>('');
  filterCreatedBy = signal<string>('');
  sortBy = signal<SortOption>('title');

  taskOwners = computed(() => {
    const tasks = this.tasks();
    const map = new Map<string, string>();
    for (const t of tasks) {
      if (t.ownerId && !map.has(t.ownerId)) {
        const label = this.creatorLabel(t);
        map.set(t.ownerId, label);
      }
    }
    return Array.from(map.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  });

  tasksByStatus = computed(() => {
    const tasks = this.tasks();
    const statuses = this.statuses();
    const category = this.filterCategory().trim();
    const search = this.filterSearch().trim().toLowerCase();
    const createdBy = this.filterCreatedBy();
    const sort = this.sortBy();

    let list = tasks;
    if (category) {
      list = list.filter((t) => (t.category ?? '') === category);
    }
    if (search) {
      list = list.filter(
        (t) =>
          (t.title ?? '').toLowerCase().includes(search) ||
          (t.description ?? '').toLowerCase().includes(search)
      );
    }
    if (createdBy) {
      list = list.filter((t) => t.ownerId === createdBy);
    }

    const compare = (a: Task, b: Task): number => {
      if (sort === 'title') return (a.title ?? '').localeCompare(b.title ?? '');
      if (sort === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === 'updatedAt') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      return a.orderIndex - b.orderIndex;
    };

    const map: Record<string, Task[]> = {};
    for (const s of statuses) {
      map[s.id] = list
        .filter((t) => t.statusId === s.id)
        .sort(compare);
    }
    return map;
  });

  showTaskDialog = signal(false);
  editingTask = signal<Task | null>(null);
  formTitle = signal('');
  formDescription = signal('');
  formStatusId = signal('');
  formCategory = signal('');
  formOtherCategoryName = signal('');
  showOtherCategoryInput = signal(false);
  formOrganizationId = signal('');
  organizations = signal<Organization[]>([]);

  needOwnerOrgSelection = computed(
    () => !this.editingTask() && this.auth.currentUser()?.organizationId == null
  );

  canEdit = computed(() => {
    const role = this.auth.currentUser()?.role ?? '';
    return role === 'owner' || role === 'admin';
  });

  isOwner = computed(() => this.auth.currentUser()?.role === 'owner');

  shortcutCreate = navigator.platform?.toLowerCase().includes('mac') ? '⌘+K' : 'Ctrl+K';

  shortcutGraph = navigator.platform?.toLowerCase().includes('mac') ? '⌘+G' : 'Ctrl+G';

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (this.canEdit()) this.openCreate();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
      e.preventDefault();
      this.router.navigate(['/graph']);
    }
  }

  statusLabel(name: string): string {
    return name
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  statusColor(name: string): string {
    const key = normalizeTaskStatus(name);
    return key ? TASK_STATUS_COLORS[key] : TASK_STATUS_COLORS[TaskStatus.Todo];
  }

  statusHeaderClass(name: string): string {
    const key = normalizeTaskStatus(name);
    return key ? TASK_STATUS_HEADER_CLASSES[key] : TASK_STATUS_DEFAULT_HEADER_CLASS;
  }

  statusPlaceholderClass(name: string): string {
    const key = normalizeTaskStatus(name);
    return key ? TASK_STATUS_PLACEHOLDER_CLASSES[key] : TASK_STATUS_DEFAULT_PLACEHOLDER_CLASS;
  }

  categoryColor(category: string | null | undefined): string {
    if (!category) return SUBTLE_PALETTE[SUBTLE_PALETTE.length - 1];
    let h = 0;
    for (let i = 0; i < category.length; i++) h = (h << 5) - h + category.charCodeAt(i);
    return SUBTLE_PALETTE[Math.abs(h) % SUBTLE_PALETTE.length];
  }

  creatorLabel(task: Task): string {
    const o = task.owner;
    if (!o) return '—';
    return (o as { username?: string }).username ?? o.email ?? '—';
  }

  setFilterCategory(value: string): void {
    this.filterCategory.set(value);
  }

  setFilterSearch(value: string): void {
    this.filterSearch.set(value);
  }

  setFilterCreatedBy(value: string): void {
    this.filterCreatedBy.set(value);
  }

  setSortBy(value: SortOption): void {
    this.sortBy.set(value);
  }

  ngOnInit(): void {
    this.store.dispatch(TasksActions.loadTasks());
    if (this.auth.currentUser()?.organizationId == null) {
      this.organizationsService.list().subscribe((list) => {
        this.organizations.set(list);
        if (list.length > 0 && !this.formOrganizationId()) {
          this.formOrganizationId.set(list[0].id);
        }
      });
    }
  }

  openCreate(): void {
    if (!this.canEdit()) return;
    this.store.dispatch(TasksActions.setTasksError({ error: null }));
    this.editingTask.set(null);
    this.formTitle.set('');
    this.formDescription.set('');
    const st = this.statusesOrdered();
    this.formStatusId.set(st[0]?.id ?? '');
    const catList = this.categories();
    this.formCategory.set(catList[0]?.categoryName ?? '');
    this.formOtherCategoryName.set('');
    this.showOtherCategoryInput.set(false);
    const orgs = this.organizations();
    if (orgs.length > 0) this.formOrganizationId.set(orgs[0].id);
    this.showTaskDialog.set(true);
  }

  openCreateInColumn(statusId: string): void {
    if (!this.canEdit()) return;
    this.store.dispatch(TasksActions.setTasksError({ error: null }));
    this.editingTask.set(null);
    this.formTitle.set('');
    this.formDescription.set('');
    this.formStatusId.set(statusId);
    const catList = this.categories();
    this.formCategory.set(catList[0]?.categoryName ?? '');
    this.formOtherCategoryName.set('');
    this.showOtherCategoryInput.set(false);
    const orgs = this.organizations();
    if (orgs.length > 0) this.formOrganizationId.set(orgs[0].id);
    this.showTaskDialog.set(true);
  }

  openEditTask(task: Task, e?: Event): void {
    e?.stopPropagation();
    if (!this.canEdit()) return;
    this.store.dispatch(TasksActions.setTasksError({ error: null }));
    this.editingTask.set(task);
    this.formTitle.set(task.title);
    this.formDescription.set(task.description ?? '');
    this.formStatusId.set(task.statusId ?? '');
    this.formCategory.set(task.category ?? this.categories()[0]?.categoryName ?? '');
    this.formOtherCategoryName.set('');
    this.showOtherCategoryInput.set(false);
    this.showTaskDialog.set(true);
  }

  closeTaskDialog(): void {
    this.showTaskDialog.set(false);
    this.editingTask.set(null);
    this.formOrganizationId.set('');
  }

  addOtherCategory(): void {
    const name = this.formOtherCategoryName().trim();
    if (!name) return;
    this.store.dispatch(TasksActions.createCategory({ name }));
    this.actions$
      .pipe(ofType(TasksActions.createCategorySuccess), take(1))
      .subscribe(({ category }) => {
        this.formCategory.set(category.categoryName);
        this.formOtherCategoryName.set('');
        this.showOtherCategoryInput.set(false);
      });
  }

  saveTask(): void {
    const task = this.editingTask();
    const title = this.formTitle().trim();
    if (!title) return;
    const statusId = this.formStatusId();
    const category = this.formCategory() === OTHER_CATEGORY_VALUE ? undefined : this.formCategory();

    if (task) {
      this.store.dispatch(
        TasksActions.updateTask({
          id: task.id,
          title,
          description: this.formDescription().trim() || undefined,
          ...(statusId ? { statusId } : {}),
          category: category || undefined,
        })
      );
      this.closeTaskDialog();
    } else {
      if (!statusId) return;
      if (this.needOwnerOrgSelection() && !this.formOrganizationId()) return;
      this.store.dispatch(
        TasksActions.createTask({
          title,
          description: this.formDescription().trim() || undefined,
          statusId,
          category,
          ...(this.needOwnerOrgSelection() ? { organizationId: this.formOrganizationId() } : {}),
        })
      );
      this.closeTaskDialog();
    }
  }

  drop(event: CdkDragDrop<Task[]>, statusId: string): void {
    if (event.previousContainer === event.container) {
      const list = [...event.container.data];
      moveItemInArray(list, event.previousIndex, event.currentIndex);
      list.forEach((t, index) => {
        this.store.dispatch(
          TasksActions.updateTask({ id: t.id, orderIndex: index })
        );
      });
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      const newIndex = event.currentIndex;
      this.store.dispatch(
        TasksActions.updateTask({
          id: task.id,
          statusId,
          orderIndex: newIndex,
        })
      );
    }
  }

  taskToDelete = signal<Task | null>(null);

  openDeleteConfirm(task: Task, e?: Event): void {
    e?.stopPropagation();
    if (!this.canEdit()) return;
    this.taskToDelete.set(task);
  }

  closeDeleteConfirm(): void {
    this.taskToDelete.set(null);
  }

  confirmDeleteTask(): void {
    const task = this.taskToDelete();
    if (!task) return;
    this.store.dispatch(TasksActions.deleteTask({ id: task.id }));
    this.closeDeleteConfirm();
  }
}
