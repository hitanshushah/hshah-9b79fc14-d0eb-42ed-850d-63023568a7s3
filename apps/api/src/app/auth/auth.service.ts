import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { JwtPayload } from '@secure-task-system/data';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: ['role'],
    });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      return user;
    }
    return null;
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string; user: { id: string; email: string; role: string; organizationId: string | null } }> {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const roleName = user.role?.name ?? 'viewer';
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: roleName,
      organizationId: user.organizationId,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: roleName,
        organizationId: user.organizationId,
      },
    };
  }
}
