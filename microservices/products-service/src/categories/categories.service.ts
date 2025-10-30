import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private readonly repo: Repository<Category>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    return cat;
  }

  create(dto: CreateCategoryDto) {
    const c = this.repo.create(dto);
    return this.repo.save(c);
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const c = await this.findOne(id);
    Object.assign(c, dto);
    return this.repo.save(c);
  }

  async remove(id: number) {
    const c = await this.findOne(id);
    await this.repo.remove(c);
    return { deleted: true };
  }
}
