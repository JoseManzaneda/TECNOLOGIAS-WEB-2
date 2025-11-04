import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ProductOutOfStockEvent } from '../../../../shared/events/product.events';

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

  emitProductOutOfStock(event: ProductOutOfStockEvent) {
    this.eventBus.emit('product.out_of_stock', event);
  }
}
