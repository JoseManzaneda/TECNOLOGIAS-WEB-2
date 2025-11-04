import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { EventService } from './event.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'EVENT_BUS',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            url: configService.get<string>('REDIS_URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [EventService],
  exports: [EventService],
})
export class EventsModule {}
