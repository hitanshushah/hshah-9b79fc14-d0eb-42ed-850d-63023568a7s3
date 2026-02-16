import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigate(['/login']);
  return false;
};

export const loginGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return true;
  router.navigate(['/']);
  return false;
};

export const adminGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }
  const role = auth.currentUser()?.role ?? '';
  if (role === 'owner' || role === 'admin') return true;
  router.navigate(['/unauthorized']);
  return false;
};

export const controlPanelGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }
  const role = auth.currentUser()?.role ?? '';
  if (role === 'owner') return true;
  router.navigate(['/unauthorized']);
  return false;
};
