export class PedidoCreadoEvent {
  constructor(
    public readonly pedidoId: number,
    public readonly usuarioId: number,
    public readonly detalles: Array<{
      productoId: number;
      cantidad: number;
      precioUnitario: number;
    }>,
    public readonly total: number,
    public readonly metodoPago: string,
  ) {}
}

export class PedidoEstadoActualizadoEvent {
  constructor(
    public readonly pedidoId: number,
    public readonly estadoAnterior: string,
    public readonly estadoNuevo: string,
    public readonly usuarioId: number,
  ) {}
}

export class PedidoCanceladoEvent {
  constructor(
    public readonly pedidoId: number,
    public readonly usuarioId: number,
    public readonly detalles: Array<{
      productoId: number;
      cantidad: number;
    }>,
  ) {}
}
