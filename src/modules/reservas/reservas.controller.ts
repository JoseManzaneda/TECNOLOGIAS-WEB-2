import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { CreateReservasDto } from './dto/create-reservas.dto';
import { UpdateReservasDto } from './dto/update-reservas.dto';
import { CambiarEstadoReservaDto } from './dto/cambiar-estado-reserva.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * Controlador REST para gestión de reservas de mesa
 * 
 * Proporciona endpoints para todas las operaciones relacionadas con reservas:
 * - CRUD completo de reservas con validaciones de negocio
 * - Gestión de estados (pendiente/confirmada/cancelada)
 * - Consultas filtradas por estado, fecha, usuario
 * - Estadísticas del sistema (solo admin)
 * - Control de acceso basado en roles
 * 
 * Todos los endpoints requieren autenticación JWT.
 * Los permisos varían según el rol del usuario:
 * - Admin: Acceso completo a todas las funcionalidades
 * - Cliente: Solo puede gestionar sus propias reservas
 * 
 * Base URL: /api/reservas
 */
@Controller('reservas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  /**
   * Crear una nueva reserva
   * 
   * Permite a los usuarios crear reservas de mesa con validaciones completas
   * de disponibilidad, horarios y reglas de negocio.
   * 
   * Validaciones aplicadas:
   * - Fecha futura con mínimo 24 horas de anticipación
   * - Horario dentro del rango de atención (08:00-22:00)
   * - Disponibilidad del horario solicitado
   * - Límites de capacidad (1-12 personas)
   * - Usuario válido y activo
   * 
   * @param createReservasDto - Datos de la nueva reserva
   * @param req - Request object con información del usuario autenticado
   * @returns Promise<Reservas> - La reserva creada
   * 
   * @example
   * POST /api/reservas
   * {
   *   "userId": 5,
   *   "fechaReserva": "2024-12-25",
   *   "hora": "19:30",
   *   "numPersonas": 4
   * }
   * 
   * @example Respuesta exitosa
   * {
   *   "id": 1,
   *   "userId": 5,
   *   "fechaReserva": "2024-12-25",
   *   "hora": "19:30",
   *   "numPersonas": 4,
   *   "estado": "pendiente",
   *   "fechaCreacion": "2024-10-07T10:30:00.000Z",
   *   "fechaActualizacion": "2024-10-07T10:30:00.000Z"
   * }
   */
  @Post()
  @Roles('admin', 'cliente')
  async create(
    @Body() createReservasDto: CreateReservasDto,
    @Request() req: any,
  ) {
    return await this.reservasService.create(createReservasDto, req.user);
  }

  /**
   * Obtener todas las reservas con filtros opcionales
   * 
   * Admins: Pueden ver todas las reservas del sistema
   * Clientes: Solo ven sus propias reservas
   * 
   * Filtros disponibles:
   * - estado: Filtrar por estado (pendiente/confirmada/cancelada)
   * - fecha: Filtrar por fecha específica (YYYY-MM-DD)
   * 
   * @param req - Request object con información del usuario
   * @param estado - Filtro opcional por estado
   * @param fecha - Filtro opcional por fecha
   * @returns Promise<Reservas[]> - Lista de reservas
   * 
   * @example
   * GET /api/reservas
   * GET /api/reservas?estado=pendiente
   * GET /api/reservas?fecha=2024-12-25
   * GET /api/reservas?estado=confirmada&fecha=2024-12-25
   */
  @Get()
  @Roles('admin', 'cliente')
  async findAll(
    @Request() req: any,
    @Query('estado') estado?: string,
    @Query('fecha') fecha?: string,
  ) {
    return await this.reservasService.findAll(req.user, estado, fecha);
  }

  /**
   * Obtener las reservas del usuario autenticado
   * 
   * Endpoint específico para que los clientes puedan ver sus propias reservas
   * de forma más directa, sin necesidad de filtros adicionales.
   * 
   * @param req - Request object con información del usuario
   * @param estado - Filtro opcional por estado
   * @returns Promise<Reservas[]> - Reservas del usuario autenticado
   * 
   * @example
   * GET /api/reservas/mis-reservas
   * GET /api/reservas/mis-reservas?estado=confirmada
   * 
   * @example Respuesta
   * [
   *   {
   *     "id": 1,
   *     "userId": 5,
   *     "fechaReserva": "2024-12-25",
   *     "hora": "19:30",
   *     "numPersonas": 4,
   *     "estado": "confirmada",
   *     "fechaCreacion": "2024-10-07T10:30:00.000Z",
   *     "user": {
   *       "id": 5,
   *       "nombre": "María García",
   *       "email": "maria@example.com"
   *     }
   *   }
   * ]
   */
  @Get('mis-reservas')
  @Roles('cliente', 'admin')
  async getMisReservas(
    @Request() req: any,
    @Query('estado') estado?: string,
  ) {
    return await this.reservasService.getMisReservas(req.user, estado);
  }

  /**
   * Obtener estadísticas del sistema de reservas
   * 
   * Endpoint exclusivo para administradores que proporciona métricas
   * y estadísticas del sistema de reservas para análisis y reporting.
   * 
   * Métricas incluidas:
   * - Total de reservas en el sistema
   * - Distribución por estados (pendiente/confirmada/cancelada)
   * - Reservas para hoy y futuras
   * - Promedio de personas por reserva
   * 
   * @param req - Request object con información del usuario admin
   * @returns Promise<object> - Estadísticas del sistema
   * 
   * @example
   * GET /api/reservas/estadisticas
   * 
   * @example Respuesta
   * {
   *   "totalReservas": 150,
   *   "reservasPendientes": 25,
   *   "reservasConfirmadas": 98,
   *   "reservasCanceladas": 27,
   *   "reservasHoy": 8,
   *   "reservasFuturas": 45,
   *   "promedioPersonasPorReserva": 3.2
   * }
   */
  @Get('estadisticas')
  @Roles('admin')
  async getEstadisticas(@Request() req: any) {
    return await this.reservasService.getEstadisticas(req.user);
  }

  /**
   * Obtener una reserva específica por ID
   * 
   * Admins: Pueden ver cualquier reserva
   * Clientes: Solo pueden ver sus propias reservas
   * 
   * @param id - ID único de la reserva
   * @param req - Request object con información del usuario
   * @returns Promise<Reservas> - La reserva encontrada
   * 
   * @example
   * GET /api/reservas/1
   * 
   * @example Respuesta exitosa
   * {
   *   "id": 1,
   *   "userId": 5,
   *   "fechaReserva": "2024-12-25",
   *   "hora": "19:30",
   *   "numPersonas": 4,
   *   "estado": "confirmada",
   *   "fechaCreacion": "2024-10-07T10:30:00.000Z",
   *   "fechaActualizacion": "2024-10-07T11:15:00.000Z",
   *   "user": {
   *     "id": 5,
   *     "nombre": "María García",
   *     "email": "maria@example.com",
   *     "telefono": "+1234567890"
   *   }
   * }
   */
  @Get(':id')
  @Roles('admin', 'cliente')
  async findOne(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: number,
    @Request() req: any,
  ) {
    return await this.reservasService.findOne(id, req.user);
  }

  /**
   * Cambiar el estado de una reserva
   * 
   * Permite cambiar el estado de una reserva específica.
   * 
   * Permisos:
   * - Admin: Puede cambiar cualquier reserva a cualquier estado
   * - Cliente: Solo puede cancelar sus propias reservas
   * 
   * Estados válidos: "confirmada", "cancelada"
   * 
   * @param id - ID de la reserva
   * @param cambiarEstadoDto - Nuevo estado y motivo opcional
   * @param req - Request object con información del usuario
   * @returns Promise<Reservas> - La reserva con estado actualizado
   * 
   * @example
   * PATCH /api/reservas/1/estado
   * {
   *   "estado": "confirmada",
   *   "motivo": "Mesa confirmada para la fecha solicitada"
   * }
   * 
   * @example Para cancelar (cliente o admin)
   * PATCH /api/reservas/1/estado
   * {
   *   "estado": "cancelada",
   *   "motivo": "El cliente canceló por cambio de planes"
   * }
   */
  @Patch(':id/estado')
  @Roles('admin', 'cliente')
  async cambiarEstado(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: number,
    @Body() cambiarEstadoDto: CambiarEstadoReservaDto,
    @Request() req: any,
  ) {
    return await this.reservasService.cambiarEstado(id, cambiarEstadoDto, req.user);
  }

  /**
   * Actualizar una reserva existente
   * 
   * Permite modificar los detalles de una reserva existente.
   * Solo se pueden actualizar reservas futuras y no canceladas.
   * 
   * Restricciones:
   * - Solo reservas en estado "pendiente" o "confirmada"
   * - Solo reservas futuras (no pasadas)
   * - Admin: Puede actualizar cualquier reserva
   * - Cliente: Solo sus propias reservas
   * 
   * @param id - ID de la reserva a actualizar
   * @param updateReservasDto - Campos a actualizar (parciales)
   * @param req - Request object con información del usuario
   * @returns Promise<Reservas> - La reserva actualizada
   * 
   * @example Cambiar fecha y hora
   * PATCH /api/reservas/1
   * {
   *   "fechaReserva": "2024-12-30",
   *   "hora": "20:00"
   * }
   * 
   * @example Cambiar solo número de personas
   * PATCH /api/reservas/1
   * {
   *   "numPersonas": 6
   * }
   * 
   * @example Admin cambiando estado
   * PATCH /api/reservas/1
   * {
   *   "estado": "confirmada",
   *   "numPersonas": 8
   * }
   */
  @Patch(':id')
  @Roles('admin', 'cliente')
  async update(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: number,
    @Body() updateReservasDto: UpdateReservasDto,
    @Request() req: any,
  ) {
    return await this.reservasService.update(id, updateReservasDto, req.user);
  }

  /**
   * Cancelar (eliminar) una reserva
   * 
   * Cancela una reserva cambiando su estado a "cancelada".
   * No se realiza eliminación física del registro para mantener
   * el historial y auditoría.
   * 
   * Restricciones:
   * - Solo reservas futuras pueden ser canceladas
   * - No se pueden cancelar reservas ya canceladas
   * - Admin: Puede cancelar cualquier reserva
   * - Cliente: Solo sus propias reservas
   * 
   * @param id - ID de la reserva a cancelar
   * @param req - Request object con información del usuario
   * @returns Promise<{message: string}> - Mensaje de confirmación
   * 
   * @example
   * DELETE /api/reservas/1
   * 
   * @example Respuesta exitosa
   * {
   *   "message": "Reserva cancelada exitosamente"
   * }
   */
  @Delete(':id')
  @Roles('admin', 'cliente')
  async remove(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: number,
    @Request() req: any,
  ) {
    await this.reservasService.remove(id, req.user);
    return { message: 'Reserva cancelada exitosamente' };
  }
}