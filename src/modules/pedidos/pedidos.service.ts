import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Pedido, EstadoPedido, MetodoPago } from './entities/pedido.entity';
import { PedidoDetalle } from './entities/pedido-detalle.entity';
import { Product } from '../products/entities/product.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,
    @InjectRepository(PedidoDetalle)
    private readonly pedidoDetalleRepo: Repository<PedidoDetalle>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly dataSource: DataSource
  ) {}

  async create(dto: CreatePedidoDto, userId: number) {
    // Validaciones básicas
    if (!dto.detalles || dto.detalles.length === 0) {
      throw new BadRequestException('El pedido debe incluir al menos un producto');
    }

    // Usar transacción para garantizar integridad
    return await this.dataSource.transaction(async manager => {
      // Verificar que todos los productos existen y están disponibles
      const productIds = dto.detalles.map(d => d.productoId);
      const productos = await manager.find(Product, { 
        where: productIds.map(id => ({ id })) 
      });
      
      if (productos.length !== productIds.length) {
        throw new BadRequestException('Uno o más productos no existen');
      }

      // Verificar disponibilidad y stock
      for (const detalle of dto.detalles) {
        if (detalle.cantidad <= 0) {
          throw new BadRequestException('La cantidad debe ser mayor a 0');
        }
        
        const producto = productos.find(p => p.id === detalle.productoId);
        if (!producto?.disponible) {
          throw new BadRequestException(`El producto ${producto?.nombre} no está disponible`);
        }
        if (producto.stock < detalle.cantidad) {
          throw new BadRequestException(`Stock insuficiente para ${producto.nombre}. Stock disponible: ${producto.stock}`);
        }
      }

      // Crear pedido
      const pedido = manager.create(Pedido, {
        userId,
        metodoPago: dto.metodoPago || MetodoPago.EFECTIVO,
        estado: EstadoPedido.PENDIENTE,
      });

      const pedidoGuardado = await manager.save(pedido);

      // Crear detalles y calcular total
      let total = 0;
      const detalles = [];

      for (const detalleDto of dto.detalles) {
        const producto = productos.find(p => p.id === detalleDto.productoId)!;
        const subtotal = producto.precio * detalleDto.cantidad;
        total += subtotal;

        const detalle = manager.create(PedidoDetalle, {
          pedidoId: pedidoGuardado.id,
          productoId: detalleDto.productoId,
          cantidad: detalleDto.cantidad,
          precioUnitario: producto.precio,
        });

        detalles.push(detalle);

        // Actualizar stock de forma transaccional
        producto.stock -= detalleDto.cantidad;
        await manager.save(producto);
      }

      await manager.save(detalles);

      // Actualizar total del pedido
      pedidoGuardado.total = total;
      await manager.save(pedidoGuardado);

      // Retornar pedido completo con relaciones
      return await manager.findOne(Pedido, {
        where: { id: pedidoGuardado.id },
        relations: ['detalles', 'detalles.producto', 'user']
      });
    });
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

    // Si se cancela el pedido, restaurar stock
    if (dto.estado === EstadoPedido.CANCELADO && pedido.estado !== EstadoPedido.CANCELADO) {
      const detalles = await this.pedidoDetalleRepo.find({
        where: { pedidoId: id },
        relations: ['producto']
      });

      for (const detalle of detalles) {
        if (detalle.producto) {
          detalle.producto.stock += detalle.cantidad;
          await this.productRepo.save(detalle.producto);
        }
      }
    }

    if (dto.estado !== undefined) pedido.estado = dto.estado;
    if (dto.metodoPago !== undefined) pedido.metodoPago = dto.metodoPago;

    await this.pedidoRepo.save(pedido);

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

    // Restaurar stock si el pedido no estaba cancelado
    if (pedido.estado !== EstadoPedido.CANCELADO) {
      for (const detalle of pedido.detalles || []) {
        if (detalle.producto) {
          detalle.producto.stock += detalle.cantidad;
          await this.productRepo.save(detalle.producto);
        }
      }
    }

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