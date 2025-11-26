export class UserResponseDto {
  id!: number;
  nombre!: string;
  email!: string;
  telefono?: string;
  rol!: 'admin' | 'cliente';
  activo!: boolean;
  fechaRegistro!: Date;
}

export class UserBasicDto {
  id!: number;
  nombre!: string;
  email!: string;
  rol!: 'admin' | 'cliente';
}
