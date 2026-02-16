import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: jest.Mocked<Repository<User>>;

  const mockUser = {
    id: 'user-1',
    username: 'Admin',
    email: 'admin@example.com',
    organizationId: 'org-1',
    roleId: 'role-admin',
    role: { id: 'role-admin', name: 'admin' },
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn().mockResolvedValue([mockUser]),
          },
        },
        {
          provide: getRepositoryToken(Role),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('viewer cannot list users (no USER_READ - control panel access)', async () => {
      await expect(service.list('org-1', 'viewer')).rejects.toThrow(ForbiddenException);
      await expect(service.list('org-1', 'viewer')).rejects.toThrow('Cannot list users');
    });

    it('admin can list users in their org only', async () => {
      userRepo.find = jest.fn().mockResolvedValue([mockUser]);
      const result = await service.list('org-1', 'admin');
      expect(result).toHaveLength(1);
      expect(userRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { organizationId: 'org-1' } }),
      );
    });

    it('admin cannot list users from another organization', async () => {
      await expect(
        service.list('org-1', 'admin', 'org-2'),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.list('org-1', 'admin', 'org-2'),
      ).rejects.toThrow('Cannot list users from another organization');
    });

    it('owner can list all users when no filter', async () => {
      userRepo.find = jest.fn().mockResolvedValue([mockUser, { ...mockUser, id: 'user-2', organizationId: 'org-2' }]);
      const result = await service.list(null, 'owner');
      expect(result).toHaveLength(2);
      expect(userRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ relations: ['role'], order: { email: 'ASC' } }),
      );
      const callArg = userRepo.find.mock.calls[0][0];
      expect(callArg.where).toBeUndefined();
    });

    it('owner can filter by organizationId', async () => {
      userRepo.find = jest.fn().mockResolvedValue([mockUser]);
      await service.list(null, 'owner', 'org-1');
      expect(userRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { organizationId: 'org-1' } }),
      );
    });
  });
});
