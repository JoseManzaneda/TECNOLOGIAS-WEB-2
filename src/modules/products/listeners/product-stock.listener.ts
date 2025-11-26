import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { 
  PedidoCreadoEvent, 
  PedidoCanceladoEvent 
} from '../../../shared/events';
import { EventLogger } from '../../../shared/utils';

@Injectable()
export class ProductStockListener {
  private readonly logger = new Logger(ProductStockListener.name);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  @OnEvent('pedido.creado')
  async handlePedidoCreado(event: PedidoCreadoEvent) {
    EventLogger.logReceive('pedido.creado', 'ProductStockListener');

    try {
      for (const detalle of event.detalles) {
        const producto = await this.productRepository.findOne({
          where: { id: detalle.productoId },
        });

        if (producto) {
          const nuevoStock = producto.stock - detalle.cantidad;
          await this.productRepository.update(
            { id: detalle.productoId },
            { 
              stock: nuevoStock,
              disponible: nuevoStock > 0,
            },
          );

          this.logger.log(
            `✅ Stock actualizado: Producto ${detalle.productoId} | Anterior: ${producto.stock} → Nuevo: ${nuevoStock}`
          );
        }
      }
    } catch (error) {
      EventLogger.logError('pedido.creado', error);
      throw error;
    }
  }

  @OnEvent('pedido.cancelado')
  async handlePedidoCancelado(event: PedidoCanceladoEvent) {
    EventLogger.logReceive('pedido.cancelado', 'ProductStockListener');

    try {
      for (const detalle of event.detalles) {
        const producto = await this.productRepository.findOne({
          where: { id: detalle.productoId },
        });

        if (producto) {
          const nuevoStock = producto.stock + detalle.cantidad;
          await this.productRepository.update(
            { id: detalle.productoId },
            { 
              stock: nuevoStock,
              disponible: true,
            },
          );

          this.logger.log(
            `♻️ Stock repuesto: Producto ${detalle.productoId} | Anterior: ${producto.stock} → Nuevo: ${nuevoStock}`
          );
        }
      }
    } catch (error) {
      EventLogger.logError('pedido.cancelado', error);
    }
  }
}
