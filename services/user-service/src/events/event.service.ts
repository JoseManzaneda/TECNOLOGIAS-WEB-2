import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserRegisteredEvent } from '../../../../shared/events/user.events';

@Injectable()
export class EventService implements OnModuleInit {
  constructor(
    @Inject('EVENT_BUS') private readonly eventBus: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      await this.eventBus.connect();
    } catch (err) {
      console.error('Failed to connect to event bus', err);
    }
  }

  emitUserRegistered(event: UserRegisteredEvent) {
    this.eventBus.emit('user.registered', event);
  }
}
