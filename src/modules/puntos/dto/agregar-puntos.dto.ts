import { IsNotEmpty, IsNumber, IsPositive, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AgregarPuntosDto {
  @ApiProperty({
    description: 'Cantidad de puntos a agregar',
    example: 50,
    minimum: 1,
    maximum: 10000
  })
  @IsNotEmpty({ message: 'La cantidad de puntos es obligatoria' })
  @IsNumber({}, { message: 'La cantidad de puntos debe ser un número válido' })
  @IsPositive({ message: 'La cantidad de puntos debe ser mayor que 0' })
  @Min(1, { message: 'Debe agregar al menos 1 punto' })
  @Max(10000, { message: 'No se pueden agregar más de 10,000 puntos de una vez' })
  @Type(() => Number)
  puntos!: number;

  @ApiProperty({
    description: 'Descripción del motivo por el que se agregan puntos',
    example: 'Compra en cafetería - Pedido #123'
  })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString({ message: 'La descripción debe ser un texto válido' })
  @Type(() => String)
  descripcion!: string;
}