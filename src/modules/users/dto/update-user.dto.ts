import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // Todos los campos son opcionales gracias a PartialType
  // Las validaciones se heredan de CreateUserDto pero se vuelven opcionales
}