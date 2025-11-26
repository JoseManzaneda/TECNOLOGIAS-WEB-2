import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// Configuración base común
const baseConfig = {
  type: 'mysql' as const,
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306', 10),
  username: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  charset: 'utf8mb4',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
};

// Database para Auth + Users
export const authDatabaseConfig: TypeOrmModuleOptions = {
  ...baseConfig,
  name: 'authConnection',
  database: process.env.DATABASE_AUTH || 'cafeteria_auth',
  entities: [
    __dirname + '/../modules/users/entities/*.entity{.ts,.js}',
  ],
};

// Database para Products + Categories + Ingredientes
export const productsDatabaseConfig: TypeOrmModuleOptions = {
  ...baseConfig,
  name: 'productsConnection',
  database: process.env.DATABASE_PRODUCTS || 'cafeteria_products',
  entities: [
    __dirname + '/../modules/products/entities/*.entity{.ts,.js}',
    __dirname + '/../modules/categories/entities/*.entity{.ts,.js}',
    __dirname + '/../modules/ingredientes/entities/*.entity{.ts,.js}',
    __dirname + '/../modules/producto-ingredientes/entities/*.entity{.ts,.js}',
  ],
};

// Database para Orders (Pedidos + Pagos)
export const ordersDatabaseConfig: TypeOrmModuleOptions = {
  ...baseConfig,
  name: 'ordersConnection',
  database: process.env.DATABASE_ORDERS || 'cafeteria_orders',
  entities: [
    __dirname + '/../modules/pedidos/entities/*.entity{.ts,.js}',
    __dirname + '/../modules/pagos/entities/*.entity{.ts,.js}',
  ],
};

// Database para Customer (Direcciones + Puntos + Reservas)
export const customerDatabaseConfig: TypeOrmModuleOptions = {
  ...baseConfig,
  name: 'customerConnection',
  database: process.env.DATABASE_CUSTOMER || 'cafeteria_customer',
  entities: [
    __dirname + '/../modules/direcciones/entities/*.entity{.ts,.js}',
    __dirname + '/../modules/puntos/entities/*.entity{.ts,.js}',
    __dirname + '/../modules/reservas/entities/*.entity{.ts,.js}',
  ],
};
