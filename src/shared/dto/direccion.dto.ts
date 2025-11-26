export class DireccionResponseDto {
  id!: number;
  usuarioId!: number;
  direccion!: string;
  ciudad?: string;
  referencia?: string;
  fechaCreacion!: Date;
}
