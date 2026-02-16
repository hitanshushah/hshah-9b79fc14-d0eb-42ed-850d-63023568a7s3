import {
  Injectable,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { Permission, hasPermission } from '@secure-task-system/auth';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private orgRepository: Repository<Organization>,
  ) {}

  async createChild(
    name: string,
    parentId: string | null,
    userId: string,
    role: string,
  ): Promise<Organization> {
    if (!hasPermission(role, Permission.ORG_CREATE)) {
      throw new ForbiddenException('Cannot create organizations');
    }
    const existing = await this.orgRepository.findOne({
      where: { name },
    });
    if (existing) {
      throw new ConflictException(`Organization with name "${name}" already exists`);
    }
    const org = this.orgRepository.create({
      name,
      parentId,
    });
    return this.orgRepository.save(org);
  }

  async findMyOrgAndChildren(organizationId: string): Promise<Organization[]> {
    const myOrg = await this.orgRepository.findOne({
      where: { id: organizationId },
      relations: ['children'],
    });
    if (!myOrg) return [];
    const children = myOrg.children ?? [];
    return [myOrg, ...children];
  }

  async findAll(): Promise<Organization[]> {
    return this.orgRepository.find({
      order: { name: 'ASC' },
    });
  }

  async getOrganizationIdsForDataAccess(
    organizationId: string | null,
    role: string,
  ): Promise<string[] | null> {
    if (role === 'owner') return null;
    if (!organizationId) return [];
    const myOrg = await this.orgRepository.findOne({
      where: { id: organizationId },
      relations: ['children'],
    });
    if (!myOrg) return [organizationId];
    const children = myOrg.children ?? [];
    return [myOrg.id, ...children.map((c) => c.id)];
  }
}
