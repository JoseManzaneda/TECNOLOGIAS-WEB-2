import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { MaxLength, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
	@IsOptional()
	@IsString()
		@MaxLength(100, { message: 'nombre: longitud máxima 100' })
	nombre?: string;
}