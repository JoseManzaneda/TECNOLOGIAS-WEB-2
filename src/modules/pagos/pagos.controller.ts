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
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * Controlador de pagos
 * 
 * Endpoints disponibles:
 * - POST /api/pagos - Crear pago (autenticados)
 * - GET /api/pagos - Listar pagos (admin: todos, cliente: propios)
 * - GET /api/pagos/estadisticas - Obtener estadísticas de pagos (solo admin)
 * - GET /api/pagos/:id - Obtener pago por ID (admin o propietario)
 * - GET /api/pagos/pedido/:pedidoId - Obtener pagos de un pedido (admin o propietario del pedido)
 * - PATCH /api/pagos/:id - Actualizar pago (admin puede todo, cliente solo monto/método en pendientes)
 * - PATCH /api/pagos/:id/procesar - Procesar pago (solo admin)
 * - DELETE /api/pagos/:id - Eliminar pago (solo admin)
 */
@Controller('pagos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  /**
   * Crear nuevo pago
   * 
   * @example
   * POST /api/pagos
   * Authorization: Bearer <JWT_TOKEN>
   * {
   *   "pedidoId": 1,
   *   "monto": 150.75,
   *   "metodo": "tarjeta"
   * }
   */
  @Post()
  @HttpCode(201)
  create(@Body() dto: CreatePagoDto, @Request() req: any) {
    return this.pagosService.create(dto, req.user);
  }

  /**
   * Listar pagos
   * Admin: ve todos los pagos con información del pedido y usuario
   * Cliente: ve solo pagos de sus propios pedidos
   * 
   * @example
   * GET /api/pagos
   * Authorization: Bearer <JWT_TOKEN>
   */
  @Get()
  findAll(@Request() req: any) {
    return this.pagosService.findAll(req.user);
  }

  /**
   * Obtener estadísticas de pagos (solo administradores)
   * 
   * @example
   * GET /api/pagos/estadisticas
   * Authorization: Bearer <JWT_TOKEN>
   */
  @Get('estadisticas')
  @Roles('admin')
  getEstadisticas(@Request() req: any) {
    return this.pagosService.getEstadisticas(req.user);
  }

  /**
   * Obtener pago por ID (admin o propietario del pedido)
   * 
   * @example
   * GET /api/pagos/1
   * Authorization: Bearer <JWT_TOKEN>
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.pagosService.findOne(id, req.user);
  }

  /**
   * Obtener pagos de un pedido específico (admin o propietario del pedido)
   * 
   * @example
   * GET /api/pagos/pedido/1
   * Authorization: Bearer <JWT_TOKEN>
   */
  @Get('pedido/:pedidoId')
  findByPedido(@Param('pedidoId', ParseIntPipe) pedidoId: number, @Request() req: any) {
    return this.pagosService.findByPedido(pedidoId, req.user);
  }

  /**
   * Actualizar pago
   * Admin: puede cambiar cualquier campo incluyendo estado
   * Cliente: solo puede cambiar monto y método en pagos pendientes de sus pedidos
   * 
   * @example
   * PATCH /api/pagos/1
   * Authorization: Bearer <JWT_TOKEN>
   * {
   *   "monto": 200.00,
   *   "estado": "completado"
   * }
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePagoDto,
    @Request() req: any,
  ) {
    return this.pagosService.update(id, dto, req.user);
  }

  /**
   * Procesar pago (cambiar estado a completado o fallido según simulación)
   * Solo administradores pueden procesar pagos
   * 
   * @example
   * PATCH /api/pagos/1/procesar
   * Authorization: Bearer <JWT_TOKEN>
   */
  @Patch(':id/procesar')
  @Roles('admin')
  procesarPago(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.pagosService.procesarPago(id, req.user);
  }

  /**
   * Eliminar pago (solo administradores)
   * No se pueden eliminar pagos completados
   * 
   * @example
   * DELETE /api/pagos/1
   * Authorization: Bearer <JWT_TOKEN>
   */
  @Delete(':id')
  @HttpCode(200)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.pagosService.remove(id, req.user);
  }
}