import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EventsController } from './events.controller';
import { PuntosModule } from '../modules/puntos/puntos.module';

@Module({
  imports: [
    // Cliente Redis opcional (por ahora solo escuchamos eventos)
    ClientsModule.register([
      {
        name: 'EVENT_BUS',
        transport: Transport.REDIS,
        options: {
          url: process.env.REDIS_URL || 'redis://localhost:6379',
        },
      },
    ]),
    PuntosModule,
  ],
  controllers: [EventsController],
  exports: [ClientsModule],
})
export class EventsModule {}
