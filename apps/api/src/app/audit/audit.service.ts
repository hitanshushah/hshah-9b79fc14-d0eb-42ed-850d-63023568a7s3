import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { OrganizationsService } from '../organizations/organizations.service';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepository: Repository<AuditLog>,
    private organizationsService: OrganizationsService,
  ) {}

  async log(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string | null,
    metadata: Record<string, unknown> | null = null,
  ): Promise<void> {
    const entry = this.auditRepository.create({
      userId,
      action,
      resourceType,
      resourceId,
      metadata,
    });
    await this.auditRepository.save(entry);
    const msg = `[AUDIT] ${new Date().toISOString()} userId=${userId} action=${action} resource_type=${resourceType} resource_id=${resourceId ?? 'n/a'} ${metadata ? `metadata=${JSON.stringify(metadata)}` : ''}`;
    console.log(msg);
  }

  async findAll(organizationId: string | null, role: string): Promise<AuditLog[]> {
    const orgIds = await this.organizationsService.getOrganizationIdsForDataAccess(organizationId, role);
    const qb = this.auditRepository
      .createQueryBuilder('log')
      .innerJoinAndSelect('log.user', 'user')
      .orderBy('log.timestamp', 'DESC')
      .take(200);
    if (orgIds !== null) {
      qb.andWhere('user.organizationId IN (:...orgIds)', { orgIds });
    }
    return qb.getMany();
  }
}
