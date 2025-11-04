import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength, Min, IsUrl } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ 
    description: 'Nombre del producto',
    example: 'Cappuccino',
    minLength: 2,
    maxLength: 50
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'Nombre: longitud máxima 50 caracteres' })
  nombre!: string;

  @ApiProperty({ 
    description: 'Descripción del producto',
    example: 'Café con leche espumosa',
    required: false,
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(500, { message: 'Descripción: longitud máxima 500 caracteres' })
  descripcion?: string;

  @ApiProperty({ 
    description: 'Precio del producto',
    example: 25.50,
    minimum: 0.01
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número con máximo 2 decimales' })
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  @Type(() => Number)
  precio!: number;

  @ApiProperty({ 
    description: 'ID de la categoría del producto',
    example: 1,
    required: false,
    minimum: 1
  })
  @IsOptional()
  @IsInt({ message: 'El ID de categoría debe ser un número entero' })
  @Min(1, { message: 'El ID de categoría debe ser mayor a 0' })
  @Type(() => Number)
  id_categoria?: number;

  @ApiProperty({ 
    description: 'URL de la imagen del producto',
    example: 'https://example.com/images/cappuccino.jpg',
    required: false,
    maxLength: 255
  })
  @IsOptional()
  @IsString({ message: 'La URL de imagen debe ser una cadena de texto' })
  @IsUrl({}, { message: 'La URL de imagen debe tener un formato válido' })
  @MaxLength(255, { message: 'URL de imagen: longitud máxima 255 caracteres' })
  imagenUrl?: string;

  @ApiProperty({ 
    description: 'Cantidad en stock del producto',
    example: 100,
    required: false,
    minimum: 0,
    default: 0
  })
  @IsOptional()
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  @Type(() => Number)
  stock?: number = 0;

  @ApiProperty({ 
    description: 'Indica si el producto está disponible para venta',
    example: true,
    required: false,
    default: true
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo disponible debe ser verdadero o falso' })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  disponible?: boolean = true;
}