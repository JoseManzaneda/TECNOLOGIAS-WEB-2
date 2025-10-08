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
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * Controlador de pedidos
 * 
 * Endpoints disponibles:
 * - POST /api/pedidos - Crear pedido (autenticados)
 * - GET /api/pedidos - Listar pedidos (admin: todos, cliente: propios)
 * - GET /api/pedidos/estadisticas - Obtener estadísticas de pedidos (solo admin)
 * - GET /api/pedidos/:id - Obtener pedido por ID (admin o propietario)
 * - GET /api/pedidos/user/:userId - Obtener pedidos de un usuario (admin o el mismo usuario)
 * - PATCH /api/pedidos/:id - Actualizar estado de pedido (admin puede todo, cliente solo cancelar propio)
 * - DELETE /api/pedidos/:id - Eliminar pedido (solo admin)
 */
@Controller('pedidos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  /**
   * Crear nuevo pedido
   * 
   * @example
   * POST /api/pedidos
   * Authorization: Bearer <JWT_TOKEN>
   * {
   *   "metodoPago": "tarjeta",
   *   "detalles": [
   *     {
   *       "productoId": 1,
   *       "cantidad": 2
   *     },
   *     {
   *       "productoId": 3,
   *       "cantidad": 1
   *     }
   *   ]
   * }
   */
  @Post()
  @HttpCode(201)
  create(@Body() dto: CreatePedidoDto, @Request() req: any) {
    return this.pedidosService.create(dto, req.user.id);
  }

  /**
   * Listar pedidos
   * Admin: ve todos los pedidos
   * Cliente: ve solo sus propios pedidos
   * 
   * @example
   * GET /api/pedidos
   * Authorization: Bearer <JWT_TOKEN>
   */
  @Get()
  findAll(@Request() req: any) {
    return this.pedidosService.findAll(req.user);
  }

  /**
   * Obtener estadísticas de pedidos (solo administradores)
   * 
   * @example
   * GET /api/pedidos/estadisticas
   * Authorization: Bearer <JWT_TOKEN>
   */
  @Get('estadisticas')
  @Roles('admin')
  getEstadisticas(@Request() req: any) {
    return this.pedidosService.getEstadisticas(req.user);
  }

  /**
   * Obtener pedido por ID (admin o propietario)
   * 
   * @example
   * GET /api/pedidos/1
   * Authorization: Bearer <JWT_TOKEN>
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.pedidosService.findOne(id, req.user);
  }

  /**
   * Obtener pedidos de un usuario específico (admin o el mismo usuario)
   * 
   * @example
   * GET /api/pedidos/user/1
   * Authorization: Bearer <JWT_TOKEN>
   */
  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number, @Request() req: any) {
    return this.pedidosService.findByUser(userId, req.user);
  }

  /**
   * Actualizar estado de pedido
   * Admin: puede cambiar cualquier estado
   * Cliente: solo puede cancelar su propio pedido si está pendiente
   * 
   * @example
   * PATCH /api/pedidos/1
   * Authorization: Bearer <JWT_TOKEN>
   * {
   *   "estado": "en_preparacion"
   * }
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePedidoDto,
    @Request() req: any,
  ) {
    return this.pedidosService.update(id, dto, req.user);
  }

  /**
   * Eliminar pedido (solo administradores)
   * 
   * @example
   * DELETE /api/pedidos/1
   * Authorization: Bearer <JWT_TOKEN>
   */
  @Delete(':id')
  @HttpCode(200)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.pedidosService.remove(id, req.user);
  }
}