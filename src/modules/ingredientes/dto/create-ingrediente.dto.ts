import { IsNotEmpty, IsString, MaxLength, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIngredienteDto {
  @ApiProperty({
    description: 'Nombre del ingrediente',
    example: 'Leche Entera',
    minLength: 2,
    maxLength: 50
  })
  @IsNotEmpty({ message: 'El nombre del ingrediente es obligatorio' })
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder los 50 caracteres' })
  nombre!: string;

  @ApiProperty({
    description: 'Unidad de medida del ingrediente',
    example: 'litros',
    required: false,
    minLength: 1,
    maxLength: 20
  })
  @IsOptional()
  @IsString({ message: 'La unidad debe ser un texto válido' })
  @MinLength(1, { message: 'La unidad debe tener al menos 1 caracter' })
  @MaxLength(20, { message: 'La unidad no puede exceder los 20 caracteres' })
  unidad?: string;
}