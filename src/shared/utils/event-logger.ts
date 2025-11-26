import { Logger } from '@nestjs/common';

export class EventLogger {
  private static logger = new Logger('EventBus');

  static logEmit(eventName: string, payload: any) {
    this.logger.log(`📤 Event emitted: ${eventName}`, JSON.stringify(payload, null, 2));
  }

  static logReceive(eventName: string, handler: string) {
    this.logger.log(`📥 Event received: ${eventName} → ${handler}`);
  }

  static logError(eventName: string, error: any) {
    this.logger.error(`❌ Event error: ${eventName}`, error?.stack);
  }
}
