import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { Status } from '../entities/status.entity';
import { Category } from '../entities/category.entity';
import { Task } from '../entities/task.entity';
import { Permission as PermissionConstant } from '@secure-task-system/auth';

const STATUS_NAMES = ['todo', 'in_progress', 'blocked', 'done'] as const;
const DEFAULT_CATEGORY_NAMES = ['work', 'personal'] as const;

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Organization)
    private orgRepository: Repository<Organization>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(Status)
    private statusRepository: Repository<Status>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async onModuleInit() {
    let statuses = await this.statusRepository.find();
    if (statuses.length === 0) {
      for (const name of STATUS_NAMES) {
        await this.statusRepository.save(this.statusRepository.create({ name }));
      }
      statuses = await this.statusRepository.find();
      console.log('[Seed] Created statuses: todo, in_progress, blocked, done');
    }
    const statusByName = Object.fromEntries(statuses.map((s) => [s.name, s]));
    const todoStatus = statusByName['todo'];

    if (todoStatus) {
      const updated = await this.taskRepository.update(
        { statusId: IsNull() },
        { statusId: todoStatus.id },
      );
      if (updated.affected && updated.affected > 0) {
        console.log(`[Seed] Backfilled ${updated.affected} task(s) with status todo`);
      }
    }

    const categoryCount = await this.categoryRepository.count({ where: { userId: IsNull() } });
    if (categoryCount === 0) {
      for (const name of DEFAULT_CATEGORY_NAMES) {
        await this.categoryRepository.save(
          this.categoryRepository.create({ userId: null, categoryName: name }),
        );
      }
      console.log('[Seed] Created default categories: work, personal');
    }

    const orgCount = await this.orgRepository.count();
    if (orgCount > 0) return;

    // Create permissions (including user permissions for seed role-permission table)
    const permissionActions = [
      PermissionConstant.TASK_CREATE,
      PermissionConstant.TASK_READ,
      PermissionConstant.TASK_UPDATE,
      PermissionConstant.TASK_UPDATE_STATUS,
      PermissionConstant.TASK_DELETE,
      PermissionConstant.AUDIT_READ,
      PermissionConstant.ORG_CREATE,
      PermissionConstant.USER_READ,
      PermissionConstant.USER_CREATE,
      PermissionConstant.USER_UPDATE,
      PermissionConstant.USER_RESET_PASSWORD,
    ];
    const permissions: Permission[] = [];
    for (const action of permissionActions) {
      const p = this.permissionRepository.create({ action, description: null });
      const saved = await this.permissionRepository.save(p);
      permissions.push(saved);
    }
    const permByAction = Object.fromEntries(
      permissions.map((p) => [p.action, p]),
    ) as Record<string, Permission>;

    // Create roles: Viewer, Admin, Owner
    const viewer = await this.roleRepository.save(
      this.roleRepository.create({
        name: 'viewer',
        description: 'Can view tasks',
      }),
    );
    const admin = await this.roleRepository.save(
      this.roleRepository.create({
        name: 'admin',
        description: 'Full task and audit access',
        inheritsFromRoleId: viewer.id,
      }),
    );
    const ownerRole = await this.roleRepository.save(
      this.roleRepository.create({
        name: 'owner',
        description: 'Organization owner',
        inheritsFromRoleId: null,
      }),
    );

    // Assign permissions to roles
    const rolePerms: RolePermission[] = [
      this.rolePermissionRepository.create({
        roleId: viewer.id,
        permissionId: permByAction[PermissionConstant.TASK_READ].id,
      }),
      this.rolePermissionRepository.create({
        roleId: viewer.id,
        permissionId: permByAction[PermissionConstant.TASK_UPDATE_STATUS].id,
      }),
      this.rolePermissionRepository.create({
        roleId: admin.id,
        permissionId: permByAction[PermissionConstant.TASK_CREATE].id,
      }),
      this.rolePermissionRepository.create({
        roleId: admin.id,
        permissionId: permByAction[PermissionConstant.TASK_READ].id,
      }),
      this.rolePermissionRepository.create({
        roleId: admin.id,
        permissionId: permByAction[PermissionConstant.TASK_UPDATE].id,
      }),
      this.rolePermissionRepository.create({
        roleId: admin.id,
        permissionId: permByAction[PermissionConstant.TASK_DELETE].id,
      }),
      this.rolePermissionRepository.create({
        roleId: admin.id,
        permissionId: permByAction[PermissionConstant.AUDIT_READ].id,
      }),
      this.rolePermissionRepository.create({
        roleId: admin.id,
        permissionId: permByAction[PermissionConstant.ORG_CREATE].id,
      }),
      this.rolePermissionRepository.create({
        roleId: ownerRole.id,
        permissionId: permByAction[PermissionConstant.TASK_CREATE].id,
      }),
      this.rolePermissionRepository.create({
        roleId: ownerRole.id,
        permissionId: permByAction[PermissionConstant.TASK_READ].id,
      }),
      this.rolePermissionRepository.create({
        roleId: ownerRole.id,
        permissionId: permByAction[PermissionConstant.TASK_UPDATE].id,
      }),
      this.rolePermissionRepository.create({
        roleId: ownerRole.id,
        permissionId: permByAction[PermissionConstant.TASK_DELETE].id,
      }),
      this.rolePermissionRepository.create({
        roleId: ownerRole.id,
        permissionId: permByAction[PermissionConstant.AUDIT_READ].id,
      }),
      this.rolePermissionRepository.create({
        roleId: ownerRole.id,
        permissionId: permByAction[PermissionConstant.ORG_CREATE].id,
      }),
      this.rolePermissionRepository.create({
        roleId: admin.id,
        permissionId: permByAction[PermissionConstant.USER_READ].id,
      }),
      this.rolePermissionRepository.create({
        roleId: admin.id,
        permissionId: permByAction[PermissionConstant.USER_CREATE].id,
      }),
      this.rolePermissionRepository.create({
        roleId: admin.id,
        permissionId: permByAction[PermissionConstant.USER_UPDATE].id,
      }),
      this.rolePermissionRepository.create({
        roleId: admin.id,
        permissionId: permByAction[PermissionConstant.USER_RESET_PASSWORD].id,
      }),
      this.rolePermissionRepository.create({
        roleId: ownerRole.id,
        permissionId: permByAction[PermissionConstant.USER_READ].id,
      }),
      this.rolePermissionRepository.create({
        roleId: ownerRole.id,
        permissionId: permByAction[PermissionConstant.USER_CREATE].id,
      }),
      this.rolePermissionRepository.create({
        roleId: ownerRole.id,
        permissionId: permByAction[PermissionConstant.USER_UPDATE].id,
      }),
      this.rolePermissionRepository.create({
        roleId: ownerRole.id,
        permissionId: permByAction[PermissionConstant.USER_RESET_PASSWORD].id,
      }),
    ];
    await this.rolePermissionRepository.save(rolePerms);

    // 3 organizations: A (parent), B (parentId=A), C (parentId=B) — 2 parentId scenarios
    const orgA = await this.orgRepository.save(
      this.orgRepository.create({ name: 'Organization A', parentId: null }),
    );
    const orgB = await this.orgRepository.save(
      this.orgRepository.create({ name: 'Organization B', parentId: orgA.id }),
    );
    const orgC = await this.orgRepository.save(
      this.orgRepository.create({ name: 'Organization C', parentId: null }),
    );

    const admin123Hash = await bcrypt.hash('admin123', 10);
    const passwordHash = await bcrypt.hash('password', 10);

    // 1 owner: Owner, owner@example.com, admin123 — no org (select org when creating tasks)
    await this.userRepository.save(
      this.userRepository.create({
        username: 'Owner',
        email: 'owner@example.com',
        passwordHash: admin123Hash,
        organizationId: null,
        roleId: ownerRole.id,
      }),
    );

    // 2 admins (both in Org A): Admin, Admin2 — admin123
    await this.userRepository.save(
      this.userRepository.create({
        username: 'Admin',
        email: 'admin@example.com',
        passwordHash: admin123Hash,
        organizationId: orgA.id,
        roleId: admin.id,
      }),
    );
    await this.userRepository.save(
      this.userRepository.create({
        username: 'Admin2',
        email: 'admin2@example.com',
        passwordHash: admin123Hash,
        organizationId: orgB.id,
        roleId: admin.id,
      }),
    );
    await this.userRepository.save(
      this.userRepository.create({
        username: 'Admin3',
        email: 'admin3@example.com',
        passwordHash: admin123Hash,
        organizationId: orgC.id,
        roleId: admin.id,
      }),
    );

    // 6 viewers: User A,B,C (Org A), User D,E (Org B), User F (Org C) — password "password"
    const viewers = [
      { username: 'User A', email: 'usera@example.com', orgId: orgA.id },
      { username: 'User B', email: 'userb@example.com', orgId: orgA.id },
      { username: 'User C', email: 'userc@example.com', orgId: orgA.id },
      { username: 'User D', email: 'userd@example.com', orgId: orgB.id },
      { username: 'User E', email: 'usere@example.com', orgId: orgB.id },
      { username: 'User F', email: 'userf@example.com', orgId: orgC.id },
    ];
    for (const v of viewers) {
      await this.userRepository.save(
        this.userRepository.create({
          username: v.username,
          email: v.email,
          passwordHash,
          organizationId: v.orgId,
          roleId: viewer.id,
        }),
      );
    }

    console.log(
      '[Seed] Created 3 orgs (A→B→C), 1 owner (Owner), 2 admins (Admin, Admin2), 6 viewers (User A–F). Passwords: admin123 / password',
    );
  }
}
