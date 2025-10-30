import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3001);
  const rabbitmqUrl = configService.get<string>('rabbitmq.url');
  const rabbitmqQueue = configService.get<string>('rabbitmq.queue');

  // Habilitar CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configurar microservicio con RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: rabbitmqQueue,
      queueOptions: {
        durable: true,
      },
    },
  });

  // Iniciar microservicio
  await app.startAllMicroservices();

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Auth Service API')
    .setDescription('Endpoints de autenticación')
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  // Iniciar servidor HTTP
  await app.listen(port);
  
  console.log(`🔐 Auth Service running on: http://localhost:${port}`);
  console.log(`🐰 RabbitMQ connected to: ${rabbitmqUrl}`);
  console.log(`📊 Environment: ${configService.get<string>('environment')}`);
}

bootstrap();
