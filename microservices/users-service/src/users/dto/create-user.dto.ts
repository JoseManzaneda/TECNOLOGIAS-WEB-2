import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  nombre!: string;

  @IsEmail()
  @MaxLength(100)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[0-9+\-\s()]+$/)
  telefono?: string;

  @IsOptional()
  @IsIn(['cliente', 'admin'])
  rol?: 'cliente' | 'admin';
}
