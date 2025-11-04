import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { Pedido } from './entities/pedido.entity';
import { PedidoDetalle } from './entities/pedido-detalle.entity';
import { Product } from '../products/entities/product.entity';
import { UserServiceClient } from './user-service.client';
import { CatalogServiceClient } from './catalog-service.client';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, PedidoDetalle, Product])],
  controllers: [PedidosController],
  providers: [PedidosService, UserServiceClient, CatalogServiceClient],
  exports: [PedidosService],
})
export class PedidosModule {}