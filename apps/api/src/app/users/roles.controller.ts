import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesService } from './roles.service';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  list() {
    return this.rolesService.findAll();
  }
}
