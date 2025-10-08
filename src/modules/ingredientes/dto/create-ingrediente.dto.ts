import { IsNotEmpty, IsString, MaxLength, IsOptional, MinLength } from 'class-validator';

export class CreateIngredienteDto {
  @IsNotEmpty({ message: 'El nombre del ingrediente es obligatorio' })
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder los 50 caracteres' })
  nombre!: string;

  @IsOptional()
  @IsString({ message: 'La unidad debe ser un texto válido' })
  @MinLength(1, { message: 'La unidad debe tener al menos 1 caracter' })
  @MaxLength(20, { message: 'La unidad no puede exceder los 20 caracteres' })
  unidad?: string;
}