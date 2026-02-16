import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TasksState, TASKS_FEATURE_KEY } from './tasks.reducer';
import { Task } from '../tasks.service';

export const selectTasksState = createFeatureSelector<TasksState>(TASKS_FEATURE_KEY);

export const selectTasks = createSelector(selectTasksState, (state) => state.tasks);
export const selectStatuses = createSelector(selectTasksState, (state) => state.statuses);
export const selectCategories = createSelector(selectTasksState, (state) => state.categories);
export const selectTasksLoading = createSelector(selectTasksState, (state) => state.loading);
export const selectTasksError = createSelector(selectTasksState, (state) => state.error);

export const selectTasksByStatus = createSelector(
  selectTasks,
  selectStatuses,
  (tasks, statuses) => {
    const map: Record<string, Task[]> = {};
    for (const s of statuses) {
      map[s.id] = [...tasks]
        .filter((t) => t.statusId === s.id)
        .sort((a, b) => a.orderIndex - b.orderIndex);
    }
    return map;
  }
);

export const selectStatusListIds = createSelector(selectStatuses, (statuses) =>
  statuses.map((s) => s.id)
);
