import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  precio!: number;

  @IsOptional()
  @IsNumber()
  idCategoria?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  imagenUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsBoolean()
  disponible?: boolean;
}
