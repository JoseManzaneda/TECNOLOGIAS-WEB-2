import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min, IsUrl } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateProductDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MaxLength(100, { message: 'Nombre: longitud máxima 100 caracteres' })
  nombre!: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(500, { message: 'Descripción: longitud máxima 500 caracteres' })
  descripcion?: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número con máximo 2 decimales' })
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  @Type(() => Number)
  precio!: number;

  @IsOptional()
  @IsInt({ message: 'El ID de categoría debe ser un número entero' })
  @Min(1, { message: 'El ID de categoría debe ser mayor a 0' })
  @Type(() => Number)
  categoryId?: number;

  @IsOptional()
  @IsString({ message: 'La URL de imagen debe ser una cadena de texto' })
  @IsUrl({}, { message: 'La URL de imagen debe tener un formato válido' })
  @MaxLength(255, { message: 'URL de imagen: longitud máxima 255 caracteres' })
  imagenUrl?: string;

  @IsOptional()
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  @Type(() => Number)
  stock?: number = 0;

  @IsOptional()
  @IsBoolean({ message: 'El campo disponible debe ser verdadero o falso' })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  disponible?: boolean = true;
}