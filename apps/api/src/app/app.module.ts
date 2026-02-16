import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  User,
  Organization,
  Role,
  Permission,
  RolePermission,
  Status,
  Category,
  Task,
  AuditLog,
} from './entities';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { AuditModule } from './audit/audit.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { StatusesModule } from './statuses/statuses.module';
import { CategoriesModule } from './categories/categories.module';
import { UsersModule } from './users/users.module';
import { SeedService } from './seed/seed.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'secure_task_system',
      entities: [
        User,
        Organization,
        Role,
        Permission,
        RolePermission,
        Status,
        Category,
        Task,
        AuditLog,
      ],
      synchronize: true,
      logging: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature([Organization, User, Role, Permission, RolePermission, Status, Category, Task]),
    AuthModule,
    TasksModule,
    AuditModule,
    OrganizationsModule,
    StatusesModule,
    CategoriesModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule {}
