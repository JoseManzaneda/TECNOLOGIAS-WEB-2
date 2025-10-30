import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const port = config.get<number>('port', 3003);

  app.enableCors({ origin: '*', methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', credentials: true });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  // Conexión opcional al microservicio RMQ (para emitir/recibir si fuera necesario)
  const rabbitUrl = config.get<string>('rabbitmq.url');
  const rabbitQueue = config.get<string>('rabbitmq.queue');
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: { urls: [rabbitUrl], queue: rabbitQueue, queueOptions: { durable: true } },
  });

  await app.startAllMicroservices();
  await app.listen(port);
  console.log(`🛒 Products Service running on: http://localhost:${port}`);
}

bootstrap();
