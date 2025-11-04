import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

/**
 * Controlador interno para comunicación entre microservicios
 * No expuesto en Swagger - Solo para uso interno
 */
@Controller('internal/products')
export class ProductsInternalController {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  /**
   * Obtener información del producto para validación
   * Endpoint interno para comunicación entre servicios
   */
  @Get(':id/info')
  async getProductInfo(@Param('id', ParseIntPipe) id: number) {
    const product = await this.productRepo.findOne({ 
      where: { id },
      relations: ['categoria'],
    });
    
    if (!product) {
      return {
        exists: false,
        id: id,
      };
    }

    return {
      exists: true,
      id: product.id,
      nombre: product.nombre,
      precio: parseFloat(product.precio.toString()),
      stock: product.stock,
      disponible: product.disponible,
    };
  }
}
