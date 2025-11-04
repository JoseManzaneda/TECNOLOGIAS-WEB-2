import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductoIngredienteDto {
  @IsOptional()
  @IsNumber({}, { message: 'La cantidad debe ser un número válido' })
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  @Type(() => Number)
  cantidad?: number;
}