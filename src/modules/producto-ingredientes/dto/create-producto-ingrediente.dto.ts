import { IsNotEmpty, IsNumber, IsPositive, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductoIngredienteDto {
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  @IsNumber({}, { message: 'El ID del producto debe ser un número válido' })
  @IsPositive({ message: 'El ID del producto debe ser mayor que 0' })
  @Type(() => Number)
  productoId!: number;

  @IsNotEmpty({ message: 'El ID del ingrediente es obligatorio' })
  @IsNumber({}, { message: 'El ID del ingrediente debe ser un número válido' })
  @IsPositive({ message: 'El ID del ingrediente debe ser mayor que 0' })
  @Type(() => Number)
  ingredienteId!: number;

  @IsOptional()
  @IsNumber({}, { message: 'La cantidad debe ser un número válido' })
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  @Type(() => Number)
  cantidad?: number;
}