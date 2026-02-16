import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { authGuard, loginGuard, adminGuard, controlPanelGuard } from './auth.guard';

describe('Auth Guards', () => {
  let authService: { isLoggedIn: jest.Mock; currentUser: jest.Mock };
  let router: { navigate: jest.Mock };

  beforeEach(() => {
    authService = {
      isLoggedIn: jest.fn(),
      currentUser: jest.fn(),
    };
    router = { navigate: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });
  });

  describe('authGuard', () => {
    it('returns true when user is logged in', () => {
      authService.isLoggedIn.mockReturnValue(true);
      expect(TestBed.runInInjectionContext(authGuard)).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('redirects to /login and returns false when not logged in', () => {
      authService.isLoggedIn.mockReturnValue(false);
      expect(TestBed.runInInjectionContext(authGuard)).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('loginGuard', () => {
    it('returns true when user is not logged in', () => {
      authService.isLoggedIn.mockReturnValue(false);
      expect(TestBed.runInInjectionContext(loginGuard)).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('redirects to / and returns false when already logged in', () => {
      authService.isLoggedIn.mockReturnValue(true);
      expect(TestBed.runInInjectionContext(loginGuard)).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('adminGuard', () => {
    it('redirects to /login when not logged in', () => {
      authService.isLoggedIn.mockReturnValue(false);
      expect(TestBed.runInInjectionContext(adminGuard)).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('returns true for owner', () => {
      authService.isLoggedIn.mockReturnValue(true);
      authService.currentUser.mockReturnValue({ id: '1', email: 'o@x.com', role: 'owner', organizationId: null });
      expect(TestBed.runInInjectionContext(adminGuard)).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('returns true for admin', () => {
      authService.isLoggedIn.mockReturnValue(true);
      authService.currentUser.mockReturnValue({ id: '1', email: 'a@x.com', role: 'admin', organizationId: 'org-1' });
      expect(TestBed.runInInjectionContext(adminGuard)).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('redirects viewer to /unauthorized', () => {
      authService.isLoggedIn.mockReturnValue(true);
      authService.currentUser.mockReturnValue({ id: '1', email: 'v@x.com', role: 'viewer', organizationId: 'org-1' });
      expect(TestBed.runInInjectionContext(adminGuard)).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/unauthorized']);
    });
  });

  describe('controlPanelGuard', () => {
    it('redirects to /login when not logged in', () => {
      authService.isLoggedIn.mockReturnValue(false);
      expect(TestBed.runInInjectionContext(controlPanelGuard)).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('returns true only for owner', () => {
      authService.isLoggedIn.mockReturnValue(true);
      authService.currentUser.mockReturnValue({ id: '1', email: 'o@x.com', role: 'owner', organizationId: null });
      expect(TestBed.runInInjectionContext(controlPanelGuard)).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('redirects admin to /unauthorized (admin cannot access control panel)', () => {
      authService.isLoggedIn.mockReturnValue(true);
      authService.currentUser.mockReturnValue({ id: '1', email: 'a@x.com', role: 'admin', organizationId: 'org-1' });
      expect(TestBed.runInInjectionContext(controlPanelGuard)).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/unauthorized']);
    });

    it('redirects viewer to /unauthorized', () => {
      authService.isLoggedIn.mockReturnValue(true);
      authService.currentUser.mockReturnValue({ id: '1', email: 'v@x.com', role: 'viewer', organizationId: 'org-1' });
      expect(TestBed.runInInjectionContext(controlPanelGuard)).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/unauthorized']);
    });
  });
});
