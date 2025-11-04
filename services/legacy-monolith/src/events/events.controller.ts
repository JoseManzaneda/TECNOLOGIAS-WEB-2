import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PuntosService } from '../modules/puntos/puntos.service';
import { UserRegisteredEvent } from '@shared/events/user.events';
import { ProductOutOfStockEvent } from '@shared/events/product.events';

@Controller()
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly puntosService: PuntosService) {}

  @EventPattern('user.registered')
  async handleUserRegistered(@Payload() data: UserRegisteredEvent) {
    this.logger.log(`Received user.registered event for user: ${data.nombre}`);
    try {
      await this.puntosService.crearPuntosParaNuevoUsuario(data.userId);
      this.logger.log(`Puntos record created for user ID: ${data.userId}`);
    } catch (error) {
      this.logger.error(`Failed to create puntos record for user ID: ${data.userId}`, error);
    }
  }

  @EventPattern('product.out_of_stock')
  handleProductOutOfStock(@Payload() data: ProductOutOfStockEvent) {
    this.logger.warn(
      `EVENT: Product out of stock: ${data.nombre} (ID: ${data.productId})`,
    );
    // Por ahora, solo registrar en logs
  }
}
