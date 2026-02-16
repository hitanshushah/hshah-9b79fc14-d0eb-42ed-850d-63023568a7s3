import { createReducer, on } from '@ngrx/store';
import * as TasksActions from './tasks.actions';
import { Task, Status, Category } from '../tasks.service';

export const TASKS_FEATURE_KEY = 'tasks';

export interface TasksState {
  tasks: Task[];
  statuses: Status[];
  categories: Category[];
  loading: boolean;
  error: string | null;
}

export const initialTasksState: TasksState = {
  tasks: [],
  statuses: [],
  categories: [],
  loading: false,
  error: null,
};

export const tasksReducer = createReducer(
  initialTasksState,
  on(TasksActions.loadTasks, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(TasksActions.loadTasksSuccess, (state, { tasks, statuses, categories }) => ({
    ...state,
    tasks,
    statuses,
    categories,
    loading: false,
    error: null,
  })),
  on(TasksActions.loadTasksFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(TasksActions.createTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: [...state.tasks, task],
  })),
  on(TasksActions.updateTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: state.tasks.map((t) => (t.id === task.id ? { ...t, ...task } : t)),
  })),
  on(TasksActions.deleteTaskSuccess, (state, { id }) => ({
    ...state,
    tasks: state.tasks.filter((t) => t.id !== id),
  })),
  on(TasksActions.createCategorySuccess, (state, { category }) => ({
    ...state,
    categories: [...state.categories, category],
  })),
  on(
    TasksActions.createTaskFailure,
    TasksActions.updateTaskFailure,
    TasksActions.deleteTaskFailure,
    TasksActions.createCategoryFailure,
    (state, { error }) => ({
      ...state,
      error,
    })
  ),
  on(TasksActions.setTasksError, (state, { error }) => ({
    ...state,
    error,
  }))
);
