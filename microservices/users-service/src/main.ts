import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3002);
  const rabbitmqUrl = configService.get<string>('rabbitmq.url');
  const rabbitmqQueue = configService.get<string>('rabbitmq.queue');

  app.enableCors({ origin: '*', methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: rabbitmqQueue,
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();
  
  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Users Service API')
    .setDescription('Endpoints de gestión de usuarios y direcciones')
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  console.log(`👤 Users Service running on: http://localhost:${port}`);
  console.log(`🐰 RabbitMQ connected to: ${rabbitmqUrl}`);
}

bootstrap();
