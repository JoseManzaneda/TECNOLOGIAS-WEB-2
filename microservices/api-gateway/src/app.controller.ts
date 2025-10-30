import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/')
  root() {
    return {
      status: 'ok',
      service: 'api-gateway',
      message: 'Gateway operativo',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('/api/health')
  health() {
    return {
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
    };
  }
}
