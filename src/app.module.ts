import { Module } from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  authDatabaseConfig,
  productsDatabaseConfig,
  ordersDatabaseConfig,
  customerDatabaseConfig,
} from './config/database.config';
import configuration from './config/configuration';
import { EventsModule } from './shared/events/events.module';
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
import { GatewayModule } from './modules/gateway/gateway.module';

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
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    EventsModule,
    // Conexiones múltiples para arquitectura de microservicios
    TypeOrmModule.forRoot(authDatabaseConfig),
    TypeOrmModule.forRoot(productsDatabaseConfig),
    TypeOrmModule.forRoot(ordersDatabaseConfig),
    TypeOrmModule.forRoot(customerDatabaseConfig),
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
    GatewayModule,
  ],
  controllers: [AppController],
})
export class AppModule {}