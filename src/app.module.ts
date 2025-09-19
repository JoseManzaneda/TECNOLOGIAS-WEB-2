import { Module } from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

@Controller()
class AppController {
  @Get()
  root() {
    return {
      name: 'Cafeteria API',
      version: '0.1.0',
      docs: '/api/docs',
      health: '/api/health',
      endpoints: {
        categorias: '/api/categories',
        productos: '/api/products',
        usuarios: '/api/users',
        auth: {
          register: '/api/auth/register',
          login: '/api/auth/login',
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.user'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.name'),
        autoLoadEntities: true,
        synchronize: config.get<string>('app.env') !== 'production',
        logging: config.get<string>('app.env') !== 'production',
        charset: 'utf8mb4_general_ci',
      }),
    }),
    CategoriesModule,
    ProductsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}