import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Status } from '../entities/status.entity';

@Injectable()
export class StatusesService {
  constructor(
    @InjectRepository(Status)
    private statusRepository: Repository<Status>,
  ) {}

  async findAll(): Promise<Status[]> {
    return this.statusRepository.find({
      order: { name: 'ASC' },
    });
  }
}
