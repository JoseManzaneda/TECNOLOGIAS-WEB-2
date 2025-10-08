import { IsEnum, IsArray, ArrayMinSize, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { MetodoPago } from '../entities/pedido.entity';
import { CreatePedidoDetalleDto } from './create-pedido-detalle.dto';

export class CreatePedidoDto {
  @IsOptional()
  @IsEnum(MetodoPago, { message: 'El método de pago debe ser: tarjeta, qr o efectivo' })
  metodoPago?: MetodoPago;

  @IsArray({ message: 'Los detalles deben ser un arreglo' })
  @ArrayMinSize(1, { message: 'Debe incluir al menos un producto en el pedido' })
  @ValidateNested({ each: true })
  @Type(() => CreatePedidoDetalleDto)
  detalles!: CreatePedidoDetalleDto[];
}