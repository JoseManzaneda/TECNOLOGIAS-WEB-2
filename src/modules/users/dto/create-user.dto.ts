import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength, IsIn } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'nombre: longitud máxima 100' })
  nombre!: string;

  @IsEmail()
  @MaxLength(100, { message: 'email: longitud máxima 100' })
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, {
    message: 'La contraseña debe tener mayúscula, minúscula y dígito',
  })
  password!: string;

  @IsOptional()
  @IsIn(['cliente', 'admin'], { message: 'rol: debe ser cliente o admin' })
  rol?: UserRole;
}