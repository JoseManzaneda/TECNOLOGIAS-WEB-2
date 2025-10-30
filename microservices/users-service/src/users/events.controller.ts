import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller()
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly usersService: UsersService) {}

  @EventPattern('user.registered')
  async handleUserRegistered(@Payload() data: any, @Ctx() context: RmqContext) {
    try {
      this.logger.log(`Evento recibido: user.registered -> ${JSON.stringify(data)}`);
      await this.usersService.syncFromAuth(data);
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error('Error procesando user.registered', error as any);
    }
  }
}
