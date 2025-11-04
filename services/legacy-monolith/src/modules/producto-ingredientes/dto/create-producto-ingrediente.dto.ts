import { IsNotEmpty, IsNumber, IsPositive, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductoIngredienteDto {
  @ApiProperty({
    description: 'ID del producto',
    example: 1,
    minimum: 1
  })
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  @IsNumber({}, { message: 'El ID del producto debe ser un número válido' })
  @IsPositive({ message: 'El ID del producto debe ser mayor que 0' })
  @Type(() => Number)
  productoId!: number;

  @ApiProperty({
    description: 'ID del ingrediente',
    example: 3,
    minimum: 1
  })
  @IsNotEmpty({ message: 'El ID del ingrediente es obligatorio' })
  @IsNumber({}, { message: 'El ID del ingrediente debe ser un número válido' })
  @IsPositive({ message: 'El ID del ingrediente debe ser mayor que 0' })
  @Type(() => Number)
  ingredienteId!: number;

  @ApiProperty({
    description: 'Cantidad de ingrediente necesaria',
    example: 0.5,
    required: false,
    minimum: 0
  })
  @IsOptional()
  @IsNumber({}, { message: 'La cantidad debe ser un número válido' })
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  @Type(() => Number)
  cantidad?: number;
}