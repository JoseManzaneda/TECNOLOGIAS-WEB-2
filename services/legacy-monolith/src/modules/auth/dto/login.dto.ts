import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@example.com',
    maxLength: 100,
  })
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @MaxLength(100, { message: 'Email: longitud máxima 100 caracteres' })
  email!: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'Password123',
    minLength: 8,
    maxLength: 64,
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(64, { message: 'La contraseña no puede superar los 64 caracteres' })
  contrasena!: string;
}