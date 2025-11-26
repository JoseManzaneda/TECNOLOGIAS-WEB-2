import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago, EstadoPago } from './entities/pago.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PagoCreadoEvent, PagoProcesadoEvent, PagoRechazadoEvent } from '../../shared/events';
import { EventLogger } from '../../shared/utils';

@Injectable()
export class PagosService {
  constructor(
  @InjectRepository(Pago, 'ordersConnection')
    private readonly pagoRepo: Repository<Pago>,
  @InjectRepository(Pedido, 'ordersConnection')
    private readonly pedidoRepo: Repository<Pedido>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreatePagoDto, currentUser: any) {
    // Verificar que el pedido existe
    const pedido = await this.pedidoRepo.findOne({ where: { id: dto.pedidoId } });
    
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    // Verificar autorización: admin puede crear pagos para cualquier pedido, cliente solo para los suyos
    if (currentUser.rol !== 'admin' && pedido.userId !== currentUser.id) {
      throw new ForbiddenException('No tienes permisos para crear un pago para este pedido');
    }

    // Verificar que el monto no exceda el total del pedido
    if (pedido.total && dto.monto > pedido.total) {
      throw new BadRequestException(`El monto no puede exceder el total del pedido (${pedido.total})`);
    }

    // Verificar si ya existe un pago completado para este pedido
    const pagoExistente = await this.pagoRepo.findOne({
      where: { 
        pedidoId: dto.pedidoId,
        estado: EstadoPago.COMPLETADO 
      }
    });

    if (pagoExistente) {
      throw new BadRequestException('Ya existe un pago completado para este pedido');
    }

    const pago = this.pagoRepo.create({
      pedidoId: dto.pedidoId,
      monto: dto.monto,
      metodo: dto.metodo,
      estado: EstadoPago.PENDIENTE,
    });

    const pagoGuardado = await this.pagoRepo.save(pago);

    const event = new PagoCreadoEvent(
      pagoGuardado.id,
      dto.pedidoId,
      dto.monto,
      dto.metodo,
    );
    this.eventEmitter.emit('pago.creado', event);
    EventLogger.logEmit('pago.creado', event);

    return this.findOne(pagoGuardado.id, currentUser);
  }

  async findAll(currentUser: any) {
    const queryBuilder = this.pagoRepo
      .createQueryBuilder('pago')
      .leftJoinAndSelect('pago.pedido', 'pedido')
      .leftJoinAndSelect('pedido.usuario', 'usuario')
      .select([
        'pago.id', 'pago.monto', 'pago.metodo', 'pago.fecha', 'pago.estado',
        'pedido.id', 'pedido.total', 'pedido.estado',
        'usuario.id', 'usuario.nombre', 'usuario.email'
      ]);

    // Solo admin puede ver todos los pagos
    if (currentUser.rol !== 'admin') {
      queryBuilder
        .where('pedido.userId = :userId', { userId: currentUser.id });
    }

    return queryBuilder
      .orderBy('pago.fecha', 'DESC')
      .getMany();
  }

  async findOne(id: number, currentUser: any) {
    const pago = await this.pagoRepo
      .createQueryBuilder('pago')
      .leftJoinAndSelect('pago.pedido', 'pedido')
      .leftJoinAndSelect('pedido.usuario', 'usuario')
      .select([
        'pago.id', 'pago.pedidoId', 'pago.monto', 'pago.metodo', 'pago.fecha', 'pago.estado',
        'pedido.id', 'pedido.total', 'pedido.estado', 'pedido.userId',
        'usuario.id', 'usuario.nombre', 'usuario.email'
      ])
      .where('pago.id = :id', { id })
      .getOne();

    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }

    // Verificar autorización: admin puede ver cualquier pago, cliente solo los de sus pedidos
    if (currentUser.rol !== 'admin' && pago.pedido?.userId !== currentUser.id) {
      throw new ForbiddenException('No tienes permisos para acceder a este pago');
    }

