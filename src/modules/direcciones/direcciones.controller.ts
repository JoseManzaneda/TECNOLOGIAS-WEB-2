import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  HttpCode,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DireccionesService } from './direcciones.service';
import { CreateDireccionDto } from './dto/create-direccion.dto';
import { UpdateDireccionDto } from './dto/update-direccion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * Controlador de direcciones
 * 
 * Endpoints disponibles:
 * - POST /api/direcciones - Crear dirección (autenticados)
 * - GET /api/direcciones - Listar direcciones (admin: todas, cliente: propias)
 * - GET /api/direcciones/:id - Obtener dirección por ID (admin o propietario)
 * - GET /api/direcciones/user/:userId - Obtener direcciones de un usuario (admin o el mismo usuario)
 * - PATCH /api/direcciones/:id - Actualizar dirección (admin o propietario)
 * - DELETE /api/direcciones/:id - Eliminar dirección (admin o propietario)
 */
@Controller('direcciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DireccionesController {
  constructor(private readonly direccionesService: DireccionesService) {}

  /**
   * Crear nueva dirección
   * 
   * @example
   * POST /api/direcciones
   * Authorization: Bearer <JWT_TOKEN>
   * {
   *   "direccion": "Av. Siempre Viva 123, Col. Centro",
   *   "ciudad": "Ciudad de México",
   *   "referencia": "Entre calle A y calle B, casa azul"
   * }
   */
  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateDireccionDto, @Request() req: any) {
    return this.direccionesService.create(dto, req.user.id);
  }

  /**
   * Listar direcciones
   * Admin: ve todas las direcciones
   * Cliente: ve solo sus propias direcciones
   * 
   * @example
   * GET /api/direcciones
   * Authorization: Bearer <JWT_TOKEN>
   */
  @Get()
  findAll(@Request() req: any) {
    return this.direccionesService.findAll(req.user);
  }

  /**
   * Obtener dirección por ID (admin o propietario)
   * 
   * @example
   * GET /api/direcciones/1
   * Authorization: Bearer <JWT_TOKEN>
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.direccionesService.findOne(id, req.user);
  }

  /**
   * Obtener direcciones de un usuario específico (admin o el mismo usuario)
   * 
   * @example
   * GET /api/direcciones/user/1
   * Authorization: Bearer <JWT_TOKEN>
   */
  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number, @Request() req: any) {
    return this.direccionesService.findByUser(userId, req.user);
  }

  /**
   * Actualizar dirección (admin o propietario)
   * 
   * @example
   * PATCH /api/direcciones/1
   * Authorization: Bearer <JWT_TOKEN>
   * {
   *   "ciudad": "Guadalajara",
   *   "referencia": "Nueva referencia actualizada"
   * }
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDireccionDto,
    @Request() req: any,
  ) {
    return this.direccionesService.update(id, dto, req.user);
  }

  /**
   * Eliminar dirección (admin o propietario)
   * 
   * @example
   * DELETE /api/direcciones/1
   * Authorization: Bearer <JWT_TOKEN>
   */
  @Delete(':id')
  @HttpCode(200)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.direccionesService.remove(id, req.user);
  }
}