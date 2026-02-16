import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { Permission } from '@secure-task-system/auth';

type RequestWithUser = Request & {
  user: { id: string; email: string; role: string; organizationId: string | null };
};

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}


  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.ORG_CREATE)
  create(@Body() body: { name: string; parentId?: string | null }, @Req() req: RequestWithUser) {
    const parentId =
      req.user.organizationId != null ? req.user.organizationId : (body.parentId ?? null);
    return this.organizationsService.createChild(
      body.name,
      parentId,
      req.user.id,
      req.user.role,
    );
  }


  @Get()
  list(@Req() req: RequestWithUser) {
    if (req.user.role === 'owner') {
      return this.organizationsService.findAll();
    }
    return this.organizationsService.findMyOrgAndChildren(
      req.user.organizationId,
    );
  }
}
