import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { appRoutes } from './app.routes';
import { jwtInterceptor } from './core/jwt.interceptor';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { tasksReducer } from './features/tasks/state/tasks.reducer';
import { TasksEffects } from './features/tasks/state/tasks.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideStore({ tasks: tasksReducer }),
    provideEffects(TasksEffects),
    providePrimeNG({
      theme: {
          preset: Aura
      }
  })
  ],
};
