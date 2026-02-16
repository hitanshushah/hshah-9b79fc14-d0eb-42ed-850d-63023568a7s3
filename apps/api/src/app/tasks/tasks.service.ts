import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from '../entities/task.entity';
import { Status } from '../entities/status.entity';
import { CreateTaskDto, UpdateTaskDto } from '@secure-task-system/data';
import { Permission, hasPermission } from '@secure-task-system/auth';
import { AuditService } from '../audit/audit.service';
import { OrganizationsService } from '../organizations/organizations.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Status)
    private statusRepository: Repository<Status>,
    private auditService: AuditService,
    private organizationsService: OrganizationsService,
  ) {}

  async create(
    dto: CreateTaskDto,
    userId: string,
    organizationId: string, // resolved in controller (user org or dto.organizationId for owner)
    role: string,
  ): Promise<Task> {
    if (!hasPermission(role, Permission.TASK_CREATE)) {
      throw new ForbiddenException('Cannot create tasks');
    }
    const statusId =
      dto.statusId ??
      (await this.statusRepository.findOne({ where: { name: 'todo' } }))?.id;
    if (!statusId) {
      throw new ForbiddenException('Default status "todo" not found');
    }
    const task = this.taskRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      statusId,
      orderIndex: 0,
      category: dto.category ?? null,
      ownerId: userId,
      organizationId,
    });
    const saved = await this.taskRepository.save(task);
    await this.auditService.log(userId, 'task.create', 'task', saved.id, {
      title: saved.title,
    });
    const withOwner = await this.taskRepository.findOne({
      where: { id: saved.id },
      relations: ['status', 'owner'],
    });
    return withOwner ?? saved;
  }

  async findAll(
    organizationId: string | null,
    role: string,
  ): Promise<Task[]> {
    if (!hasPermission(role, Permission.TASK_READ)) {
      throw new ForbiddenException('Cannot read tasks');
    }
    const orgIds = await this.organizationsService.getOrganizationIdsForDataAccess(organizationId, role);
    const where = orgIds === null ? {} : { organizationId: In(orgIds) };
    return this.taskRepository.find({
      where,
      order: { statusId: 'ASC', orderIndex: 'ASC', createdAt: 'DESC' },
      relations: ['status', 'owner'],
    });
  }

  async findOne(
    id: string,
    organizationId: string | null,
    role: string,
  ): Promise<Task> {
    if (!hasPermission(role, Permission.TASK_READ)) {
      throw new ForbiddenException('Cannot read tasks');
    }
    const orgIds = await this.organizationsService.getOrganizationIdsForDataAccess(organizationId, role);
    const where = orgIds === null ? { id } : { id, organizationId: In(orgIds) };
    const task = await this.taskRepository.findOne({
      where,
      relations: ['status', 'owner'],
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(
    id: string,
    dto: UpdateTaskDto,
    userId: string,
    organizationId: string | null,
    role: string,
  ): Promise<Task> {
    const canFullUpdate = hasPermission(role, Permission.TASK_UPDATE);
    const canStatusOnly = hasPermission(role, Permission.TASK_UPDATE_STATUS);
    if (!canFullUpdate && !canStatusOnly) {
      throw new ForbiddenException('Cannot update tasks');
    }
    const orgIds = await this.organizationsService.getOrganizationIdsForDataAccess(organizationId, role);
    const where = orgIds === null ? { id } : { id, organizationId: In(orgIds) };
    const task = await this.taskRepository.findOne({ where });
    if (!task) throw new NotFoundException('Task not found');
    if (canFullUpdate) {
      if (dto.title !== undefined) task.title = dto.title;
      if (dto.description !== undefined) task.description = dto.description;
      if (dto.category !== undefined) task.category = dto.category ?? null;
    }
    if (dto.statusId !== undefined) task.statusId = dto.statusId;
    if (dto.orderIndex !== undefined) task.orderIndex = dto.orderIndex;
    const saved = await this.taskRepository.save(task);
    await this.auditService.log(userId, 'task.update', 'task', id, {
      changes: {
        title: dto.title,
        description: dto.description,
        statusId: dto.statusId,
        orderIndex: dto.orderIndex,
      },
    });
    return saved;
  }

  async remove(
    id: string,
    userId: string,
    organizationId: string | null,
    role: string,
  ): Promise<void> {
    if (!hasPermission(role, Permission.TASK_DELETE)) {
      throw new ForbiddenException('Cannot delete tasks');
    }
    const orgIds = await this.organizationsService.getOrganizationIdsForDataAccess(organizationId, role);
    const where = orgIds === null ? { id } : { id, organizationId: In(orgIds) };
    const task = await this.taskRepository.findOne({ where });
    if (!task) throw new NotFoundException('Task not found');
    await this.taskRepository.remove(task);
    await this.auditService.log(userId, 'task.delete', 'task', id, null);
  }
}
