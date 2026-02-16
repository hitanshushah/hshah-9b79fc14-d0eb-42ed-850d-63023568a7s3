import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtPayload } from '@secure-task-system/data';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'change-me-in-production',
    });
  }

  async validate(payload: JwtPayload): Promise<{ id: string; email: string; role: string; organizationId: string | null }> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: ['role'],
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    const roleName = user.role?.name ?? 'viewer';
    return {
      id: user.id,
      email: user.email,
      role: roleName,
      organizationId: user.organizationId,
    };
  }
}
