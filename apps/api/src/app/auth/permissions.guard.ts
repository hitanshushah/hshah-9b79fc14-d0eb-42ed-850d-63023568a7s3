import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { hasPermission } from '@secure-task-system/auth';
import { PermissionType } from '@secure-task-system/auth';

export const PERMISSIONS_KEY = 'permissions';
export const PERMISSIONS_ANY_KEY = 'permissions_any';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredAny = this.reflector.getAllAndOverride<PermissionType[]>(
      PERMISSIONS_ANY_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (requiredAny?.length) {
      const { user } = context.switchToHttp().getRequest();
      if (!user) throw new ForbiddenException('User not authenticated');
      const hasAny = requiredAny.some((perm) => hasPermission(user.role, perm));
      if (!hasAny) throw new ForbiddenException('Insufficient permissions');
      return true;
    }
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionType[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions?.length) return true;
    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('User not authenticated');
    const hasAll = requiredPermissions.every((perm) =>
      hasPermission(user.role, perm),
    );
    if (!hasAll) throw new ForbiddenException('Insufficient permissions');
    return true;
  }
}
