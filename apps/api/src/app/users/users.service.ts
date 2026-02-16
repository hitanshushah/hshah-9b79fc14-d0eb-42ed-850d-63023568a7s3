import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Permission, hasPermission } from '@secure-task-system/auth';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async list(
    organizationId: string | null,
    role: string,
    organizationIdFilter?: string,
  ): Promise<Array<Omit<Partial<User>, 'role' | 'passwordHash'> & { role?: { id: string; name: string } | null }>> {
    if (!hasPermission(role, Permission.USER_READ)) {
      throw new ForbiddenException('Cannot list users');
    }
    const isOwner = role === 'owner';
    const orgId = organizationIdFilter ?? organizationId ?? null;
    if (!isOwner && orgId !== organizationId) {
      throw new ForbiddenException('Cannot list users from another organization');
    }
    const where =
      isOwner && !organizationIdFilter ? undefined : orgId != null ? { organizationId: orgId } : undefined;
    const users = await this.userRepository.find({
      ...(where ? { where } : {}),
      relations: ['role'],
      order: { email: 'ASC' },
    });
    return users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      organizationId: u.organizationId,
      roleId: u.roleId,
      role: u.role ? { id: u.role.id, name: u.role.name } : null,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  }
}
