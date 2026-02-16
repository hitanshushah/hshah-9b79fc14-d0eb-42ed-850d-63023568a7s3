import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));
const bcrypt = require('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<Repository<User>>;
  let jwtService: JwtService;

  const mockUser = {
    id: 'user-1',
    email: 'admin@example.com',
    passwordHash: 'hashed',
    organizationId: 'org-1',
    roleId: 'role-owner',
    role: { id: 'role-owner', name: 'owner' },
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn(() => 'jwt-token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user when password matches', async () => {
      bcrypt.compare.mockResolvedValue(true);
      userRepo.findOne = jest.fn().mockResolvedValue(mockUser);

      const result = await service.validateUser('admin@example.com', 'password');
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      userRepo.findOne = jest.fn().mockResolvedValue(null);
      const result = await service.validateUser('unknown@example.com', 'pass');
      expect(result).toBeNull();
    });

    it('should return null when password does not match', async () => {
      bcrypt.compare.mockResolvedValue(false);
      userRepo.findOne = jest.fn().mockResolvedValue(mockUser);
      const result = await service.validateUser('admin@example.com', 'wrong');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access_token and user on valid credentials', async () => {
      bcrypt.compare.mockResolvedValue(true);
      userRepo.findOne = jest.fn().mockResolvedValue(mockUser);

      const result = await service.login('admin@example.com', 'admin123');
      expect(result.access_token).toBe('jwt-token');
      expect(result.user.email).toBe('admin@example.com');
      expect(result.user.role).toBe('owner');
      expect(result.user.organizationId).toBe('org-1');
    });

    it('should return role from user.role.name (viewer when role missing)', async () => {
      bcrypt.compare.mockResolvedValue(true);
      const viewerUser = { ...mockUser, role: { id: 'r2', name: 'viewer' } } as User;
      userRepo.findOne = jest.fn().mockResolvedValue(viewerUser);

      const result = await service.login('viewer@example.com', 'pass');
      expect(result.user.role).toBe('viewer');
    });

    it('should return organizationId null for owner with no org', async () => {
      bcrypt.compare.mockResolvedValue(true);
      const ownerNoOrg = { ...mockUser, organizationId: null, role: { id: 'r1', name: 'owner' } } as User;
      userRepo.findOne = jest.fn().mockResolvedValue(ownerNoOrg);

      const result = await service.login('owner@example.com', 'admin123');
      expect(result.user.role).toBe('owner');
      expect(result.user.organizationId).toBeNull();
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      userRepo.findOne = jest.fn().mockResolvedValue(null);
      await expect(service.login('x@x.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
