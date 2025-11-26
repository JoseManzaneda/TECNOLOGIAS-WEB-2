import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido, EstadoPedido } from '../entities/pedido.entity';
import { PagoProcesadoEvent } from '../../../shared/events';
import { EventLogger } from '../../../shared/utils';

@Injectable()
export class PedidoPagoListener {
  private readonly logger = new Logger(PedidoPagoListener.name);

  constructor(
  @InjectRepository(Pedido, 'ordersConnection')
    private pedidoRepository: Repository<Pedido>,
  ) {}

  @OnEvent('pago.procesado')
  async handlePagoProcesado(event: PagoProcesadoEvent) {
    EventLogger.logReceive('pago.procesado', 'PedidoPagoListener');

    try {
      const pedido = await this.pedidoRepository.findOne({
        where: { id: event.pedidoId },
      });

      if (pedido && pedido.estado === EstadoPedido.PENDIENTE) {
        pedido.estado = EstadoPedido.EN_PREPARACION;
        await this.pedidoRepository.save(pedido);

        this.logger.log(
          `✅ Pedido ${event.pedidoId} actualizado a 'en_preparacion' tras pago procesado`
        );
      }
    } catch (error) {
      EventLogger.logError('pago.procesado', error);
    }
  }
}
