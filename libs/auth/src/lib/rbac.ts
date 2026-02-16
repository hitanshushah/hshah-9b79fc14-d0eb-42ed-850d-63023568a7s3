import { ROLE_PERMISSIONS, ROLE_INHERITANCE, PermissionType } from './permissions';

export const ROLE_HIERARCHY: Record<string, number> = {
  owner: 3,
  admin: 2,
  viewer: 1,
};

export function getEffectivePermissions(role: string): PermissionType[] {
  const normalizedRole = role?.toLowerCase();
  const seen = new Set<string>();
  const perms: PermissionType[] = [];

  function collect(r: string): void {
    if (!r || seen.has(r)) return;
    seen.add(r);
    const parent = ROLE_INHERITANCE[r];
    if (parent) collect(parent);
    const direct = ROLE_PERMISSIONS[r];
    if (Array.isArray(direct)) {
      for (const p of direct) {
        if (!perms.includes(p)) perms.push(p);
      }
    }
  }

  collect(normalizedRole);
  return perms;
}

export function hasPermission(role: string, permission: PermissionType): boolean {
  const effective = getEffectivePermissions(role);
  return effective.includes(permission);
}

export function hasRoleOrAbove(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole?.toLowerCase()] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole?.toLowerCase()] ?? 0;
  return userLevel >= requiredLevel;
}

export function canAccessOrganization(
  userOrgId: string,
  resourceOrgId: string,
  userRole: string,
  allowSameOrg: boolean
): boolean {
  if (userOrgId !== resourceOrgId) return false;
  return allowSameOrg;
}
