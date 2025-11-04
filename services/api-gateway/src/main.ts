import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('APIGateway');
  
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  // No usar enableCors() porque causa conflicto con el catch-all route
  // El CORS se manejará manualmente en el ProxyController

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  logger.log(`🚀 API Gateway running on http://localhost:${port}`);
  logger.log(`🔗 Proxying to ${process.env.LEGACY_MONOLITH_URL || 'http://legacy-monolith:3001'}`);
}

bootstrap();
