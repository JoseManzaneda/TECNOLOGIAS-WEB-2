import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  // Excluir rutas internas del prefijo global /api
  app.setGlobalPrefix('api', {
    exclude: ['internal/(.*)'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Catalog Service API')
    .setDescription('API para gestión de productos, categorías e ingredientes')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3003, '0.0.0.0');
  console.log('🚀 Catalog Service running on http://localhost:3003/api');
}
bootstrap();
