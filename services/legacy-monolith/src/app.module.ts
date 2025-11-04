import { Module } from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { DireccionesModule } from './modules/direcciones/direcciones.module';
import { PedidosModule } from './modules/pedidos/pedidos.module';
import { PagosModule } from './modules/pagos/pagos.module';
import { IngredientesModule } from './modules/ingredientes/ingredientes.module';
import { ProductoIngredientesModule } from './modules/producto-ingredientes/producto-ingredientes.module';
import { PuntosModule } from './modules/puntos/puntos.module';
import { ReservasModule } from './modules/reservas/reservas.module';
import { EventsModule } from './events/events.module';

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
        direcciones: '/api/direcciones',
        pedidos: '/api/pedidos',
        pagos: '/api/pagos',
        ingredientes: '/api/ingredientes',
        productoIngredientes: '/api/producto-ingredientes',
        puntos: '/api/puntos',
        reservas: '/api/reservas',
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
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT'),
        username: config.get<string>('POSTGRES_USER'),
        password: config.get<string>('POSTGRES_PASSWORD'),
        database: config.get<string>('POSTGRES_DB'),
  autoLoadEntities: true,
  // Desactivar synchronize para evitar que TypeORM intente alterar enums/tipos
  // en una base de datos gestionada por Docker/init scripts. Usar migraciones
  // para cambios de esquema.
  synchronize: false,
  logging: config.get<string>('APP_ENV') !== 'production',
      }),
    }),
    CategoriesModule,
    ProductsModule,
    UsersModule,
    AuthModule,
    DireccionesModule,
    PedidosModule,
    PagosModule,
    IngredientesModule,
    ProductoIngredientesModule,
    PuntosModule,
    ReservasModule,
    EventsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}