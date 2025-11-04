import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  create(dto: CreateCategoryDto) {
    const category = this.categoryRepo.create(dto);
    return this.categoryRepo.save(category);
  }

  findAll() {
    return this.categoryRepo.find({ relations: ['productos'] });
  }

  async findOne(id: number) {
    const category = await this.categoryRepo.findOne({ where: { id }, relations: ['productos'] });
    if (!category) throw new NotFoundException(`Categoría ${id} no encontrada`);
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    if (dto.nombre !== undefined) category.nombre = dto.nombre;
    if (dto.descripcion !== undefined) category.descripcion = dto.descripcion;
    return this.categoryRepo.save(category);
  }

  async replace(id: number, dto: CreateCategoryDto) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException(`Categoría ${id} no encontrada`);
    category.nombre = dto.nombre;
    category.descripcion = dto.descripcion;
    return this.categoryRepo.save(category);
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    await this.categoryRepo.remove(category);
    return { message: `Categoría ${id} eliminada exitosamente` };
  }
}