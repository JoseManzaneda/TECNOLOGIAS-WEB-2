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
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PuntosService } from './puntos.service';
import { CreatePuntosDto } from './dto/create-puntos.dto';
import { UpdatePuntosDto } from './dto/update-puntos.dto';
import { AgregarPuntosDto } from './dto/agregar-puntos.dto';
import { CanjearPuntosDto } from './dto/canjear-puntos.dto';

/**
 * Controlador para la gestión del sistema de puntos de fidelidad
 * 
 * Endpoints disponibles:
 * - POST /puntos - Crear registro de puntos (solo admin)
 * - GET /puntos - Listar todos los registros (solo admin)
 * - GET /puntos/mis-puntos - Obtener mis puntos (usuario autenticado)
 * - GET /puntos/ranking - Ranking de usuarios con más puntos (solo admin)
 * - GET /puntos/estadisticas - Estadísticas del sistema (solo admin)
 * - GET /puntos/usuario/:userId - Puntos de un usuario específico
 * - POST /puntos/usuario/:userId/agregar - Agregar puntos (solo admin)
 * - POST /puntos/usuario/:userId/canjear - Canjear puntos
 * - GET /puntos/:id - Obtener registro específico
 * - PATCH /puntos/:id - Actualizar registro (solo admin)
 * - DELETE /puntos/:id - Eliminar registro (solo admin)
 */
