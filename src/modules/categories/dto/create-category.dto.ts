import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'nombre: longitud máxima 100' })
  nombre!: string; // definite assignment assertion (se asigna vía deserialización/validation pipe)

  @IsString()
  @IsOptional()
  descripcion?: string;
}