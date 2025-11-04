import { IsEnum, IsArray, ArrayMinSize, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MetodoPago } from '../../../common/enums/metodo-pago.enum';
import { CreatePedidoDetalleDto } from './create-pedido-detalle.dto';

export class CreatePedidoDto {
  @ApiProperty({
    description: 'Método de pago del pedido',
    enum: MetodoPago,
    example: 'tarjeta',
    required: false,
    default: 'efectivo'
  })
  @IsOptional()
  @IsEnum(MetodoPago, { message: 'El método de pago debe ser: tarjeta, qr o efectivo' })
  metodoPago?: MetodoPago;

  @ApiProperty({
    description: 'Detalle de productos del pedido',
    type: [CreatePedidoDetalleDto],
    example: [
      {
        idProducto: 1,
        cantidad: 2,
        precioUnitario: 25.50
      }
    ],
    minItems: 1
  })
  @IsArray({ message: 'Los detalles deben ser un arreglo' })
  @ArrayMinSize(1, { message: 'Debe incluir al menos un producto en el pedido' })
  @ValidateNested({ each: true })
  @Type(() => CreatePedidoDetalleDto)
  detalles!: CreatePedidoDetalleDto[];
}