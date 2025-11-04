import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductsInternalController } from './products-internal.controller';
import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';

import { EventsModule } from '../../events/events.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category]), EventsModule],
  controllers: [ProductsController, ProductsInternalController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}