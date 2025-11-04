import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProductoIngredientesService } from './producto-ingredientes.service';
import { CreateProductoIngredienteDto } from './dto/create-producto-ingrediente.dto';
import { UpdateProductoIngredienteDto } from './dto/update-producto-ingrediente.dto';

/**
 * Controlador para la gestión de relaciones producto-ingredientes
 * 
 * Endpoints disponibles:
 * - POST /producto-ingredientes - Crear relación (solo admin)
 * - POST /producto-ingredientes/multiple/:productoId - Crear múltiples relaciones (solo admin)
 * - GET /producto-ingredientes - Listar todas las relaciones
 * - GET /producto-ingredientes/estadisticas - Obtener estadísticas (solo admin)
 * - GET /producto-ingredientes/producto/:id - Ingredientes de un producto
 * - GET /producto-ingredientes/ingrediente/:id - Productos que usan un ingrediente
 * - GET /producto-ingredientes/:productoId/:ingredienteId - Obtener relación específica
 * - PATCH /producto-ingredientes/:productoId/:ingredienteId - Actualizar relación (solo admin)
 * - DELETE /producto-ingredientes/:productoId/:ingredienteId - Eliminar relación (solo admin)
 */
@ApiTags('producto-ingredientes')
@ApiBearerAuth()
@Controller('producto-ingredientes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductoIngredientesController {
  constructor(private readonly productoIngredientesService: ProductoIngredientesService) {}

  /**
   * Crear una nueva relación producto-ingrediente
   * 
   * @route POST /producto-ingredientes
   * @access Admin
   * @param createDto - Datos de la relación a crear
   * @param req - Request con usuario autenticado
   * @returns Relación creada
   * 
   * @example
   * POST /producto-ingredientes
   * {
   *   "productoId": 1,
   *   "ingredienteId": 2,
   *   "cantidad": 50.5
   * }
   * 
   * Response:
   * {
   *   "productoId": 1,
   *   "ingredienteId": 2,
   *   "cantidad": 50.5,
   *   "fechaCreacion": "2024-01-15T10:30:00Z",
   *   "fechaActualizacion": "2024-01-15T10:30:00Z"
   * }
   */
  @Post()
  @Roles('admin')
  create(@Body() createDto: CreateProductoIngredienteDto, @Request() req: any) {
    return this.productoIngredientesService.create(createDto, req.user);
  }

  /**
   * Crear múltiples relaciones para un producto
   * 
   * @route POST /producto-ingredientes/multiple/:productoId
   * @access Admin
   * @param productoId - ID del producto
   * @param ingredientesData - Array de ingredientes con cantidades
   * @param req - Request con usuario autenticado
   * @returns Array de relaciones creadas
   * 
   * @example
   * POST /producto-ingredientes/multiple/1
   * [
   *   { "ingredienteId": 2, "cantidad": 50 },
   *   { "ingredienteId": 3, "cantidad": 25 },
   *   { "ingredienteId": 4 }
   * ]
   * 
   * Response:
   * [
   *   {
   *     "productoId": 1,
   *     "ingredienteId": 2,
   *     "cantidad": 50,
   *     "fechaCreacion": "2024-01-15T10:30:00Z",
   *     "fechaActualizacion": "2024-01-15T10:30:00Z"
   *   }
   * ]
   */
  @Post('multiple/:productoId')
  @Roles('admin')
  @ApiBody({
    description: 'Lista de ingredientes con sus cantidades para asociar al producto',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ingredienteId: {
            type: 'number',
            description: 'ID del ingrediente',
            example: 2
          },
          cantidad: {
            type: 'number',
            description: 'Cantidad del ingrediente (opcional)',
            example: 50,
            nullable: true
          }
        },
        required: ['ingredienteId']
      }
    },
    examples: {
      ejemploMultiple: {
        summary: 'Asociar múltiples ingredientes',
        value: [
          { ingredienteId: 2, cantidad: 50 },
          { ingredienteId: 5, cantidad: 200 },
          { ingredienteId: 8 }
        ]
      }
    }
  })
  createMultiple(
    @Param('productoId', ParseIntPipe) productoId: number,
    @Body() ingredientesData: Array<{ ingredienteId: number; cantidad?: number }>,
    @Request() req: any,
  ) {
    return this.productoIngredientesService.createMultiple(productoId, ingredientesData, req.user);
  }

  /**
   * Obtener todas las relaciones producto-ingrediente
   * 
   * @route GET /producto-ingredientes
   * @access Admin, Cliente
   * @param req - Request con usuario autenticado
   * @returns Lista de relaciones con productos e ingredientes
   * 
   * @example
   * GET /producto-ingredientes
   * 
   * Response:
   * [
   *   {
   *     "productoId": 1,
   *     "ingredienteId": 2,
   *     "cantidad": 50.5,
   *     "fechaCreacion": "2024-01-15T10:30:00Z",
   *     "fechaActualizacion": "2024-01-15T10:30:00Z",
   *     "producto": {
   *       "id": 1,
   *       "nombre": "Café Americano",
   *       "precio": 3.50
   *     },
   *     "ingrediente": {
   *       "id": 2,
   *       "nombre": "Café molido",
   *       "unidad": "gramos"
   *     }
   *   }
   * ]
   */
  @Get()
  findAll(@Request() req: any) {
    return this.productoIngredientesService.findAll(req.user);
  }

  /**
   * Obtener estadísticas de relaciones producto-ingrediente
   * 
   * @route GET /producto-ingredientes/estadisticas
   * @access Admin
   * @param req - Request con usuario autenticado (debe ser admin)
   * @returns Estadísticas detalladas
   * 
   * @example
   * GET /producto-ingredientes/estadisticas
   * 
   * Response:
   * {
   *   "totalRelaciones": 45,
   *   "relacionesConCantidad": 32,
   *   "relacionesSinCantidad": 13,
   *   "productosConMasIngredientes": [
   *     {
   *       "nombreProducto": "Latte",
   *       "cantidadIngredientes": 5
   *     }
   *   ],
   *   "ingredientesMasUtilizados": [
   *     {
   *       "nombreIngrediente": "Leche",
   *       "cantidadProductos": 8
   *     }
   *   ]
   * }
   */
  @Get('estadisticas')
  @Roles('admin')
  getEstadisticas(@Request() req: any) {
    return this.productoIngredientesService.getEstadisticas(req.user);
  }

  /**
   * Obtener ingredientes de un producto específico
   * 
   * @route GET /producto-ingredientes/producto/:id
   * @access Admin, Cliente
   * @param id - ID del producto
   * @param req - Request con usuario autenticado
   * @returns Lista de ingredientes del producto
   * 
   * @example
   * GET /producto-ingredientes/producto/1
   * 
   * Response:
   * [
   *   {
   *     "productoId": 1,
   *     "ingredienteId": 2,
   *     "cantidad": 15,
   *     "fechaCreacion": "2024-01-15T10:30:00Z",
   *     "fechaActualizacion": "2024-01-15T10:30:00Z",
   *     "ingrediente": {
   *       "id": 2,
   *       "nombre": "Café molido",
   *       "unidad": "gramos"
   *     }
   *   }
   * ]
   */
  @Get('producto/:id')
  findByProducto(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.productoIngredientesService.findByProducto(id, req.user);
  }

  /**
   * Obtener productos que usan un ingrediente específico
   * 
   * @route GET /producto-ingredientes/ingrediente/:id
   * @access Admin, Cliente
   * @param id - ID del ingrediente
   * @param req - Request con usuario autenticado
   * @returns Lista de productos que usan el ingrediente
   * 
   * @example
   * GET /producto-ingredientes/ingrediente/2
   * 
   * Response:
   * [
   *   {
   *     "productoId": 1,
   *     "ingredienteId": 2,
   *     "cantidad": 15,
   *     "fechaCreacion": "2024-01-15T10:30:00Z",
   *     "fechaActualizacion": "2024-01-15T10:30:00Z",
   *     "producto": {
   *       "id": 1,
   *       "nombre": "Café Americano",
   *       "precio": 3.50
   *     }
   *   }
   * ]
   */
  @Get('ingrediente/:id')
  findByIngrediente(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.productoIngredientesService.findByIngrediente(id, req.user);
  }

  /**
   * Obtener una relación específica producto-ingrediente
   * 
   * @route GET /producto-ingredientes/:productoId/:ingredienteId
   * @access Admin, Cliente
   * @param productoId - ID del producto
   * @param ingredienteId - ID del ingrediente
   * @param req - Request con usuario autenticado
   * @returns Relación específica
   * 
   * @example
   * GET /producto-ingredientes/1/2
   * 
   * Response:
   * {
   *   "productoId": 1,
   *   "ingredienteId": 2,
   *   "cantidad": 15,
   *   "fechaCreacion": "2024-01-15T10:30:00Z",
   *   "fechaActualizacion": "2024-01-15T10:30:00Z",
   *   "producto": {
   *     "id": 1,
   *     "nombre": "Café Americano",
   *     "precio": 3.50
   *   },
   *   "ingrediente": {
   *     "id": 2,
   *     "nombre": "Café molido",
   *     "unidad": "gramos"
   *   }
   * }
   */
  @Get(':productoId/:ingredienteId')
  findOne(
    @Param('productoId', ParseIntPipe) productoId: number,
    @Param('ingredienteId', ParseIntPipe) ingredienteId: number,
    @Request() req: any,
  ) {
    return this.productoIngredientesService.findOne(productoId, ingredienteId, req.user);
  }

  /**
   * Actualizar una relación producto-ingrediente existente
   * 
   * @route PATCH /producto-ingredientes/:productoId/:ingredienteId
   * @access Admin
   * @param productoId - ID del producto
   * @param ingredienteId - ID del ingrediente
   * @param updateDto - Datos a actualizar
   * @param req - Request con usuario autenticado (debe ser admin)
   * @returns Relación actualizada
   * 
   * @example
   * PATCH /producto-ingredientes/1/2
   * {
   *   "cantidad": 25.5
   * }
   * 
   * Response:
   * {
   *   "productoId": 1,
   *   "ingredienteId": 2,
   *   "cantidad": 25.5,
   *   "fechaCreacion": "2024-01-15T10:30:00Z",
   *   "fechaActualizacion": "2024-01-20T14:45:00Z"
   * }
   */
  @Patch(':productoId/:ingredienteId')
  @Roles('admin')
  update(
    @Param('productoId', ParseIntPipe) productoId: number,
    @Param('ingredienteId', ParseIntPipe) ingredienteId: number,
    @Body() updateDto: UpdateProductoIngredienteDto,
    @Request() req: any,
  ) {
    return this.productoIngredientesService.update(productoId, ingredienteId, updateDto, req.user);
  }

  /**
   * Eliminar una relación producto-ingrediente
   * 
   * @route DELETE /producto-ingredientes/:productoId/:ingredienteId
   * @access Admin
   * @param productoId - ID del producto
   * @param ingredienteId - ID del ingrediente
   * @param req - Request con usuario autenticado (debe ser admin)
   * @returns Confirmación de eliminación
   * 
   * @example
   * DELETE /producto-ingredientes/1/2
   * 
   * Response:
   * {
   *   "message": "Relación producto-ingrediente eliminada exitosamente"
   * }
   */
  @Delete(':productoId/:ingredienteId')
  @Roles('admin')
  async remove(
    @Param('productoId', ParseIntPipe) productoId: number,
    @Param('ingredienteId', ParseIntPipe) ingredienteId: number,
    @Request() req: any,
  ) {
    await this.productoIngredientesService.remove(productoId, ingredienteId, req.user);
    return { message: 'Relación producto-ingrediente eliminada exitosamente' };
  }
}