@ApiTags('puntos')
@ApiBearerAuth()
@Controller('puntos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PuntosController {
  constructor(private readonly puntosService: PuntosService) {}

  /**
   * Crear un nuevo registro de puntos
   * 
   * @route POST /puntos
   * @access Admin
   * @param createDto - Datos del registro de puntos a crear
   * @param req - Request con usuario autenticado
   * @returns Registro de puntos creado
   * 
   * @example
   * POST /puntos
   * {
   *   "userId": 5,
   *   "puntosAcumulados": 150
   * }
   * 
   * Response:
   * {
   *   "id": 1,
   *   "userId": 5,
   *   "puntosAcumulados": 150,
   *   "ultimaActualizacion": "2024-01-15T10:30:00Z",
   *   "fechaCreacion": "2024-01-15T10:30:00Z",
   *   "fechaActualizacion": "2024-01-15T10:30:00Z"
   * }
   */
  @Post()
  @Roles('admin')
  create(@Body() createDto: CreatePuntosDto, @Request() req: any) {
    return this.puntosService.create(createDto, req.user);
  }

  /**
   * Obtener todos los registros de puntos
   * 
   * @route GET /puntos
   * @access Admin
   * @param req - Request con usuario autenticado
   * @returns Lista de registros ordenados por puntos descendente
   * 
   * @example
   * GET /puntos
   * 
   * Response:
   * [
   *   {
   *     "id": 1,
   *     "userId": 5,
   *     "puntosAcumulados": 1250,
   *     "ultimaActualizacion": "2024-01-20T14:30:00Z",
   *     "fechaCreacion": "2024-01-15T10:30:00Z",
   *     "fechaActualizacion": "2024-01-20T14:30:00Z",
   *     "user": {
   *       "id": 5,
   *       "nombre": "María García",
   *       "email": "maria@example.com",
   *       "rol": "cliente"
   *     }
   *   }
   * ]
   */
  @Get()
  @Roles('admin')
  findAll(@Request() req: any) {
    return this.puntosService.findAll(req.user);
  }

  /**
   * Obtener mis puntos acumulados
   * 
   * @route GET /puntos/mis-puntos
   * @access Admin, Cliente
   * @param req - Request con usuario autenticado
   * @returns Puntos del usuario autenticado
   * 
   * @example
   * GET /puntos/mis-puntos
   * 
   * Response:
   * {
   *   "id": 3,
   *   "userId": 8,
   *   "puntosAcumulados": 750,
   *   "ultimaActualizacion": "2024-01-18T16:45:00Z",
   *   "fechaCreacion": "2024-01-10T09:20:00Z",
   *   "fechaActualizacion": "2024-01-18T16:45:00Z",
   *   "user": {
   *     "id": 8,
   *     "nombre": "Carlos López",
   *     "email": "carlos@example.com",
   *     "rol": "cliente"
   *   }
   * }
   */
  @Get('mis-puntos')
  getMisPuntos(@Request() req: any) {
    return this.puntosService.getMisPuntos(req.user);
  }

  /**
   * Obtener ranking de usuarios con más puntos
   * 
   * @route GET /puntos/ranking?limit=10
   * @access Admin
   * @param limit - Número máximo de resultados (por defecto 10)
   * @param req - Request con usuario autenticado
   * @returns Ranking de usuarios ordenado por puntos
   * 
   * @example
   * GET /puntos/ranking?limit=5
   * 
   * Response:
   * [
   *   {
   *     "id": 1,
   *     "userId": 5,
   *     "puntosAcumulados": 2500,
   *     "ultimaActualizacion": "2024-01-20T10:30:00Z",
   *     "user": {
   *       "id": 5,
   *       "nombre": "María García",
   *       "email": "maria@example.com"
   *     }
   *   },
   *   {
   *     "id": 2,
   *     "userId": 8,
   *     "puntosAcumulados": 1800,
   *     "ultimaActualizacion": "2024-01-19T15:20:00Z",
   *     "user": {
   *       "id": 8,
   *       "nombre": "Carlos López",
   *       "email": "carlos@example.com"
   *     }
   *   }
   * ]
   */
  @Get('ranking')
  @Roles('admin')
  getRanking(@Query('limit', ParseIntPipe) limit: number = 10, @Request() req: any) {
    return this.puntosService.getRanking(req.user, limit);
  }

  /**
   * Obtener estadísticas del sistema de puntos
   * 
   * @route GET /puntos/estadisticas
   * @access Admin
   * @param req - Request con usuario autenticado
   * @returns Estadísticas completas del sistema
   * 
   * @example
   * GET /puntos/estadisticas
   * 
   * Response:
   * {
   *   "totalUsuariosConPuntos": 45,
   *   "usuariosActivos": 38,
   *   "usuariosPremium": 12,
   *   "totalPuntosEnCirculacion": 15750,
   *   "promedioPuntosPorUsuario": 350.0,
   *   "maximoPuntos": 2500,
   *   "minimoPuntos": 0
   * }
   */
  @Get('estadisticas')
  @Roles('admin')
  getEstadisticas(@Request() req: any) {
    return this.puntosService.getEstadisticas(req.user);
  }

  /**
   * Obtener puntos de un usuario específico por ID de usuario
   * 
   * @route GET /puntos/usuario/:userId
   * @access Admin, Cliente (solo sus propios puntos)
   * @param userId - ID del usuario
   * @param req - Request con usuario autenticado
   * @returns Puntos del usuario especificado
   * 
   * @example
   * GET /puntos/usuario/5
   * 
   * Response:
   * {
   *   "id": 1,
   *   "userId": 5,
   *   "puntosAcumulados": 1250,
   *   "ultimaActualizacion": "2024-01-20T14:30:00Z",
   *   "fechaCreacion": "2024-01-15T10:30:00Z",
   *   "fechaActualizacion": "2024-01-20T14:30:00Z",
   *   "user": {
   *     "id": 5,
   *     "nombre": "María García",
   *     "email": "maria@example.com",
   *     "rol": "cliente"
   *   }
   * }
   */
  @Get('usuario/:userId')
  findByUserId(@Param('userId', ParseIntPipe) userId: number, @Request() req: any) {
    return this.puntosService.findByUserId(userId, req.user);
  }

  /**
   * Agregar puntos a un usuario
   * 
   * @route POST /puntos/usuario/:userId/agregar
   * @access Admin
   * @param userId - ID del usuario
   * @param agregarDto - Datos de los puntos a agregar
   * @param req - Request con usuario autenticado
   * @returns Registro de puntos actualizado
   * 
   * @example
   * POST /puntos/usuario/5/agregar
   * {
   *   "puntos": 100,
   *   "descripcion": "Bonificación por cumpleaños"
   * }
   * 
   * Response:
   * {
   *   "id": 1,
   *   "userId": 5,
   *   "puntosAcumulados": 1350,
   *   "ultimaActualizacion": "2024-01-21T10:15:00Z",
   *   "fechaCreacion": "2024-01-15T10:30:00Z",
   *   "fechaActualizacion": "2024-01-21T10:15:00Z"
   * }
   */
  @Post('usuario/:userId/agregar')
  @Roles('admin')
  agregarPuntos(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() agregarDto: AgregarPuntosDto,
    @Request() req: any,
  ) {
    return this.puntosService.agregarPuntos(userId, agregarDto, req.user);
  }

  /**
   * Canjear puntos de un usuario
   * 
   * @route POST /puntos/usuario/:userId/canjear
   * @access Admin, Cliente (solo sus propios puntos)
   * @param userId - ID del usuario
   * @param canjearDto - Datos del canje de puntos
   * @param req - Request con usuario autenticado
   * @returns Registro de puntos actualizado
   * 
   * @example
   * POST /puntos/usuario/5/canjear
   * {
   *   "puntos": 500,
   *   "descripcion": "Descuento 10% en próxima compra"
   * }
   * 
   * Response:
   * {
   *   "id": 1,
   *   "userId": 5,
   *   "puntosAcumulados": 850,
   *   "ultimaActualizacion": "2024-01-21T11:30:00Z",
   *   "fechaCreacion": "2024-01-15T10:30:00Z",
   *   "fechaActualizacion": "2024-01-21T11:30:00Z"
   * }
   */
  @Post('usuario/:userId/canjear')
  canjearPuntos(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() canjearDto: CanjearPuntosDto,
    @Request() req: any,
  ) {
    return this.puntosService.canjearPuntos(userId, canjearDto, req.user);
  }

  /**
   * Obtener un registro de puntos por ID
   * 
   * @route GET /puntos/:id
   * @access Admin, Cliente (solo sus propios puntos)
   * @param id - ID del registro de puntos
   * @param req - Request con usuario autenticado
   * @returns Registro de puntos específico
   * 
   * @example
   * GET /puntos/1
   * 
   * Response:
   * {
   *   "id": 1,
   *   "userId": 5,
   *   "puntosAcumulados": 1250,
   *   "ultimaActualizacion": "2024-01-20T14:30:00Z",
   *   "fechaCreacion": "2024-01-15T10:30:00Z",
   *   "fechaActualizacion": "2024-01-20T14:30:00Z",
   *   "user": {
   *     "id": 5,
   *     "nombre": "María García",
   *     "email": "maria@example.com",
   *     "rol": "cliente"
   *   }
   * }
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.puntosService.findOne(id, req.user);
  }

  /**
   * Actualizar un registro de puntos
   * 
   * @route PATCH /puntos/:id
   * @access Admin
   * @param id - ID del registro de puntos
   * @param updateDto - Datos a actualizar
   * @param req - Request con usuario autenticado
   * @returns Registro de puntos actualizado
   * 
   * @example
   * PATCH /puntos/1
   * {
   *   "puntosAcumulados": 2000
   * }
   * 
   * Response:
   * {
   *   "id": 1,
   *   "userId": 5,
   *   "puntosAcumulados": 2000,
   *   "ultimaActualizacion": "2024-01-21T15:45:00Z",
   *   "fechaCreacion": "2024-01-15T10:30:00Z",
   *   "fechaActualizacion": "2024-01-21T15:45:00Z"
   * }
   */
  @Patch(':id')
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePuntosDto,
    @Request() req: any,
  ) {
    return this.puntosService.update(id, updateDto, req.user);
  }

  /**
   * Eliminar un registro de puntos
   * 
   * @route DELETE /puntos/:id
   * @access Admin
   * @param id - ID del registro de puntos
   * @param req - Request con usuario autenticado
   * @returns Confirmación de eliminación
   * 
   * @example
   * DELETE /puntos/1
   * 
   * Response:
   * {
   *   "message": "Registro de puntos eliminado exitosamente"
   * }
   */
  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    await this.puntosService.remove(id, req.user);
    return { message: 'Registro de puntos eliminado exitosamente' };
  }
}