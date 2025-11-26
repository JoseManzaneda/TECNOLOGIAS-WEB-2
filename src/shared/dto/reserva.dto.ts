export class ReservaResponseDto {
  id!: number;
  usuarioId!: number;
  usuarioNombre?: string;
  fechaReserva!: Date;
  hora!: string;
  numPersonas!: number;
  estado!: 'pendiente' | 'confirmada' | 'cancelada';
  fechaCreacion!: Date;
}
