import { IsEnum, IsOptional } from 'class-validator';
import { EstadoPedido } from '../entities/pedido.entity';
import { MetodoPago } from '../../../common/enums/metodo-pago.enum';

export class UpdatePedidoDto {
  @IsOptional()
  @IsEnum(EstadoPedido, { 
    message: 'El estado debe ser: pendiente, en_preparacion, listo, entregado o cancelado' 
  })
  estado?: EstadoPedido;

  @IsOptional()
  @IsEnum(MetodoPago, { message: 'El método de pago debe ser: tarjeta, qr o efectivo' })
  metodoPago?: MetodoPago;
}