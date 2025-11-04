import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { IngredientesModule } from './modules/ingredientes/ingredientes.module';
import { ProductoIngredientesModule } from './modules/producto-ingredientes/producto-ingredientes.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        schema: 'catalog_schema',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Solo en desarrollo
      }),
      inject: [ConfigService],
    }),
    ProductsModule,
    CategoriesModule,
    IngredientesModule,
    ProductoIngredientesModule,
    EventsModule,
  ],
})
export class AppModule {}
