import { IsEnum, IsPositive, IsInt, IsOptional, Min } from 'class-validator';
import { MetodoPago } from '../entities/pago.entity';

export class CreatePagoDto {
  @IsInt({ message: 'El ID del pedido debe ser un número entero' })
  @IsPositive({ message: 'El ID del pedido debe ser positivo' })
  pedidoId!: number;

  @IsPositive({ message: 'El monto debe ser mayor a 0' })
  @Min(0.01, { message: 'El monto mínimo es 0.01' })
  monto!: number;

  @IsEnum(MetodoPago, { message: 'El método de pago debe ser: tarjeta, qr o efectivo' })
  metodo!: MetodoPago;
}