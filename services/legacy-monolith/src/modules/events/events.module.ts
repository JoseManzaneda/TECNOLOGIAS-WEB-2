import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { PuntosModule } from '../puntos/puntos.module';

@Module({
  imports: [PuntosModule],
  controllers: [EventsController],
})
export class EventsModule {}
