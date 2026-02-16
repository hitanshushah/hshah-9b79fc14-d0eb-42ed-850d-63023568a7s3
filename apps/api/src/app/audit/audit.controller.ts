import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { Permission } from '@secure-task-system/auth';

@Controller('audit-log')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions(Permission.AUDIT_READ)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  async getAuditLog(@Req() req: Request & { user: { organizationId: string | null; role: string } }) {
    return this.auditService.findAll(req.user.organizationId, req.user.role);
  }
}
