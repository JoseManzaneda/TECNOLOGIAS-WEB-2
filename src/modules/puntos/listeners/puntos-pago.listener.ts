import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Puntos } from '../entities/puntos.entity';
import { PagoProcesadoEvent, PuntosAgregadosEvent } from '../../../shared/events';
import { EventLogger } from '../../../shared/utils';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PuntosPagoListener {
  private readonly logger = new Logger(PuntosPagoListener.name);

  constructor(
  @InjectRepository(Puntos, 'customerConnection')
    private puntosRepository: Repository<Puntos>,
    private eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('pago.procesado')
  async handlePagoProcesado(event: PagoProcesadoEvent) {
    EventLogger.logReceive('pago.procesado', 'PuntosPagoListener');

    try {
      const puntosAAgregar = Math.floor(event.monto);

      let puntosUsuario = await this.puntosRepository.findOne({
        where: { userId: event.usuarioId },
      });

      if (!puntosUsuario) {
        puntosUsuario = this.puntosRepository.create({
          userId: event.usuarioId,
          puntosAcumulados: puntosAAgregar,
        });
      } else {
        puntosUsuario.puntosAcumulados += puntosAAgregar;
      }

      const puntosActualizados = await this.puntosRepository.save(puntosUsuario);

      this.logger.log(
        `✅ Puntos agregados: Usuario ${event.usuarioId} | +${puntosAAgregar} puntos | Total: ${puntosActualizados.puntosAcumulados}`
      );

      const puntosEvent = new PuntosAgregadosEvent(
        event.usuarioId,
        puntosAAgregar,
        puntosActualizados.puntosAcumulados,
        `Pago procesado #${event.pagoId}`,
      );

      this.eventEmitter.emit('puntos.agregados', puntosEvent);
      EventLogger.logEmit('puntos.agregados', puntosEvent);

    } catch (error) {
      EventLogger.logError('pago.procesado', error);
    }
  }
}
