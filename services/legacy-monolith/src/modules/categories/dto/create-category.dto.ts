import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Cafés Calientes',
    minLength: 2,
    maxLength: 50
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'Nombre: longitud máxima 50 caracteres' })
  nombre!: string;

  @ApiProperty({
    description: 'Descripción de la categoría',
    example: 'Variedad de bebidas de café servidas calientes',
    required: false,
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(500, { message: 'Descripción: longitud máxima 500 caracteres' })
  descripcion?: string;
}