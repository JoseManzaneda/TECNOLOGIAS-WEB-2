import { IsEnum, IsOptional, IsPositive, Min } from 'class-validator';
import { EstadoPago, MetodoPago } from '../entities/pago.entity';

export class UpdatePagoDto {
  @IsOptional()
  @IsPositive({ message: 'El monto debe ser mayor a 0' })
  @Min(0.01, { message: 'El monto mínimo es 0.01' })
  monto?: number;

  @IsOptional()
  @IsEnum(MetodoPago, { message: 'El método de pago debe ser: tarjeta, qr o efectivo' })
  metodo?: MetodoPago;

  @IsOptional()
  @IsEnum(EstadoPago, { message: 'El estado debe ser: pendiente, completado o fallido' })
  estado?: EstadoPago;
}