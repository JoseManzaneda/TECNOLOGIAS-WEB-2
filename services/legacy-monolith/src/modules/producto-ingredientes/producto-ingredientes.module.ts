import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoIngrediente } from './entities/producto-ingrediente.entity';
import { Product } from '../products/entities/product.entity';
import { Ingrediente } from '../ingredientes/entities/ingrediente.entity';
import { ProductoIngredientesService } from './producto-ingredientes.service';
import { ProductoIngredientesController } from './producto-ingredientes.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductoIngrediente, Product, Ingrediente])
  ],
  controllers: [ProductoIngredientesController],
  providers: [ProductoIngredientesService],
  exports: [ProductoIngredientesService, TypeOrmModule],
})
export class ProductoIngredientesModule {}