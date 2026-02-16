import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAllForUser(userId: string): Promise<Category[]> {
    return this.categoryRepository
      .createQueryBuilder('c')
      .where('c.user_id IS NULL OR c.user_id = :userId', { userId })
      .orderBy('c.user_id', 'ASC')
      .addOrderBy('c.category_name', 'ASC')
      .getMany();
  }

  async createForUser(userId: string, categoryName: string): Promise<Category> {
    const trimmed = categoryName.trim();
    if (!trimmed) {
      throw new ConflictException('Category name is required');
    }
    const existing = await this.categoryRepository.findOne({
      where: { userId, categoryName: trimmed },
    });
    if (existing) {
      return existing;
    }
    const category = this.categoryRepository.create({
      userId,
      categoryName: trimmed,
    });
    return this.categoryRepository.save(category);
  }
}
