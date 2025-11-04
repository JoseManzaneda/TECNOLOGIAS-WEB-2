import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { Pago } from './entities/pago.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pago, Pedido])],
  controllers: [PagosController],
  providers: [PagosService],
  exports: [PagosService],
})
export class PagosModule {}