import { SetMetadata } from '@nestjs/common';
import { PermissionType } from '@secure-task-system/auth';
import { PERMISSIONS_KEY, PERMISSIONS_ANY_KEY } from './permissions.guard';

export const RequirePermissions = (...permissions: PermissionType[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const RequireAnyOfPermissions = (...permissions: PermissionType[]) =>
  SetMetadata(PERMISSIONS_ANY_KEY, permissions);
