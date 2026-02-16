import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditService } from './audit.service';
import { AuditLog } from '../entities/audit-log.entity';
import { OrganizationsService } from '../organizations/organizations.service';

describe('AuditService', () => {
  let service: AuditService;
  let auditRepo: jest.Mocked<Repository<AuditLog>>;
  let organizationsService: OrganizationsService;
  let andWhereMock: jest.Mock;

  beforeEach(async () => {
    const mockOrgService = {
      getOrganizationIdsForDataAccess: jest.fn().mockResolvedValue(['org-1']),
    };
    andWhereMock = jest.fn().mockReturnThis();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: {
            create: jest.fn((x) => x),
            save: jest.fn((x) => x),
            createQueryBuilder: jest.fn(() => ({
              innerJoinAndSelect: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              andWhere: andWhereMock,
              getMany: jest.fn().mockResolvedValue([]),
            })),
          },
        },
        { provide: OrganizationsService, useValue: mockOrgService },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    auditRepo = module.get(getRepositoryToken(AuditLog));
    organizationsService = module.get<OrganizationsService>(OrganizationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('owner gets all audit logs (orgIds null)', async () => {
      (organizationsService.getOrganizationIdsForDataAccess as jest.Mock).mockResolvedValue(null);
      andWhereMock.mockClear();
      await service.findAll(null, 'owner');
      expect(organizationsService.getOrganizationIdsForDataAccess).toHaveBeenCalledWith(null, 'owner');
      expect(andWhereMock).not.toHaveBeenCalled();
    });

    it('admin gets audit logs scoped to their org and children', async () => {
      (organizationsService.getOrganizationIdsForDataAccess as jest.Mock).mockResolvedValue(['org-1', 'org-2']);
      await service.findAll('org-1', 'admin');
      expect(andWhereMock).toHaveBeenCalledWith('user.organizationId IN (:...orgIds)', { orgIds: ['org-1', 'org-2'] });
    });

    it('viewer cannot access (guard enforces AUDIT_READ); service would scope by org', async () => {
      (organizationsService.getOrganizationIdsForDataAccess as jest.Mock).mockResolvedValue(['org-1']);
      await service.findAll('org-1', 'viewer');
      expect(organizationsService.getOrganizationIdsForDataAccess).toHaveBeenCalledWith('org-1', 'viewer');
    });
  });
});
