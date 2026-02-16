import { tasksReducer, initialTasksState } from './tasks.reducer';
import * as TasksActions from './tasks.actions';
import { Task, Status, Category } from '../tasks.service';

const mockStatus: Status = { id: 's1', name: 'todo' };
const mockCategory: Category = { id: 'c1', userId: null, categoryName: 'work' };
const mockTask: Task = {
  id: 't1',
  title: 'Task 1',
  description: null,
  statusId: 's1',
  orderIndex: 0,
  ownerId: 'u1',
  organizationId: 'org1',
  createdAt: '',
  updatedAt: '',
};

describe('tasksReducer', () => {
  it('should return initial state', () => {
    const state = tasksReducer(undefined, { type: 'unknown' });
    expect(state).toEqual(initialTasksState);
  });

  it('loadTasks sets loading true and clears error', () => {
    const state = tasksReducer(
      { ...initialTasksState, error: 'Previous error' },
      TasksActions.loadTasks(),
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('loadTasksSuccess sets tasks, statuses, categories and loading false', () => {
    const state = tasksReducer(
      { ...initialTasksState, loading: true },
      TasksActions.loadTasksSuccess({
        tasks: [mockTask],
        statuses: [mockStatus],
        categories: [mockCategory],
      }),
    );
    expect(state.tasks).toEqual([mockTask]);
    expect(state.statuses).toEqual([mockStatus]);
    expect(state.categories).toEqual([mockCategory]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('loadTasksFailure sets error and loading false', () => {
    const state = tasksReducer(
      { ...initialTasksState, loading: true },
      TasksActions.loadTasksFailure({ error: 'Failed' }),
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Failed');
  });

  it('createTaskSuccess appends task', () => {
    const newTask = { ...mockTask, id: 't2', title: 'Task 2' };
    const state = tasksReducer(
      { ...initialTasksState, tasks: [mockTask] },
      TasksActions.createTaskSuccess({ task: newTask }),
    );
    expect(state.tasks).toHaveLength(2);
    expect(state.tasks[1]).toEqual(newTask);
  });

  it('updateTaskSuccess updates task in place', () => {
    const updated = { ...mockTask, title: 'Updated' };
    const state = tasksReducer(
      { ...initialTasksState, tasks: [mockTask] },
      TasksActions.updateTaskSuccess({ task: updated }),
    );
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0].title).toBe('Updated');
  });

  it('deleteTaskSuccess removes task', () => {
    const state = tasksReducer(
      { ...initialTasksState, tasks: [mockTask, { ...mockTask, id: 't2' }] },
      TasksActions.deleteTaskSuccess({ id: 't1' }),
    );
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0].id).toBe('t2');
  });

  it('createTaskFailure sets error', () => {
    const state = tasksReducer(
      initialTasksState,
      TasksActions.createTaskFailure({ error: 'Create failed' }),
    );
    expect(state.error).toBe('Create failed');
  });

  it('setTasksError updates error', () => {
    const state = tasksReducer(
      initialTasksState,
      TasksActions.setTasksError({ error: 'Custom error' }),
    );
    expect(state.error).toBe('Custom error');
  });

  it('setTasksError null clears error', () => {
    const state = tasksReducer(
      { ...initialTasksState, error: 'Old' },
      TasksActions.setTasksError({ error: null }),
    );
    expect(state.error).toBeNull();
  });
});
