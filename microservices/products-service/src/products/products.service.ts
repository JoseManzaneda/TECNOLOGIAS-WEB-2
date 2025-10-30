import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    @Inject('RABBITMQ_SERVICE') private readonly rabbit: ClientProxy,
  ) {}

  findAll(categoryId?: number) {
    if (categoryId) {
      return this.productRepo
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.categoria', 'c')
        .where('c.id = :id', { id: categoryId })
        .getMany();
    }
    return this.productRepo.find({ relations: ['categoria'] });
  }

  findAvailable() {
    return this.productRepo.find({ where: { disponible: true }, relations: ['categoria'] });
  }

  async findOne(id: number) {
    const p = await this.productRepo.findOne({ where: { id }, relations: ['categoria'] });
    if (!p) throw new NotFoundException('Producto no encontrado');
    return p;
  }

  async create(dto: CreateProductDto) {
    let categoria: Category | null = null;
    if (dto.idCategoria) {
      categoria = await this.categoryRepo.findOne({ where: { id: dto.idCategoria } });
      if (!categoria) throw new NotFoundException('Categoría no encontrada');
    }

    const p = this.productRepo.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      precio: dto.precio.toFixed(2),
      categoria: categoria || null,
      imagenUrl: dto.imagenUrl || null,
      stock: dto.stock ?? 0,
      disponible: dto.disponible ?? true,
    });

    const saved = await this.productRepo.save(p);

    // Emitir evento
    this.rabbit.emit('product.created', {
      id: saved.id,
      nombre: saved.nombre,
      precio: saved.precio,
      idCategoria: saved.categoria?.id ?? null,
      disponible: saved.disponible,
      stock: saved.stock,
    });

    return saved;
  }

  async update(id: number, dto: UpdateProductDto) {
    const p = await this.findOne(id);

    let categoria: Category | null = p.categoria ?? null;
    if (dto.idCategoria !== undefined) {
      if (dto.idCategoria === null) {
        categoria = null;
      } else {
        const found = await this.categoryRepo.findOne({ where: { id: dto.idCategoria } });
        if (!found) throw new NotFoundException('Categoría no encontrada');
        categoria = found;
      }
    }

    Object.assign(p, {
      nombre: dto.nombre ?? p.nombre,
      descripcion: dto.descripcion ?? p.descripcion,
      precio: dto.precio !== undefined ? dto.precio.toFixed(2) : p.precio,
      categoria,
      imagenUrl: dto.imagenUrl ?? p.imagenUrl,
      stock: dto.stock ?? p.stock,
      disponible: dto.disponible ?? p.disponible,
    });

    const saved = await this.productRepo.save(p);

    this.rabbit.emit('product.updated', {
      id: saved.id,
      nombre: saved.nombre,
      precio: saved.precio,
      idCategoria: saved.categoria?.id ?? null,
      disponible: saved.disponible,
      stock: saved.stock,
    });

    return saved;
  }

  async remove(id: number) {
    const p = await this.findOne(id);
    await this.productRepo.remove(p);

    this.rabbit.emit('product.deleted', { id });

    return { deleted: true };
  }
}
