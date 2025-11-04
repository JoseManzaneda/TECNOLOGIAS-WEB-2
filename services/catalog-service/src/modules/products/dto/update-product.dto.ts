import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  // Todos los campos son opcionales gracias a PartialType
  // Las validaciones se heredan de CreateProductDto pero se vuelven opcionales
}