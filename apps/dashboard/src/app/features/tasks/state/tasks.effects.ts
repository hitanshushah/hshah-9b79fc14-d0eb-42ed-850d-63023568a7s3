import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { forkJoin } from 'rxjs';
import { TasksService, UpdateTaskDto } from '../tasks.service';
import * as TasksActions from './tasks.actions';

@Injectable()
export class TasksEffects {
  private actions$ = inject(Actions);
  private tasksService = inject(TasksService);

  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.loadTasks),
      switchMap(() =>
        forkJoin({
          statuses: this.tasksService.listStatuses(),
          categories: this.tasksService.listCategories(),
          tasks: this.tasksService.list(),
        }).pipe(
          map(({ tasks, statuses, categories }) =>
            TasksActions.loadTasksSuccess({ tasks, statuses, categories })
          ),
          catchError((err) =>
            of(
              TasksActions.loadTasksFailure({
                error: err?.error?.message || 'Failed to load tasks',
              })
            )
          )
        )
      )
    )
  );

  createTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.createTask),
      switchMap(({ title, description, statusId, category, organizationId }) =>
        this.tasksService.create({ title, description, statusId, category, organizationId }).pipe(
          map((task) => TasksActions.createTaskSuccess({ task })),
          catchError((err) =>
            of(
              TasksActions.createTaskFailure({
                error: err?.error?.message || 'Failed to create task',
              })
            )
          )
        )
      )
    )
  );

  updateTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.updateTask),
      switchMap((action) => {
        const { id, title, description, statusId, orderIndex, category } = action;
        const dto: UpdateTaskDto = {};
        if (title !== undefined) dto.title = title;
        if (description !== undefined) dto.description = description;
        if (statusId !== undefined) dto.statusId = statusId;
        if (orderIndex !== undefined) dto.orderIndex = orderIndex;
        if (category !== undefined) dto.category = category;
        return this.tasksService.update(id, dto).pipe(
          map((task) => TasksActions.updateTaskSuccess({ task })),
          catchError((err) =>
            of(
              TasksActions.updateTaskFailure({
                error: err?.error?.message || 'Update failed',
              })
            )
          )
        );
      })
    )
  );

  deleteTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.deleteTask),
      switchMap(({ id }) =>
        this.tasksService.delete(id).pipe(
          map(() => TasksActions.deleteTaskSuccess({ id })),
          catchError((err) =>
            of(
              TasksActions.deleteTaskFailure({
                error: err?.error?.message || 'Delete failed',
              })
            )
          )
        )
      )
    )
  );

  createCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.createCategory),
      switchMap(({ name }) =>
        this.tasksService.createCategory(name).pipe(
          map((category) => TasksActions.createCategorySuccess({ category })),
          catchError((err) =>
            of(
              TasksActions.createCategoryFailure({
                error: err?.error?.message || 'Failed to add category',
              })
            )
          )
        )
      )
    )
  );
}
