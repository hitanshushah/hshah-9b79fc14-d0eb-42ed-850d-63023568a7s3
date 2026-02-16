import { Route } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { controlPanelGuard } from './core/auth.guard';
import { adminGuard } from './core/auth.guard';
import { loginGuard } from './core/auth.guard';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
    canActivate: [loginGuard],
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then((m) => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./features/tasks/kanban-board.component').then((m) => m.KanbanBoardComponent) },
      {
        path: 'control-panel',
        loadComponent: () => import('./features/admin/admin.component').then((m) => m.AdminComponent),
        canActivate: [controlPanelGuard],
      },
      {
        path: 'access-logs',
        loadComponent: () => import('./features/access-logs/access-logs.component').then((m) => m.AccessLogsComponent),
        canActivate: [adminGuard],
      },
      {
        path: 'graph',
        loadComponent: () => import('./features/task-graph/task-graph.component').then((m) => m.TaskGraphComponent),
      },
      {
        path: 'unauthorized',
        loadComponent: () => import('./features/unauthorized/unauthorized.component').then((m) => m.UnauthorizedComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
