import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatusesService } from './statuses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('statuses')
@UseGuards(JwtAuthGuard)
export class StatusesController {
  constructor(private statusesService: StatusesService) {}

  @Get()
  findAll() {
    return this.statusesService.findAll();
  }
}
