import { IsNotEmpty, IsNumber, IsPositive, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CanjearPuntosDto {
  @IsNotEmpty({ message: 'La cantidad de puntos es obligatoria' })
  @IsNumber({}, { message: 'La cantidad de puntos debe ser un número válido' })
  @IsPositive({ message: 'La cantidad de puntos debe ser mayor que 0' })
  @Min(1, { message: 'Debe canjear al menos 1 punto' })
  @Max(50000, { message: 'No se pueden canjear más de 50,000 puntos de una vez' })
  @Type(() => Number)
  puntos!: number;

  @IsNotEmpty({ message: 'La descripción del canje es obligatoria' })
  @Type(() => String)
  descripcion!: string;
}