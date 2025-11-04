import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePuntosDto {
  @IsOptional()
  @IsNumber({}, { message: 'Los puntos acumulados deben ser un número válido' })
  @Min(0, { message: 'Los puntos acumulados no pueden ser negativos' })
  @Max(999999, { message: 'Los puntos acumulados no pueden exceder 999,999' })
  @Type(() => Number)
  puntosAcumulados?: number;
}