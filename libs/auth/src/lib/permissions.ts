export const Permission = {
  TASK_CREATE: 'task:create',
  TASK_READ: 'task:read',
  TASK_UPDATE: 'task:update',
  TASK_UPDATE_STATUS: 'task:update_status',
  TASK_DELETE: 'task:delete',
  AUDIT_READ: 'audit:read',
  ORG_CREATE: 'organization:create',
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_RESET_PASSWORD: 'user:reset-password',
} as const;

export type PermissionType = (typeof Permission)[keyof typeof Permission];

export const ROLE_INHERITANCE: Record<string, string | null> = {
  viewer: null,
  admin: 'viewer',
  owner: 'admin',
};

export const ROLE_PERMISSIONS: Record<string, PermissionType[]> = {
  viewer: [Permission.TASK_READ, Permission.TASK_UPDATE_STATUS],
  admin: [
    Permission.TASK_CREATE,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.AUDIT_READ,
    Permission.USER_READ,
  ],
  owner: [
    Permission.ORG_CREATE,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_RESET_PASSWORD,
  ],
};
