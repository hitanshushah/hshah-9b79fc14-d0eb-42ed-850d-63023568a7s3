import { Permission } from './permissions';
import { hasPermission, hasRoleOrAbove, getEffectivePermissions } from './rbac';

describe('RBAC', () => {
  describe('hasPermission (with role inheritance)', () => {
    it('owner has task:create (via admin)', () => {
      expect(hasPermission('owner', Permission.TASK_CREATE)).toBe(true);
    });
    it('owner has task:read (via admin -> viewer)', () => {
      expect(hasPermission('owner', Permission.TASK_READ)).toBe(true);
    });
    it('viewer does not have task:create', () => {
      expect(hasPermission('viewer', Permission.TASK_CREATE)).toBe(false);
    });
    it('viewer has task:read', () => {
      expect(hasPermission('viewer', Permission.TASK_READ)).toBe(true);
    });
    it('admin has task:read (inherited from viewer)', () => {
      expect(hasPermission('admin', Permission.TASK_READ)).toBe(true);
    });
    it('admin has audit:read', () => {
      expect(hasPermission('admin', Permission.AUDIT_READ)).toBe(true);
    });
    it('viewer cannot create task (unauthorized)', () => {
      expect(hasPermission('viewer', Permission.TASK_CREATE)).toBe(false);
    });
    it('viewer cannot full update task (only update_status)', () => {
      expect(hasPermission('viewer', Permission.TASK_UPDATE)).toBe(false);
      expect(hasPermission('viewer', Permission.TASK_UPDATE_STATUS)).toBe(true);
    });
    it('viewer cannot delete task', () => {
      expect(hasPermission('viewer', Permission.TASK_DELETE)).toBe(false);
    });
    it('viewer cannot read audit log', () => {
      expect(hasPermission('viewer', Permission.AUDIT_READ)).toBe(false);
    });
    it('viewer cannot read users (no control panel)', () => {
      expect(hasPermission('viewer', Permission.USER_READ)).toBe(false);
    });
    it('admin cannot access control panel (no org/user create/update/reset)', () => {
      expect(hasPermission('admin', Permission.ORG_CREATE)).toBe(false);
      expect(hasPermission('admin', Permission.USER_CREATE)).toBe(false);
      expect(hasPermission('admin', Permission.USER_UPDATE)).toBe(false);
      expect(hasPermission('admin', Permission.USER_RESET_PASSWORD)).toBe(false);
    });
    it('admin can read users (user list only)', () => {
      expect(hasPermission('admin', Permission.USER_READ)).toBe(true);
    });
    it('owner has control panel permissions', () => {
      expect(hasPermission('owner', Permission.ORG_CREATE)).toBe(true);
      expect(hasPermission('owner', Permission.USER_CREATE)).toBe(true);
      expect(hasPermission('owner', Permission.USER_UPDATE)).toBe(true);
      expect(hasPermission('owner', Permission.USER_RESET_PASSWORD)).toBe(true);
    });
    it('unknown role has no permissions', () => {
      expect(hasPermission('unknown', Permission.TASK_READ)).toBe(false);
      expect(hasPermission('', Permission.TASK_READ)).toBe(false);
    });
    it('role is case-insensitive', () => {
      expect(hasPermission('Owner', Permission.TASK_CREATE)).toBe(true);
      expect(hasPermission('VIEWER', Permission.TASK_READ)).toBe(true);
    });
  });

  describe('getEffectivePermissions', () => {
    it('viewer has only direct permissions', () => {
      const perms = getEffectivePermissions('viewer');
      expect(perms).toContain(Permission.TASK_READ);
      expect(perms).toContain(Permission.TASK_UPDATE_STATUS);
      expect(perms.length).toBe(2);
    });
    it('admin includes viewer permissions', () => {
      const perms = getEffectivePermissions('admin');
      expect(perms).toContain(Permission.TASK_READ);
      expect(perms).toContain(Permission.TASK_UPDATE_STATUS);
      expect(perms).toContain(Permission.TASK_CREATE);
      expect(perms).toContain(Permission.AUDIT_READ);
    });
    it('owner includes admin and viewer permissions', () => {
      const perms = getEffectivePermissions('owner');
      expect(perms).toContain(Permission.TASK_READ);
      expect(perms).toContain(Permission.TASK_CREATE);
      expect(perms).toContain(Permission.AUDIT_READ);
      expect(perms).toContain(Permission.USER_READ);
      expect(perms).toContain(Permission.ORG_CREATE);
      expect(perms).toContain(Permission.USER_CREATE);
    });
  });

  describe('hasRoleOrAbove', () => {
    it('owner is above admin', () => {
      expect(hasRoleOrAbove('owner', 'admin')).toBe(true);
    });
    it('viewer is not above admin', () => {
      expect(hasRoleOrAbove('viewer', 'admin')).toBe(false);
    });
    it('same role is allowed', () => {
      expect(hasRoleOrAbove('admin', 'admin')).toBe(true);
    });
  });
});
