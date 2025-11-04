import { IsNotEmpty, IsNumber, IsPositive, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CanjearPuntosDto {
  @ApiProperty({
    description: 'Cantidad de puntos a canjear',
    example: 200,
    minimum: 1,
    maximum: 50000
  })
  @IsNotEmpty({ message: 'La cantidad de puntos es obligatoria' })
  @IsNumber({}, { message: 'La cantidad de puntos debe ser un número válido' })
  @IsPositive({ message: 'La cantidad de puntos debe ser mayor que 0' })
  @Min(1, { message: 'Debe canjear al menos 1 punto' })
  @Max(50000, { message: 'No se pueden canjear más de 50,000 puntos de una vez' })
  @Type(() => Number)
  puntos!: number;

  @ApiProperty({
    description: 'Descripción del canje de puntos',
    example: 'Descuento en bebida grande'
  })
  @IsNotEmpty({ message: 'La descripción del canje es obligatoria' })
  @IsString({ message: 'La descripción debe ser un texto válido' })
  @Type(() => String)
  descripcion!: string;
}