    return pago;
  }

  async findByPedido(pedidoId: number, currentUser: any) {
    // Verificar que el pedido existe
    const pedido = await this.pedidoRepo.findOne({ where: { id: pedidoId } });
    
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    // Verificar autorización: admin puede ver pagos de cualquier pedido, cliente solo de los suyos
    if (currentUser.rol !== 'admin' && pedido.userId !== currentUser.id) {
      throw new ForbiddenException('No tienes permisos para acceder a los pagos de este pedido');
    }

    return this.pagoRepo.find({
      where: { pedidoId },
      order: { fecha: 'DESC' }
    });
  }

  async update(id: number, dto: UpdatePagoDto, currentUser: any) {
    const pago = await this.pagoRepo.findOne({ 
      where: { id },
      relations: ['pedido']
    });

    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }

    // Verificar autorización: admin puede actualizar cualquier pago, cliente solo los de sus pedidos
    if (currentUser.rol !== 'admin' && pago.pedido?.userId !== currentUser.id) {
      throw new ForbiddenException('No tienes permisos para actualizar este pago');
    }

    // Los clientes no pueden cambiar el estado, solo admin
    if (currentUser.rol !== 'admin' && dto.estado !== undefined) {
      throw new ForbiddenException('Solo los administradores pueden cambiar el estado del pago');
    }

    // No se puede modificar un pago completado
    if (pago.estado === EstadoPago.COMPLETADO && currentUser.rol !== 'admin') {
      throw new BadRequestException('No se puede modificar un pago completado');
    }

    // Validar transiciones de estado para admin
    if (currentUser.rol === 'admin' && dto.estado) {
      const transicionesValidas: Record<EstadoPago, EstadoPago[]> = {
        [EstadoPago.PENDIENTE]: [EstadoPago.COMPLETADO, EstadoPago.FALLIDO],
        [EstadoPago.COMPLETADO]: [],
        [EstadoPago.FALLIDO]: [EstadoPago.PENDIENTE, EstadoPago.COMPLETADO]
      };

      const estadosPermitidos = transicionesValidas[pago.estado];
      if (!estadosPermitidos.includes(dto.estado)) {
        throw new BadRequestException(`No se puede cambiar de ${pago.estado} a ${dto.estado}`);
      }
    }

    // Verificar que el nuevo monto no exceda el total del pedido
    if (dto.monto && pago.pedido?.total && dto.monto > pago.pedido.total) {
      throw new BadRequestException(`El monto no puede exceder el total del pedido (${pago.pedido.total})`);
    }

    if (dto.monto !== undefined) pago.monto = dto.monto;
    if (dto.metodo !== undefined) pago.metodo = dto.metodo;
    if (dto.estado !== undefined) pago.estado = dto.estado;

    return this.pagoRepo.save(pago);
  }

  async remove(id: number, currentUser: any) {
    // Solo admin puede eliminar pagos
    if (currentUser.rol !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden eliminar pagos');
    }

    const pago = await this.pagoRepo.findOne({ 
      where: { id },
      relations: ['pedido']
    });

    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }

    // No se puede eliminar un pago completado
    if (pago.estado === EstadoPago.COMPLETADO) {
      throw new BadRequestException('No se puede eliminar un pago completado');
    }

    await this.pagoRepo.remove(pago);
  }

  async getEstadisticas(currentUser: any) {
    // Solo admin puede ver estadísticas generales
    if (currentUser.rol !== 'admin') {
      throw new ForbiddenException('No tienes permisos para ver las estadísticas');
    }

    const totalPagos = await this.pagoRepo.count();
    const pagosPendientes = await this.pagoRepo.count({ 
      where: { estado: EstadoPago.PENDIENTE } 
    });
    const pagosCompletados = await this.pagoRepo.count({ 
      where: { estado: EstadoPago.COMPLETADO } 
    });
    const pagosFallidos = await this.pagoRepo.count({ 
      where: { estado: EstadoPago.FALLIDO } 
    });

    // Total de ingresos (solo pagos completados)
    const ingresosResult = await this.pagoRepo
      .createQueryBuilder('pago')
      .select('SUM(pago.monto)', 'total')
      .where('pago.estado = :estado', { estado: EstadoPago.COMPLETADO })
      .getRawOne();

    // Estadísticas por método de pago
    const estadisticasPorMetodo = await this.pagoRepo
      .createQueryBuilder('pago')
      .select(['pago.metodo', 'COUNT(*) as cantidad', 'SUM(pago.monto) as total'])
      .where('pago.estado = :estado', { estado: EstadoPago.COMPLETADO })
      .groupBy('pago.metodo')
      .getRawMany();

    return {
      totalPagos,
      pagosPendientes,
      pagosCompletados,
      pagosFallidos,
      ingresosTotales: parseFloat(ingresosResult?.total) || 0,
      estadisticasPorMetodo: estadisticasPorMetodo.map(stat => ({
        metodo: stat.pago_metodo,
        cantidad: parseInt(stat.cantidad),
        total: parseFloat(stat.total) || 0
      }))
    };
  }

  async procesarPago(id: number, currentUser: any) {
    // Solo admin puede procesar pagos
    if (currentUser.rol !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden procesar pagos');
    }

    const pago = await this.pagoRepo.findOne({ 
      where: { id },
      relations: ['pedido']
    });

    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }

    if (pago.estado !== EstadoPago.PENDIENTE) {
      throw new BadRequestException('Solo se pueden procesar pagos pendientes');
    }

    // Simular procesamiento según el método de pago
    let nuevoEstado = EstadoPago.COMPLETADO;
    
    // Simulación: QR tiene 95% de éxito, tarjeta 98%, efectivo 100%
    const probabilidadExito = {
      [pago.metodo]: pago.metodo === 'efectivo' ? 1.0 : 
                    pago.metodo === 'tarjeta' ? 0.98 : 0.95
    };

    if (Math.random() > probabilidadExito[pago.metodo]) {
      nuevoEstado = EstadoPago.FALLIDO;
    }

    pago.estado = nuevoEstado;
    const pagoActualizado = await this.pagoRepo.save(pago);

    if (nuevoEstado === EstadoPago.COMPLETADO) {
      const event = new PagoProcesadoEvent(
        pago.id,
        pago.pedido.id,
        pago.monto,
        pago.pedido.userId,
      );
      this.eventEmitter.emit('pago.procesado', event);
      EventLogger.logEmit('pago.procesado', event);
    } else if (nuevoEstado === EstadoPago.FALLIDO) {
      const event = new PagoRechazadoEvent(
        pago.id,
        pago.pedido.id,
        'Procesamiento fallido',
      );
      this.eventEmitter.emit('pago.rechazado', event);
      EventLogger.logEmit('pago.rechazado', event);
    }

    return pagoActualizado;
  }
}