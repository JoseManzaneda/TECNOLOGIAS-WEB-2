import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Put, HttpCode, UseGuards, HttpStatus } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * Controlador de productos
 * 
 * Endpoints disponibles:
 * - POST /api/products - Crear producto (solo admin)
 * - GET /api/products - Listar productos (público)
 * - GET /api/products/:id - Obtener producto por ID (público)
 * - PATCH /api/products/:id - Actualizar producto (solo admin)
 * - PUT /api/products/:id - Reemplazar producto (solo admin)
 * - DELETE /api/products/:id - Eliminar producto (solo admin)
 */
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Crear nuevo producto (solo administradores)
   * 
   * @example
   * POST /api/products
   * Authorization: Bearer <JWT_TOKEN>
   * {
   *   "nombre": "Cappuccino",
   *   "descripcion": "Café espresso con leche vaporizada",
   *   "precio": 8.50,
   *   "categoryId": 1,
   *   "imagenUrl": "https://example.com/cappuccino.jpg",
   *   "stock": 50,
   *   "disponible": true
   * }
   * 
   * Response:
   * {
   *   "status": "success",
   *   "code": 201,
   *   "data": {
   *     "id": 1,
   *     "nombre": "Cappuccino",
   *     "descripcion": "Café espresso con leche vaporizada",
   *     "precio": 8.50,
   *     "imagenUrl": "https://example.com/cappuccino.jpg",
   *     "stock": 50,
   *     "disponible": true,
   *     "categoria": {
   *       "id": 1,
   *       "nombre": "Bebidas Calientes"
   *     }
   *   }
   * }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  /**
   * Listar todos los productos (público)
   * 
   * @example
   * GET /api/products
   * 
   * Response:
   * {
   *   "status": "success",
   *   "code": 200,
   *   "data": [
   *     {
   *       "id": 1,
   *       "nombre": "Cappuccino",
   *       "descripcion": "Café espresso con leche vaporizada",
   *       "precio": 8.50,
   *       "imagenUrl": "https://example.com/cappuccino.jpg",
   *       "stock": 50,
   *       "disponible": true,
   *       "categoria": {
   *         "id": 1,
   *         "nombre": "Bebidas Calientes"
   *       }
   *     }
   *   ]
   * }
   */
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  /**
   * Obtener producto por ID (público)
   * 
   * @example
   * GET /api/products/1
   * 
   * Response:
   * {
   *   "status": "success",
   *   "code": 200,
   *   "data": {
   *     "id": 1,
   *     "nombre": "Cappuccino",
   *     "descripcion": "Café espresso con leche vaporizada",
   *     "precio": 8.50,
   *     "imagenUrl": "https://example.com/cappuccino.jpg",
   *     "stock": 50,
   *     "disponible": true,
   *     "categoria": {
   *       "id": 1,
   *       "nombre": "Bebidas Calientes"
   *     }
   *   }
   * }
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  /**
   * Actualizar producto parcialmente (solo administradores)
   * 
   * @example
   * PATCH /api/products/1
   * Authorization: Bearer <JWT_TOKEN>
   * {
   *   "precio": 9.00,
   *   "stock": 30
   * }
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  /**
   * Reemplazar producto completo (solo administradores)
   * 
   * @example
   * PUT /api/products/1
   * Authorization: Bearer <JWT_TOKEN>
   * {
   *   "nombre": "Cappuccino Premium",
   *   "descripcion": "Café espresso premium con leche artesanal",
   *   "precio": 12.00,
   *   "categoryId": 1,
   *   "imagenUrl": "https://example.com/cappuccino-premium.jpg",
   *   "stock": 25,
   *   "disponible": true
   * }
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  replace(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateProductDto) {
    return this.productsService.replace(id, dto);
  }

  /**
   * Eliminar producto (solo administradores)
   * 
   * @example
   * DELETE /api/products/1
   * Authorization: Bearer <JWT_TOKEN>
   * 
   * Response:
   * {
   *   "status": "success",
   *   "code": 200,
   *   "data": {
   *     "message": "Producto 1 eliminado exitosamente"
   *   }
   * }
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}