import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  // Todos los campos son opcionales gracias a PartialType
  // Las validaciones se heredan de CreateCategoryDto pero se vuelven opcionales
}