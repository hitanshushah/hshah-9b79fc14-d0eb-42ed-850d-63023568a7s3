import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { Permission } from '@secure-task-system/auth';

type RequestWithUser = Request & {
  user: { id: string; email: string; role: string; organizationId: string | null };
};

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.USER_READ)
  list(
    @Req() req: RequestWithUser,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.usersService.list(
      req.user.organizationId,
      req.user.role,
      organizationId,
    );
  }
}
