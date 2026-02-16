import { createAction, props } from '@ngrx/store';
import { Task, Status, Category } from '../tasks.service';

export const loadTasks = createAction('[Tasks] Load Tasks');
export const loadTasksSuccess = createAction(
  '[Tasks] Load Tasks Success',
  props<{ tasks: Task[]; statuses: Status[]; categories: Category[] }>()
);
export const loadTasksFailure = createAction(
  '[Tasks] Load Tasks Failure',
  props<{ error: string }>()
);

export const createTask = createAction(
  '[Tasks] Create Task',
  props<{ title: string; description?: string; statusId: string; category?: string; organizationId?: string }>()
);
export const createTaskSuccess = createAction(
  '[Tasks] Create Task Success',
  props<{ task: Task }>()
);
export const createTaskFailure = createAction(
  '[Tasks] Create Task Failure',
  props<{ error: string }>()
);

export const updateTask = createAction(
  '[Tasks] Update Task',
  props<{
    id: string;
    title?: string;
    description?: string;
    statusId?: string;
    orderIndex?: number;
    category?: string;
  }>()
);
export const updateTaskSuccess = createAction(
  '[Tasks] Update Task Success',
  props<{ task: Task }>()
);
export const updateTaskFailure = createAction(
  '[Tasks] Update Task Failure',
  props<{ error: string }>()
);

export const deleteTask = createAction(
  '[Tasks] Delete Task',
  props<{ id: string }>()
);
export const deleteTaskSuccess = createAction(
  '[Tasks] Delete Task Success',
  props<{ id: string }>()
);
export const deleteTaskFailure = createAction(
  '[Tasks] Delete Task Failure',
  props<{ error: string }>()
);

export const createCategory = createAction(
  '[Tasks] Create Category',
  props<{ name: string }>()
);
export const createCategorySuccess = createAction(
  '[Tasks] Create Category Success',
  props<{ category: Category }>()
);
export const createCategoryFailure = createAction(
  '[Tasks] Create Category Failure',
  props<{ error: string }>()
);

export const setTasksError = createAction(
  '[Tasks] Set Error',
  props<{ error: string | null }>()
);
