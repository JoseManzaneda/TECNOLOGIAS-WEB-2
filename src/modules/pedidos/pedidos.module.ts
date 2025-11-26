import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { Pedido } from './entities/pedido.entity';
import { PedidoDetalle } from './entities/pedido-detalle.entity';
import { ProductStockListener } from '../products/listeners/product-stock.listener';
import { PedidoPagoListener } from './listeners/pedido-pago.listener';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, PedidoDetalle], 'ordersConnection')],
  controllers: [PedidosController],
  providers: [PedidosService, ProductStockListener, PedidoPagoListener],
  exports: [PedidosService],
})
export class PedidosModule {}