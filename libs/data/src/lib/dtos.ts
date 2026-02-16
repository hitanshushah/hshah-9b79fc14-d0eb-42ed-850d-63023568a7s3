import { IsString, IsOptional, IsEnum, IsInt, MinLength, IsUUID, MaxLength } from 'class-validator';
import { TaskStatus } from './interfaces';

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsUUID()
  statusId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsUUID()
  statusId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsInt()
  orderIndex?: number;
}

export class LoginDto {
  @IsString()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;
}

export interface AuthResponseDto {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: string;
    organizationId: string | null;
  };
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  organizationId: string | null;
  iat?: number;
  exp?: number;
}
