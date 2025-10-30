import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as swaggerUi from 'swagger-ui-express';
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: false,
  });

  // Validación
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const apiPrefix = config.get<string>('apiPrefix', '/api');
  const authUrl = config.get<string>('services.auth');
  const usersUrl = config.get<string>('services.users');
  const productsUrl = config.get<string>('services.products');

  // Proxies: reescribe ^/api -> '' para mantener /auth, /users, /products, /categories
  app.use(
    `${apiPrefix}/auth`,
    createProxyMiddleware({
      target: authUrl,
      changeOrigin: true,
      pathRewrite: (path: string) => path.replace(/^\/(api)\b/, ''),
    }),
  );

  app.use(
    `${apiPrefix}/users`,
    createProxyMiddleware({
      target: usersUrl,
      changeOrigin: true,
      pathRewrite: (path: string) => path.replace(/^\/(api)\b/, ''),
    }),
  );

  app.use(
    `${apiPrefix}/products`,
    createProxyMiddleware({
      target: productsUrl,
      changeOrigin: true,
      pathRewrite: (path: string) => path.replace(/^\/(api)\b/, ''),
    }),
  );

  app.use(
    `${apiPrefix}/categories`,
    createProxyMiddleware({
      target: productsUrl,
      changeOrigin: true,
      pathRewrite: (path: string) => path.replace(/^\/(api)\b/, ''),
    }),
  );

  // Doc propia del Gateway
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('Proxy para Auth, Users y Products.')
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs/gateway`, app, document);

  // Proxies de OpenAPI JSON para agregación
  app.use(
    `${apiPrefix}/docs/auth-json`,
    createProxyMiddleware({ target: authUrl, changeOrigin: true, pathRewrite: () => '/docs-json' }),
  );
  app.use(
    `${apiPrefix}/docs/users-json`,
    createProxyMiddleware({ target: usersUrl, changeOrigin: true, pathRewrite: () => '/docs-json' }),
  );
  app.use(
    `${apiPrefix}/docs/products-json`,
    createProxyMiddleware({ target: productsUrl, changeOrigin: true, pathRewrite: () => '/docs-json' }),
  );

  // UI agregada con múltiples specs
  const swaggerUrls = [
    { url: `${apiPrefix}/docs/auth-json`, name: 'Auth Service' },
    { url: `${apiPrefix}/docs/users-json`, name: 'Users Service' },
    { url: `${apiPrefix}/docs/products-json`, name: 'Products Service' },
    { url: `${apiPrefix}/docs/gateway-json`, name: 'Gateway (resumen)' },
  ];
  // Exponer el JSON del gateway también bajo /api/docs/gateway-json
  app.use(
    `${apiPrefix}/docs/gateway-json`,
    (_req: Request, res: Response) => res.json(document),
  );
  app.use(`${apiPrefix}/docs`, swaggerUi.serve, swaggerUi.setup(undefined, { explorer: true, swaggerOptions: { urls: swaggerUrls } }));

  const port = config.get<number>('port', 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚪 API Gateway corriendo en http://localhost:${port}`);
  console.log(`➡️  Proxy: ${apiPrefix}/auth -> ${authUrl}`);
  console.log(`➡️  Proxy: ${apiPrefix}/users -> ${usersUrl}`);
  console.log(`➡️  Proxy: ${apiPrefix}/products,categories -> ${productsUrl}`);
}

bootstrap();
