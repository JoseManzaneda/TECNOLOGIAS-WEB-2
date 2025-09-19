import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, MinLength, MaxLength, Matches, IsIn } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'nombre: longitud máxima 100' })
  nombre?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, {
    message: 'La contraseña debe tener mayúscula, minúscula y dígito',
  })
  password?: string;

  @IsOptional()
  @IsIn(['cliente', 'admin'], { message: 'rol: debe ser cliente o admin' })
  rol?: UserRole;
}