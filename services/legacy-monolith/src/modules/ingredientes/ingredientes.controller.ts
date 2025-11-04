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
  Query,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { IngredientesService } from './ingredientes.service';
import { CreateIngredienteDto } from './dto/create-ingrediente.dto';
import { UpdateIngredienteDto } from './dto/update-ingrediente.dto';

/**
 * Controlador para la gestión de ingredientes
 * 
 * Endpoints disponibles:
 * - POST /ingredientes - Crear ingrediente (solo admin)
 * - GET /ingredientes - Listar todos los ingredientes
 * - GET /ingredientes/estadisticas - Obtener estadísticas (solo admin)
 * - GET /ingredientes/buscar?nombre=valor - Buscar por nombre
 * - GET /ingredientes/:id - Obtener ingrediente específico
 * - PATCH /ingredientes/:id - Actualizar ingrediente (solo admin)
 * - DELETE /ingredientes/:id - Eliminar ingrediente (solo admin)
 */
@ApiTags('ingredientes')
@ApiBearerAuth()
@Controller('ingredientes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IngredientesController {
  constructor(private readonly ingredientesService: IngredientesService) {}

  /**
   * Crear un nuevo ingrediente
   * 
   * @route POST /ingredientes
   * @access Admin
   * @param createIngredienteDto - Datos del ingrediente a crear
   * @param currentUser - Usuario autenticado
   * @returns Ingrediente creado
   * 
   * @example
   * POST /ingredientes
   * {
   *   "nombre": "Café molido",
   *   "unidad": "gramos"
   * }
   * 
   * Response:
   * {
   *   "id": 1,
   *   "nombre": "Café molido",
   *   "unidad": "gramos",
   *   "fechaCreacion": "2024-01-15T10:30:00Z",
   *   "fechaActualizacion": "2024-01-15T10:30:00Z"
   * }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('admin')
  create(@Body() createIngredienteDto: CreateIngredienteDto, @Request() req: any) {
    return this.ingredientesService.create(createIngredienteDto, req.user);
  }

  /**
   * Obtener todos los ingredientes
   * 
   * @route GET /ingredientes
   * @access Admin, Cliente
   * @param currentUser - Usuario autenticado
   * @returns Lista de ingredientes ordenada alfabéticamente
   * 
   * @example
   * GET /ingredientes
   * 
   * Response:
   * [
   *   {
   *     "id": 1,
   *     "nombre": "Azúcar",
   *     "unidad": "gramos",
   *     "fechaCreacion": "2024-01-15T10:30:00Z",
   *     "fechaActualizacion": "2024-01-15T10:30:00Z"
   *   },
   *   {
   *     "id": 2,
   *     "nombre": "Café molido",
   *     "unidad": "gramos",
   *     "fechaCreacion": "2024-01-15T11:00:00Z",
   *     "fechaActualizacion": "2024-01-15T11:00:00Z"
   *   }
   * ]
   */
  @Get()
  findAll(@Request() req: any) {
    return this.ingredientesService.findAll(req.user);
  }

  /**
   * Obtener estadísticas de ingredientes
   * 
   * @route GET /ingredientes/estadisticas
   * @access Admin
   * @param currentUser - Usuario autenticado (debe ser admin)
   * @returns Estadísticas detalladas de ingredientes
   * 
   * @example
   * GET /ingredientes/estadisticas
   * 
   * Response:
   * {
   *   "totalIngredientes": 25,
   *   "ingredientesSinUnidad": 3,
   *   "ingredientesPorUnidad": [
   *     {
   *       "unidad": "gramos",
   *       "cantidad": 15
   *     },
   *     {
   *       "unidad": "mililitros",
   *       "cantidad": 7
   *     }
   *   ]
   * }
   */
  @Get('estadisticas')
  @Roles('admin')
  getEstadisticas(@Request() req: any) {
    return this.ingredientesService.getEstadisticas(req.user);
  }

  /**
   * Buscar ingredientes por nombre
   * 
   * @route GET /ingredientes/buscar?nombre=valor
   * @access Admin, Cliente
   * @param nombre - Nombre a buscar (búsqueda parcial)
   * @param currentUser - Usuario autenticado
   * @returns Lista de ingredientes que coinciden con la búsqueda
   * 
   * @example
   * GET /ingredientes/buscar?nombre=café
   * 
   * Response:
   * [
   *   {
   *     "id": 2,
   *     "nombre": "Café molido",
   *     "unidad": "gramos",
   *     "fechaCreacion": "2024-01-15T11:00:00Z",
   *     "fechaActualizacion": "2024-01-15T11:00:00Z"
   *   },
   *   {
   *     "id": 8,
   *     "nombre": "Café en grano",
   *     "unidad": "gramos",
   *     "fechaCreacion": "2024-01-16T09:15:00Z",
   *     "fechaActualizacion": "2024-01-16T09:15:00Z"
   *   }
   * ]
   */
  @Get('buscar')
  findByNombre(@Query('nombre') nombre: string, @Request() req: any) {
    return this.ingredientesService.findByNombre(nombre, req.user);
  }

  /**
   * Obtener un ingrediente específico por ID
   * 
   * @route GET /ingredientes/:id
   * @access Admin, Cliente
   * @param id - ID del ingrediente
   * @param currentUser - Usuario autenticado
   * @returns Ingrediente solicitado
   * 
   * @example
   * GET /ingredientes/1
   * 
   * Response:
   * {
   *   "id": 1,
   *   "nombre": "Azúcar",
   *   "unidad": "gramos",
   *   "fechaCreacion": "2024-01-15T10:30:00Z",
   *   "fechaActualizacion": "2024-01-15T10:30:00Z"
   * }
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.ingredientesService.findOne(id, req.user);
  }

  /**
   * Actualizar un ingrediente existente
   * 
   * @route PATCH /ingredientes/:id
   * @access Admin
   * @param id - ID del ingrediente a actualizar
   * @param updateIngredienteDto - Datos a actualizar
   * @param currentUser - Usuario autenticado (debe ser admin)
   * @returns Ingrediente actualizado
   * 
   * @example
   * PATCH /ingredientes/1
   * {
   *   "nombre": "Azúcar refinada",
   *   "unidad": "kilogramos"
   * }
   * 
   * Response:
   * {
   *   "id": 1,
   *   "nombre": "Azúcar refinada",
   *   "unidad": "kilogramos",
   *   "fechaCreacion": "2024-01-15T10:30:00Z",
   *   "fechaActualizacion": "2024-01-20T14:45:00Z"
   * }
   */
  @Patch(':id')
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateIngredienteDto: UpdateIngredienteDto,
    @Request() req: any,
  ) {
    return this.ingredientesService.update(id, updateIngredienteDto, req.user);
  }

  /**
   * Eliminar un ingrediente
   * 
   * @route DELETE /ingredientes/:id
   * @access Admin
   * @param id - ID del ingrediente a eliminar
   * @param currentUser - Usuario autenticado (debe ser admin)
   * @returns Confirmación de eliminación
   * 
   * @example
   * DELETE /ingredientes/1
   * 
   * Response:
   * {
   *   "message": "Ingrediente eliminado exitosamente"
   * }
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    await this.ingredientesService.remove(id, req.user);
    return { message: 'Ingrediente eliminado exitosamente' };
  }
}