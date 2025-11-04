import { IsString, IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDireccionDto {
  @ApiProperty({
    description: 'Dirección completa del usuario',
    example: 'Av. Siempre Viva 123, Urbanización Los Pinos',
    minLength: 10,
    maxLength: 255
  })
  @IsString({ message: 'La dirección debe ser un texto válido' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  @MinLength(10, { message: 'La dirección debe tener al menos 10 caracteres' })
  @MaxLength(255, { message: 'La dirección no puede exceder 255 caracteres' })
  direccion!: string;

  @ApiProperty({
    description: 'Ciudad de la dirección',
    example: 'La Paz',
    required: false,
    maxLength: 100
  })
  @IsOptional()
  @IsString({ message: 'La ciudad debe ser un texto válido' })
  @MaxLength(100, { message: 'La ciudad no puede exceder 100 caracteres' })
  ciudad?: string;

  @ApiProperty({
    description: 'Referencias adicionales para ubicar la dirección',
    example: 'A una cuadra del parque central, portón verde',
    required: false,
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: 'La referencia debe ser un texto válido' })
  @MaxLength(500, { message: 'La referencia no puede exceder 500 caracteres' })
  referencia?: string;
}