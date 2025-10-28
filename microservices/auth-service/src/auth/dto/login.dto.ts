import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * DTO para inicio de sesión
 */
export class LoginDto {
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @MaxLength(100, { message: 'Email: longitud máxima 100 caracteres' })
  email!: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(64, { message: 'La contraseña no puede superar los 64 caracteres' })
  password!: string;
}
