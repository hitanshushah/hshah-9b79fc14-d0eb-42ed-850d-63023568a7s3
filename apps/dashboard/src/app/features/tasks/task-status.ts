export enum TaskStatus {
  Todo = 'todo',
  InProgress = 'in_progress',
  Done = 'done',
  Blocked = 'blocked',
}

export const TASK_STATUS_ORDER: readonly TaskStatus[] = [
  TaskStatus.Todo,
  TaskStatus.InProgress,
  TaskStatus.Done,
  TaskStatus.Blocked,
];

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.Todo]: '#3b82f6',
  [TaskStatus.InProgress]: '#f97316',
  [TaskStatus.Done]: '#22c55e',
  [TaskStatus.Blocked]: '#ef4444',
};

export const TASK_STATUS_HEADER_CLASSES: Record<TaskStatus, string> = {
  [TaskStatus.Todo]: 'bg-blue-50 dark:bg-blue-950/30',
  [TaskStatus.InProgress]: 'bg-orange-50 dark:bg-orange-950/30',
  [TaskStatus.Done]: 'bg-green-50 dark:bg-green-950/30',
  [TaskStatus.Blocked]: 'bg-red-50 dark:bg-red-950/30',
};

export const TASK_STATUS_PLACEHOLDER_CLASSES: Record<TaskStatus, string> = {
  [TaskStatus.Todo]: 'bg-blue-50/50 dark:bg-blue-950/20',
  [TaskStatus.InProgress]: 'bg-orange-50/50 dark:bg-orange-950/20',
  [TaskStatus.Done]: 'bg-green-50/50 dark:bg-green-950/20',
  [TaskStatus.Blocked]: 'bg-red-50/50 dark:bg-red-950/20',
};

export const TASK_STATUS_DEFAULT_HEADER_CLASS = 'bg-slate-100 dark:bg-slate-700';
export const TASK_STATUS_DEFAULT_PLACEHOLDER_CLASS = '';

export function normalizeTaskStatus(name: string | null | undefined): TaskStatus | null {
  if (name == null) return null;
  const key = name.toLowerCase().replace(/\s+/g, '_');
  if (Object.values(TaskStatus).includes(key as TaskStatus)) return key as TaskStatus;
  if (key.includes('block')) return TaskStatus.Blocked;
  if (key.includes('done') || key.includes('complete')) return TaskStatus.Done;
  if (key.includes('progress')) return TaskStatus.InProgress;
  if (key.includes('todo')) return TaskStatus.Todo;
  return null;
}
