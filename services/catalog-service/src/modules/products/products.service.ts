import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from '../categories/entities/category.entity';
import { EventService } from '../../events/event.service';
import { ProductOutOfStockEvent } from '@shared/events/product.events';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    private readonly eventService: EventService,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    // Validar precio positivo
    if (dto.precio <= 0) {
      throw new BadRequestException('El precio debe ser mayor a 0');
    }

    // Validar stock no negativo
    if (dto.stock !== undefined && dto.stock < 0) {
      throw new BadRequestException('El stock no puede ser negativo');
    }

    const product = this.productRepo.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      precio: dto.precio,
      imagenUrl: dto.imagenUrl,
      stock: dto.stock ?? 0,
      disponible: dto.disponible ?? true,
    });

    if (dto.id_categoria) {
      const category = await this.categoryRepo.findOne({ where: { id: dto.id_categoria } });
      if (!category) {
        throw new NotFoundException(`Categoría con ID ${dto.id_categoria} no encontrada`);
      }
      product.categoria = category;
    }

    return this.productRepo.save(product);
  }

  findAll(): Promise<Product[]> {
    return this.productRepo.find({ relations: ['categoria'] });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id }, relations: ['categoria'] });
    if (!product) throw new NotFoundException(`Producto ${id} no encontrado`);
    return product;
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    // Validar precio positivo si se actualiza
    if (dto.precio !== undefined && dto.precio <= 0) {
      throw new BadRequestException('El precio debe ser mayor a 0');
    }

    // Validar stock no negativo si se actualiza
    if (dto.stock !== undefined && dto.stock < 0) {
      throw new BadRequestException('El stock no puede ser negativo');
    }

    if (dto.id_categoria !== undefined) {
      if (dto.id_categoria === null) {
        product.categoria = null;
      } else {
        const category = await this.categoryRepo.findOne({ where: { id: dto.id_categoria } });
        if (!category) throw new NotFoundException(`Categoría ${dto.id_categoria} no encontrada`);
        product.categoria = category;
      }
    }

    if (dto.nombre !== undefined) product.nombre = dto.nombre;
    if (dto.descripcion !== undefined) product.descripcion = dto.descripcion;
    if (dto.precio !== undefined) product.precio = dto.precio;
    if (dto.imagenUrl !== undefined) product.imagenUrl = dto.imagenUrl;
    if (dto.stock !== undefined) {
      // Si el stock anterior era > 0 y el nuevo es 0, emitir evento
      if (product.stock > 0 && dto.stock === 0) {
        this.eventService.emitProductOutOfStock(
          new ProductOutOfStockEvent(product.id, product.nombre)
        );
      }
      product.stock = dto.stock;
    }
    if (dto.disponible !== undefined) product.disponible = dto.disponible;

    return this.productRepo.save(product);
  }

  async replace(id: number, dto: CreateProductDto): Promise<Product> {
    // Reemplazo completo: requiere campos obligatorios
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Producto ${id} no encontrado`);
    product.nombre = dto.nombre;
    product.descripcion = dto.descripcion;
    product.precio = dto.precio;
    product.imagenUrl = dto.imagenUrl;
    product.stock = dto.stock ?? 0;
    product.disponible = dto.disponible ?? true;
    if (dto.id_categoria) {
      const category = await this.categoryRepo.findOne({ where: { id: dto.id_categoria } });
      if (category) product.categoria = category; else product.categoria = null;
    } else {
      product.categoria = null;
    }
    return this.productRepo.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    await this.productRepo.remove(product);
    return { message: `Producto ${id} eliminado exitosamente` };
  }
}