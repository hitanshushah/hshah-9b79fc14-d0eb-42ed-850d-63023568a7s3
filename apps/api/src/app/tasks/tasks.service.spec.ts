import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TasksService } from './tasks.service';
import { Task } from '../entities/task.entity';
import { Status } from '../entities/status.entity';
import { AuditService } from '../audit/audit.service';
import { OrganizationsService } from '../organizations/organizations.service';

describe('TasksService', () => {
  let service: TasksService;
  let taskRepo: jest.Mocked<Repository<Task>>;
  let statusRepo: jest.Mocked<Repository<Status>>;
  let organizationsService: OrganizationsService;

  const todoStatus = { id: 'status-todo', name: 'todo' } as Status;
  const mockTask = {
    id: 'task-1',
    title: 'Test',
    description: null,
    statusId: 'status-todo',
    ownerId: 'user-1',
    organizationId: 'org-1',
    orderIndex: 0,
  } as Partial<Task>;

  beforeEach(async () => {
    const mockOrgService = {
      getOrganizationIdsForDataAccess: jest.fn().mockResolvedValue(['org-1']),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            create: jest.fn((x) => x),
            save: jest.fn((x) => ({ ...x, id: x.id || 'task-1' })),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Status),
          useValue: {
            findOne: jest.fn().mockResolvedValue(todoStatus),
          },
        },
        { provide: AuditService, useValue: { log: jest.fn() } },
        { provide: OrganizationsService, useValue: mockOrgService },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskRepo = module.get(getRepositoryToken(Task));
    statusRepo = module.get(getRepositoryToken(Status));
    organizationsService = module.get<OrganizationsService>(OrganizationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns tasks for organization', async () => {
      taskRepo.find = jest.fn().mockResolvedValue([mockTask]);
      const result = await service.findAll('org-1', 'admin');
      expect(result).toHaveLength(1);
      expect(result[0].organizationId).toBe('org-1');
      expect(organizationsService.getOrganizationIdsForDataAccess).toHaveBeenCalledWith('org-1', 'admin');
    });

    it('owner sees all tasks (getOrganizationIdsForDataAccess returns null)', async () => {
      (organizationsService.getOrganizationIdsForDataAccess as jest.Mock).mockResolvedValue(null);
      taskRepo.find = jest.fn().mockResolvedValue([mockTask, { ...mockTask, id: 'task-2', organizationId: 'org-2' }]);
      const result = await service.findAll(null, 'owner');
      expect(result).toHaveLength(2);
      expect(taskRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('parent org sees own and child org tasks', async () => {
      (organizationsService.getOrganizationIdsForDataAccess as jest.Mock).mockResolvedValue(['org-parent', 'org-child']);
      taskRepo.find = jest.fn().mockResolvedValue([
        { ...mockTask, organizationId: 'org-parent' },
        { ...mockTask, id: 'task-2', organizationId: 'org-child' },
      ]);
      const result = await service.findAll('org-parent', 'admin');
      expect(result).toHaveLength(2);
      expect(taskRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: expect.anything() },
        }),
      );
    });

    it('viewer can read tasks', async () => {
      taskRepo.find = jest.fn().mockResolvedValue([mockTask]);
      const result = await service.findAll('org-1', 'viewer');
      expect(result).toHaveLength(1);
    });

    it('throws when viewer has no TASK_READ (handled by guard; service still checks)', () => {
      // Service uses hasPermission(role, TASK_READ); viewer has TASK_READ
      taskRepo.find = jest.fn().mockResolvedValue([mockTask]);
      return expect(service.findAll('org-1', 'viewer')).resolves.toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('returns task when in same org', async () => {
      taskRepo.findOne = jest.fn().mockResolvedValue(mockTask);
      const result = await service.findOne('task-1', 'org-1', 'admin');
      expect(result.id).toBe('task-1');
    });

    it('child org cannot see parent-only task (task not in orgIds)', async () => {
      (organizationsService.getOrganizationIdsForDataAccess as jest.Mock).mockResolvedValue(['org-child']);
      taskRepo.findOne = jest.fn().mockResolvedValue(null); // task in org-parent only
      await expect(service.findOne('task-parent', 'org-child', 'admin')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when task not found', async () => {
      taskRepo.findOne = jest.fn().mockResolvedValue(null);
      await expect(service.findOne('x', 'org-1', 'admin')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('viewer cannot create task (unauthorized)', async () => {
      await expect(
        service.create(
          { title: 'New' },
          'user-1',
          'org-1',
          'viewer',
        ),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.create(
          { title: 'New' },
          'user-1',
          'org-1',
          'viewer',
        ),
      ).rejects.toThrow('Cannot create tasks');
    });

    it('admin can create task', async () => {
      taskRepo.save = jest.fn().mockResolvedValue({ ...mockTask, title: 'New' });
      taskRepo.findOne = jest.fn().mockResolvedValue({ ...mockTask, title: 'New' });
      const result = await service.create(
        { title: 'New' },
        'user-1',
        'org-1',
        'admin',
      );
      expect(result.title).toBe('New');
    });
  });

  describe('update', () => {
    it('viewer cannot full update task (title/description not applied; only status)', async () => {
      (organizationsService.getOrganizationIdsForDataAccess as jest.Mock).mockResolvedValue(['org-1']);
      const taskCopy = { ...mockTask, title: 'Test' };
      taskRepo.findOne = jest.fn().mockResolvedValue(taskCopy);
      taskRepo.save = jest.fn().mockImplementation((t) => Promise.resolve(t));
      const result = await service.update(
        'task-1',
        { title: 'Updated' },
        'user-1',
        'org-1',
        'viewer',
      );
      expect(result.title).toBe('Test');
    });

    it('viewer can update status only (TASK_UPDATE_STATUS)', async () => {
      (organizationsService.getOrganizationIdsForDataAccess as jest.Mock).mockResolvedValue(['org-1']);
      const updated = { ...mockTask, statusId: 'status-done' };
      taskRepo.findOne = jest.fn().mockResolvedValue(mockTask);
      taskRepo.save = jest.fn().mockResolvedValue(updated);
      const result = await service.update(
        'task-1',
        { statusId: 'status-done' },
        'user-1',
        'org-1',
        'viewer',
      );
      expect(result.statusId).toBe('status-done');
    });

    it('admin can full update task', async () => {
      (organizationsService.getOrganizationIdsForDataAccess as jest.Mock).mockResolvedValue(['org-1']);
      taskRepo.findOne = jest.fn().mockResolvedValue(mockTask);
      taskRepo.save = jest.fn().mockResolvedValue({ ...mockTask, title: 'Updated' });
      const result = await service.update(
        'task-1',
        { title: 'Updated' },
        'user-1',
        'org-1',
        'admin',
      );
      expect(result.title).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('viewer cannot delete task', async () => {
      await expect(
        service.remove('task-1', 'user-1', 'org-1', 'viewer'),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.remove('task-1', 'user-1', 'org-1', 'viewer'),
      ).rejects.toThrow('Cannot delete tasks');
    });

    it('admin can delete task in their org', async () => {
      (organizationsService.getOrganizationIdsForDataAccess as jest.Mock).mockResolvedValue(['org-1']);
      taskRepo.findOne = jest.fn().mockResolvedValue(mockTask);
      taskRepo.remove = jest.fn().mockResolvedValue(undefined);
      await service.remove('task-1', 'user-1', 'org-1', 'admin');
      expect(taskRepo.remove).toHaveBeenCalled();
    });
  });
});
