export class PagoResponseDto {
  id!: number;
  pedidoId!: number;
  monto!: number;
  metodo!: 'efectivo' | 'tarjeta' | 'transferencia' | 'billetera';
  estado!: 'pendiente' | 'procesado' | 'rechazado';
  fechaCreacion!: Date;
}
