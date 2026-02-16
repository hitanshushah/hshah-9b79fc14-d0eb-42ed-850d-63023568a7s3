import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationsService } from './organizations.service';
import { Organization } from '../entities/organization.entity';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let orgRepo: jest.Mocked<Repository<Organization>>;

  const parentOrg = {
    id: 'org-parent',
    name: 'Parent',
    parentId: null,
    children: [{ id: 'org-child', name: 'Child', parentId: 'org-parent' }],
  } as Organization;

  const childOrg = {
    id: 'org-child',
    name: 'Child',
    parentId: 'org-parent',
    children: [],
  } as Organization;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        {
          provide: getRepositoryToken(Organization),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn((x) => x),
            save: jest.fn((x) => ({ ...x, id: x.id || 'new-id' })),
          },
        },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
    orgRepo = module.get(getRepositoryToken(Organization));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrganizationIdsForDataAccess', () => {
    it('returns null for owner (can see all organizations)', async () => {
      const result = await service.getOrganizationIdsForDataAccess('org-any', 'owner');
      expect(result).toBeNull();
    });

    it('returns [] when organizationId is null and role is not owner', async () => {
      const result = await service.getOrganizationIdsForDataAccess(null, 'admin');
      expect(result).toEqual([]);
    });

    it('returns [parentId, ...childIds] for parent org (parent can see child tasks)', async () => {
      orgRepo.findOne = jest.fn().mockResolvedValue(parentOrg);
      const result = await service.getOrganizationIdsForDataAccess('org-parent', 'admin');
      expect(result).toEqual(['org-parent', 'org-child']);
    });

    it('returns [childId] only for child org (child cannot see parent tasks)', async () => {
      orgRepo.findOne = jest.fn().mockResolvedValue(childOrg);
      const result = await service.getOrganizationIdsForDataAccess('org-child', 'admin');
      expect(result).toEqual(['org-child']);
    });

    it('returns [organizationId] when org has no children', async () => {
      orgRepo.findOne = jest.fn().mockResolvedValue({ ...childOrg, children: [] });
      const result = await service.getOrganizationIdsForDataAccess('org-child', 'viewer');
      expect(result).toEqual(['org-child']);
    });

    it('returns [organizationId] when org not found (fallback)', async () => {
      orgRepo.findOne = jest.fn().mockResolvedValue(null);
      const result = await service.getOrganizationIdsForDataAccess('org-unknown', 'admin');
      expect(result).toEqual(['org-unknown']);
    });
  });
});
