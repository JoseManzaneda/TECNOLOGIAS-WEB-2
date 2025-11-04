import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'Nombre: longitud máxima 50 caracteres' })
  nombre!: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@example.com',
    maxLength: 100,
  })
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @MaxLength(100, { message: 'Email: longitud máxima 100 caracteres' })
  email!: string;

  @ApiProperty({
    description: 'Contraseña del usuario (debe contener al menos una mayúscula, una minúscula y un dígito)',
    example: 'Password123',
    minLength: 8,
    maxLength: 64,
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(64, { message: 'La contraseña no puede superar los 64 caracteres' })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, {
    message: 'La contraseña debe tener al menos una mayúscula, una minúscula y un dígito',
  })
  contrasena!: string;

  @ApiProperty({
    description: 'Número de teléfono del usuario',
    example: '987654321',
    required: false,
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @MaxLength(20, { message: 'Teléfono: longitud máxima 20 caracteres' })
  @Matches(/^[0-9+\-\s()]+$/, { message: 'El teléfono debe contener solo números y caracteres válidos' })
  telefono?: string;

  @ApiProperty({
    description: 'Rol del usuario (solo "cliente" en registro público)',
    example: 'cliente',
    enum: ['cliente'],
    required: false,
    default: 'cliente',
  })
  @IsOptional()
  @IsIn(['cliente'], { message: 'El rol solo puede ser "cliente" en el registro público' })
  rol?: 'cliente';
}