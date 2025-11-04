import { IsEnum, IsPositive, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MetodoPago } from '../../../common/enums/metodo-pago.enum';

export class CreatePagoDto {
  @ApiProperty({
    description: 'ID del pedido asociado al pago',
    example: 1,
    minimum: 1
  })
  @IsInt({ message: 'El ID del pedido debe ser un número entero' })
  @IsPositive({ message: 'El ID del pedido debe ser positivo' })
  @Type(() => Number)
  pedidoId!: number;

  @ApiProperty({
    description: 'Monto del pago',
    example: 125.50,
    minimum: 0.01
  })
  @IsPositive({ message: 'El monto debe ser mayor a 0' })
  @Min(0.01, { message: 'El monto mínimo es 0.01' })
  @Type(() => Number)
  monto!: number;

  @ApiProperty({
    description: 'Método de pago utilizado',
    enum: MetodoPago,
    example: 'tarjeta'
  })
  @IsEnum(MetodoPago, { message: 'El método de pago debe ser: tarjeta, qr o efectivo' })
  metodo!: MetodoPago;
}