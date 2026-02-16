import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions, RequireAnyOfPermissions } from '../auth/require-permissions.decorator';
import { Permission } from '@secure-task-system/auth';
import { CreateTaskDto, UpdateTaskDto } from '@secure-task-system/data';

type RequestWithUser = Request & {
  user: { id: string; email: string; role: string; organizationId: string | null };
};

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.TASK_CREATE)
  create(@Body() dto: CreateTaskDto, @Req() req: RequestWithUser) {
    const organizationId = req.user.organizationId ?? dto.organizationId ?? null;
    if (!organizationId) {
      throw new BadRequestException('Organization is required when creating a task');
    }
    return this.tasksService.create(
      dto,
      req.user.id,
      organizationId,
      req.user.role,
    );
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.TASK_READ)
  findAll(@Req() req: RequestWithUser) {
    return this.tasksService.findAll(req.user.organizationId, req.user.role);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.TASK_READ)
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.tasksService.findOne(id, req.user.organizationId, req.user.role);
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @RequireAnyOfPermissions(Permission.TASK_UPDATE, Permission.TASK_UPDATE_STATUS)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @Req() req: RequestWithUser,
  ) {
    return this.tasksService.update(
      id,
      dto,
      req.user.id,
      req.user.organizationId,
      req.user.role,
    );
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.TASK_DELETE)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.tasksService.remove(
      id,
      req.user.id,
      req.user.organizationId,
      req.user.role,
    );
  }
}
