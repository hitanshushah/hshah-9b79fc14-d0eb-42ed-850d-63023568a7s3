import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

type RequestWithUser = Request & {
  user: { id: string; email: string; role: string; organizationId: string | null };
};

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.categoriesService.findAllForUser(req.user.id);
  }

  @Post()
  create(@Body() body: { name: string }, @Req() req: RequestWithUser) {
    return this.categoriesService.createForUser(req.user.id, body.name ?? '');
  }
}
