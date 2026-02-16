import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<{ id: string; name: string }[]> {
    const roles = await this.roleRepository.find({
      order: { name: 'ASC' },
    });
    return roles.map((r) => ({ id: r.id, name: r.name }));
  }
}
