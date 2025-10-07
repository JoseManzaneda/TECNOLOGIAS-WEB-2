import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Put, HttpCode, UseGuards, HttpStatus } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * Controlador de categorías
 * 
 * Endpoints disponibles:
 * - POST /api/categories - Crear categoría (solo admin)
 * - GET /api/categories - Listar categorías (público)
 * - GET /api/categories/:id - Obtener categoría por ID (público)
 * - PATCH /api/categories/:id - Actualizar categoría (solo admin)
 * - PUT /api/categories/:id - Reemplazar categoría (solo admin)
 * - DELETE /api/categories/:id - Eliminar categoría (solo admin)
 */
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Crear nueva categoría (solo administradores)
   * 
   * @example
   * POST /api/categories
   * Authorization: Bearer <JWT_TOKEN>
   * {
   *   "nombre": "Bebidas Calientes",
   *   "descripcion": "Cafés, tés y otras bebidas calientes"
   * }
   * 
   * Response:
   * {
   *   "status": "success",
   *   "code": 201,
   *   "data": {
   *     "id": 1,
   *     "nombre": "Bebidas Calientes",
   *     "descripcion": "Cafés, tés y otras bebidas calientes"
   *   }
   * }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  /**
   * Listar todas las categorías (público)
   * 
   * @example
   * GET /api/categories
   * 
   * Response:
   * {
   *   "status": "success",
   *   "code": 200,
   *   "data": [
   *     {
   *       "id": 1,
   *       "nombre": "Bebidas Calientes",
   *       "descripcion": "Cafés, tés y otras bebidas calientes",
   *       "productos": []
   *     }
   *   ]
   * }
   */
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  /**
   * Obtener categoría por ID (público)
   * 
   * @example
   * GET /api/categories/1
   * 
   * Response:
   * {
   *   "status": "success",
   *   "code": 200,
   *   "data": {
   *     "id": 1,
   *     "nombre": "Bebidas Calientes",
   *     "descripcion": "Cafés, tés y otras bebidas calientes",
   *     "productos": []
   *   }
   * }
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  /**
   * Actualizar categoría parcialmente (solo administradores)
   * 
   * @example
   * PATCH /api/categories/1
   * Authorization: Bearer <JWT_TOKEN>
   * {
   *   "descripcion": "Nueva descripción"
   * }
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  /**
   * Reemplazar categoría completa (solo administradores)
   * 
   * @example
   * PUT /api/categories/1
   * Authorization: Bearer <JWT_TOKEN>
   * {
   *   "nombre": "Bebidas Frías",
   *   "descripcion": "Jugos, refrescos y bebidas frías"
   * }
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  replace(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.replace(id, dto);
  }

  /**
   * Eliminar categoría (solo administradores)
   * 
   * @example
   * DELETE /api/categories/1
   * Authorization: Bearer <JWT_TOKEN>
   * 
   * Response:
   * {
   *   "status": "success",
   *   "code": 200,
   *   "data": null
   * }
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}