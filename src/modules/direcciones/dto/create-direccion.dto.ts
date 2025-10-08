import { IsString, IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateDireccionDto {
  @IsString({ message: 'La dirección debe ser un texto válido' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  @MinLength(10, { message: 'La dirección debe tener al menos 10 caracteres' })
  @MaxLength(255, { message: 'La dirección no puede exceder 255 caracteres' })
  direccion!: string;

  @IsOptional()
  @IsString({ message: 'La ciudad debe ser un texto válido' })
  @MaxLength(100, { message: 'La ciudad no puede exceder 100 caracteres' })
  ciudad?: string;

  @IsOptional()
  @IsString({ message: 'La referencia debe ser un texto válido' })
  @MaxLength(500, { message: 'La referencia no puede exceder 500 caracteres' })
  referencia?: string;
}