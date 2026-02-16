import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { Status } from '../entities/status.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { AuditModule } from '../audit/audit.module';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Status]),
    AuditModule,
    OrganizationsModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
