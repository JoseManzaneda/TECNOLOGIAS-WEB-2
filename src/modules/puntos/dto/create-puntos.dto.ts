import { IsNotEmpty, IsNumber, IsPositive, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePuntosDto {
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  @IsNumber({}, { message: 'El ID del usuario debe ser un número válido' })
  @IsPositive({ message: 'El ID del usuario debe ser mayor que 0' })
  @Type(() => Number)
  userId!: number;

  @IsNotEmpty({ message: 'Los puntos acumulados son obligatorios' })
  @IsNumber({}, { message: 'Los puntos acumulados deben ser un número válido' })
  @Min(0, { message: 'Los puntos acumulados no pueden ser negativos' })
  @Max(999999, { message: 'Los puntos acumulados no pueden exceder 999,999' })
  @Type(() => Number)
  puntosAcumulados!: number;
}