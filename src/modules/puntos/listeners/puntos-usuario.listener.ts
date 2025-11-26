import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Puntos } from '../entities/puntos.entity';
import { UsuarioRegistradoEvent } from '../../../shared/events';
import { EventLogger } from '../../../shared/utils';

@Injectable()
export class PuntosUsuarioListener {
  private readonly logger = new Logger(PuntosUsuarioListener.name);

  constructor(
  @InjectRepository(Puntos, 'customerConnection')
    private puntosRepository: Repository<Puntos>,
  ) {}

  @OnEvent('usuario.registrado')
  async handleUsuarioRegistrado(event: UsuarioRegistradoEvent) {
    EventLogger.logReceive('usuario.registrado', 'PuntosUsuarioListener');

    try {
      const puntos = this.puntosRepository.create({
        userId: event.usuarioId,
        puntosAcumulados: 0,
      });

      await this.puntosRepository.save(puntos);

      this.logger.log(
        `✅ Registro de puntos creado para usuario ${event.usuarioId} (${event.nombre})`
      );
    } catch (error) {
      EventLogger.logError('usuario.registrado', error);
    }
  }
}
