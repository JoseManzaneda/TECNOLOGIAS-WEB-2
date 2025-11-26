export class PedidoResponseDto {
  id!: number;
  usuarioId!: number;
  usuarioNombre?: string;
  fecha!: Date;
  estado!: 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado';
  metodoPago!: 'tarjeta' | 'qr' | 'efectivo';
  total!: number;
  detalles?: PedidoDetalleDto[];
}

export class PedidoDetalleDto {
  productoId!: number;
  productoNombre?: string;
  cantidad!: number;
  precioUnitario!: number;
  subtotal?: number;
}

export class PedidoBasicDto {
  id!: number;
  usuarioId!: number;
  estado!: string;
  total!: number;
  fecha!: Date;
}
