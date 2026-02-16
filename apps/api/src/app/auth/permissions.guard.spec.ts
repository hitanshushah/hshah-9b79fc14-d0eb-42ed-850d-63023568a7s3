import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '@secure-task-system/auth';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  const createMockContext = (user: { role: string } | null): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
  });

  describe('RequirePermissions (all required)', () => {
    it('throws when user is missing', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === 'permissions') return [Permission.TASK_READ];
        return undefined;
      });
      const ctx = createMockContext(null);
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(ctx)).toThrow('User not authenticated');
    });

    it('throws when user lacks required permission', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === 'permissions') return [Permission.TASK_CREATE];
        return undefined;
      });
      const ctx = createMockContext({ role: 'viewer' });
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(ctx)).toThrow('Insufficient permissions');
    });

    it('allows when user has required permission', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === 'permissions') return [Permission.TASK_READ];
        return undefined;
      });
      const ctx = createMockContext({ role: 'viewer' });
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('allows when user has all required permissions', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === 'permissions') return [Permission.TASK_READ, Permission.TASK_UPDATE_STATUS];
        return undefined;
      });
      const ctx = createMockContext({ role: 'viewer' });
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('allows owner for audit:read (admin permission)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === 'permissions') return [Permission.AUDIT_READ];
        return undefined;
      });
      const ctx = createMockContext({ role: 'owner' });
      expect(guard.canActivate(ctx)).toBe(true);
    });
  });

  describe('RequireAnyOfPermissions', () => {
    it('allows when user has one of the permissions', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === 'permissions_any') return [Permission.TASK_UPDATE, Permission.TASK_UPDATE_STATUS];
        return undefined;
      });
      const ctx = createMockContext({ role: 'viewer' });
      expect(guard.canActivate(ctx)).toBe(true); // viewer has TASK_UPDATE_STATUS
    });

    it('throws when user has none of the permissions', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === 'permissions_any') return [Permission.TASK_CREATE, Permission.TASK_DELETE];
        return undefined;
      });
      const ctx = createMockContext({ role: 'viewer' });
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });
  });

  describe('no permissions metadata', () => {
    it('allows when no permission metadata is set', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const ctx = createMockContext({ role: 'viewer' });
      expect(guard.canActivate(ctx)).toBe(true);
    });
  });
});
