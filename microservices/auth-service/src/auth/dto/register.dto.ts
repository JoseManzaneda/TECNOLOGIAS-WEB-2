import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength, IsIn } from 'class-validator';

/**
 * DTO para registro de nuevos usuarios
 */
export class RegisterDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'Nombre: longitud máxima 100 caracteres' })
  nombre!: string;

  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @MaxLength(100, { message: 'Email: longitud máxima 100 caracteres' })
  email!: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(64, { message: 'La contraseña no puede superar los 64 caracteres' })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, {
    message: 'La contraseña debe tener al menos una mayúscula, una minúscula y un dígito',
  })
  password!: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @MaxLength(20, { message: 'Teléfono: longitud máxima 20 caracteres' })
  @Matches(/^[0-9+\-\s()]+$/, { 
    message: 'El teléfono debe contener solo números y caracteres válidos' 
  })
  telefono?: string;

  @IsOptional()
  @IsIn(['cliente', 'admin'], { 
    message: 'El rol debe ser "cliente" o "admin"' 
  })
  rol?: 'cliente' | 'admin';
}
