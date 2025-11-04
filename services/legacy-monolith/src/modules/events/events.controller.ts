import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { UserRegisteredEvent } from '@shared/events/user.events';
import { ProductOutOfStockEvent } from '@shared/events/product.events';
import { PuntosService } from '../puntos/puntos.service';

@Controller()
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly puntosService: PuntosService) {}

  @EventPattern('user.registered')
  async handleUserRegistered(@Payload() data: UserRegisteredEvent) {
    this.logger.log(`Received user.registered event for user ID: ${data.userId}`);
    try {
      // Crear registro de puntos inicial para el nuevo usuario
      await this.puntosService.createInitialPuntos(data.userId);
      this.logger.log(`Successfully created initial puntos for user ID: ${data.userId}`);
    } catch (error) {
      this.logger.error(`Failed to create initial puntos for user ID: ${data.userId}`, error.stack);
    }
  }

  @EventPattern('product.out_of_stock')
  handleProductOutOfStock(@Payload() data: ProductOutOfStockEvent) {
    this.logger.warn(
      `PRODUCT OUT OF STOCK: Product "${data.nombre}" (ID: ${data.productId}) is now out of stock.`,
    );
  }
}
