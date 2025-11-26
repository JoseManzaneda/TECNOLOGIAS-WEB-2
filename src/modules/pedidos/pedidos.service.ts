import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Pedido, EstadoPedido, MetodoPago } from './entities/pedido.entity';
import { PedidoDetalle } from './entities/pedido-detalle.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { 
  PedidoCreadoEvent, 
  PedidoEstadoActualizadoEvent,
  PedidoCanceladoEvent 
} from '../../shared/events';
import { EventLogger } from '../../shared/utils';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,
    @InjectRepository(PedidoDetalle)
    private readonly pedidoDetalleRepo: Repository<PedidoDetalle>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreatePedidoDto, userId: number) {
    if (!dto.detalles || dto.detalles.length === 0) {
      throw new BadRequestException('El pedido debe incluir al menos un producto');
    }

    // Crear pedido inicial
    const pedido = this.pedidoRepo.create({
      userId,
      metodoPago: dto.metodoPago || MetodoPago.EFECTIVO,
      estado: EstadoPedido.PENDIENTE,
      total: 0,
    });

    const pedidoGuardado = await this.pedidoRepo.save(pedido);

    // Crear detalles y calcular total
    let total = 0;
    const detallesParaEvento: { productoId: number; cantidad: number; precioUnitario: number }[] = [];

    for (const detalle of dto.detalles) {
      if (detalle.cantidad <= 0) {
        throw new BadRequestException('La cantidad debe ser mayor a 0');
      }

      const pedidoDetalle = this.pedidoDetalleRepo.create({
        pedidoId: pedidoGuardado.id,
        productoId: detalle.productoId,
        cantidad: detalle.cantidad,
        precioUnitario: detalle.precioUnitario,
      });
      await this.pedidoDetalleRepo.save(pedidoDetalle);
      total += detalle.precioUnitario * detalle.cantidad;
      detallesParaEvento.push({
        productoId: detalle.productoId,
        cantidad: detalle.cantidad,
        precioUnitario: detalle.precioUnitario,
      });
    }

    pedidoGuardado.total = total;
    await this.pedidoRepo.save(pedidoGuardado);

    // Emitir evento asincrónico para que otro módulo actualice stock
    const event = new PedidoCreadoEvent(
      pedidoGuardado.id,
      userId,
      detallesParaEvento,
      total,
      dto.metodoPago || MetodoPago.EFECTIVO,
    );
    this.eventEmitter.emit('pedido.creado', event);
    EventLogger.logEmit('pedido.creado', event);

    return this.findOne(pedidoGuardado.id, { id: userId, rol: 'admin' }); // Ajustar rol según contexto real
  }

  async findAll(currentUser: any) {
    const queryBuilder = this.pedidoRepo
      .createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.usuario', 'usuario')
      .leftJoinAndSelect('pedido.detalles', 'detalles')
      .leftJoinAndSelect('detalles.producto', 'producto')
      .select([
        'pedido.id', 'pedido.fecha', 'pedido.estado', 'pedido.metodoPago', 'pedido.total',
        'usuario.id', 'usuario.nombre', 'usuario.email',
        'detalles.id', 'detalles.cantidad', 'detalles.precioUnitario',
        'producto.id', 'producto.nombre', 'producto.precio'
      ]);

    // Solo admin puede ver todos los pedidos
    if (currentUser.rol !== 'admin') {
      queryBuilder.where('pedido.userId = :userId', { userId: currentUser.id });
    }

    return queryBuilder
      .orderBy('pedido.fecha', 'DESC')
      .getMany();
  }

  async findOne(id: number, currentUser: any) {
    const pedido = await this.pedidoRepo
      .createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.usuario', 'usuario')
      .leftJoinAndSelect('pedido.detalles', 'detalles')
      .leftJoinAndSelect('detalles.producto', 'producto')
      .select([
        'pedido.id', 'pedido.fecha', 'pedido.estado', 'pedido.metodoPago', 'pedido.total', 'pedido.userId',
        'usuario.id', 'usuario.nombre', 'usuario.email',
        'detalles.id', 'detalles.cantidad', 'detalles.precioUnitario',
        'producto.id', 'producto.nombre', 'producto.precio'
      ])
      .where('pedido.id = :id', { id })
      .getOne();

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    // Verificar autorización: admin puede ver cualquier pedido, cliente solo el suyo
    if (currentUser.rol !== 'admin' && pedido.userId !== currentUser.id) {
      throw new ForbiddenException('No tienes permisos para acceder a este pedido');
    }

    return pedido;
  }

  async findByUser(userId: number, currentUser: any) {
    // Verificar autorización: admin puede ver pedidos de cualquier usuario
    if (currentUser.rol !== 'admin' && userId !== currentUser.id) {
      throw new ForbiddenException('No tienes permisos para acceder a estos pedidos');
    }

    return this.pedidoRepo
      .createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.detalles', 'detalles')
      .leftJoinAndSelect('detalles.producto', 'producto')
      .select([
        'pedido.id', 'pedido.fecha', 'pedido.estado', 'pedido.metodoPago', 'pedido.total',
        'detalles.id', 'detalles.cantidad', 'detalles.precioUnitario',
        'producto.id', 'producto.nombre', 'producto.precio'
      ])
      .where('pedido.userId = :userId', { userId })
      .orderBy('pedido.fecha', 'DESC')
      .getMany();
  }

  async update(id: number, dto: UpdatePedidoDto, currentUser: any) {
    const pedido = await this.pedidoRepo.findOne({ where: { id } });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    // Solo admin puede actualizar cualquier pedido
    // Cliente puede cancelar solo su propio pedido y solo si está pendiente
    if (currentUser.rol !== 'admin') {
      if (pedido.userId !== currentUser.id) {
        throw new ForbiddenException('No tienes permisos para actualizar este pedido');
      }
      
      if (dto.estado && dto.estado !== EstadoPedido.CANCELADO) {
        throw new ForbiddenException('Solo puedes cancelar tu pedido');
      }

      if (pedido.estado !== EstadoPedido.PENDIENTE) {
        throw new BadRequestException('Solo se pueden cancelar pedidos pendientes');
      }
    }

    // Validar transiciones de estado para admin
    if (currentUser.rol === 'admin' && dto.estado) {
      const transicionesValidas: Record<EstadoPedido, EstadoPedido[]> = {
        [EstadoPedido.PENDIENTE]: [EstadoPedido.EN_PREPARACION, EstadoPedido.CANCELADO],
        [EstadoPedido.EN_PREPARACION]: [EstadoPedido.LISTO, EstadoPedido.CANCELADO],
        [EstadoPedido.LISTO]: [EstadoPedido.ENTREGADO],
        [EstadoPedido.ENTREGADO]: [],
        [EstadoPedido.CANCELADO]: []
      };

      const estadosPermitidos = transicionesValidas[pedido.estado];
      if (!estadosPermitidos.includes(dto.estado)) {
        throw new BadRequestException(`No se puede cambiar de ${pedido.estado} a ${dto.estado}`);
      }
    }

    if (dto.estado) {
      const estadoAnterior = pedido.estado;
      pedido.estado = dto.estado;
      if (dto.metodoPago !== undefined) pedido.metodoPago = dto.metodoPago;
      const pedidoActualizado = await this.pedidoRepo.save(pedido);

      const event = new PedidoEstadoActualizadoEvent(
        pedido.id,
        estadoAnterior,
        pedido.estado,
        pedido.userId,
      );
      this.eventEmitter.emit('pedido.estado.actualizado', event);
      EventLogger.logEmit('pedido.estado.actualizado', event);

      if (dto.estado === EstadoPedido.CANCELADO && estadoAnterior !== EstadoPedido.CANCELADO) {
        const detalles = await this.pedidoDetalleRepo.find({ where: { pedidoId: id } });
        const detallesParaEvento = detalles.map(d => ({ productoId: d.productoId, cantidad: d.cantidad }));
        const cancelEvent = new PedidoCanceladoEvent(pedido.id, pedido.userId, detallesParaEvento);
        this.eventEmitter.emit('pedido.cancelado', cancelEvent);
        EventLogger.logEmit('pedido.cancelado', cancelEvent);
      }

      return this.findOne(id, currentUser);
    }

    if (dto.metodoPago !== undefined) {
      pedido.metodoPago = dto.metodoPago;
      await this.pedidoRepo.save(pedido);
    }
    return this.findOne(id, currentUser);
  }

  async remove(id: number, currentUser: any) {
    // Solo admin puede eliminar pedidos
    if (currentUser.rol !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden eliminar pedidos');
    }

    const pedido = await this.pedidoRepo.findOne({ 
      where: { id },
      relations: ['detalles', 'detalles.producto']
    });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    // Se podría emitir evento compensatorio aquí si se requiere reponer stock
    await this.pedidoRepo.remove(pedido);
  }

  async getEstadisticas(currentUser: any) {
    // Solo admin puede ver estadísticas generales
    if (currentUser.rol !== 'admin') {
      throw new ForbiddenException('No tienes permisos para ver las estadísticas');
    }

    const totalPedidos = await this.pedidoRepo.count();
    const pedidosPendientes = await this.pedidoRepo.count({ 
      where: { estado: EstadoPedido.PENDIENTE } 
    });
    const pedidosEntregados = await this.pedidoRepo.count({ 
      where: { estado: EstadoPedido.ENTREGADO } 
    });

    const ventasResult = await this.pedidoRepo
      .createQueryBuilder('pedido')
      .select('SUM(pedido.total)', 'total')
      .where('pedido.estado = :estado', { estado: EstadoPedido.ENTREGADO })
      .getRawOne();

    return {
      totalPedidos,
      pedidosPendientes,
      pedidosEntregados,
      ventasTotales: parseFloat(ventasResult?.total) || 0
    };
  }
}