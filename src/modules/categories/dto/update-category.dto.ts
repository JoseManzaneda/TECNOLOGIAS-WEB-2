import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
	@IsOptional()
	@IsString()
	@MaxLength(100, { message: 'nombre: longitud máxima 100' })
	nombre?: string;
}