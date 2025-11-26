export class PagoCreadoEvent {
  constructor(
    public readonly pagoId: number,
    public readonly pedidoId: number,
    public readonly monto: number,
    public readonly metodo: string,
  ) {}
}

export class PagoProcesadoEvent {
  constructor(
    public readonly pagoId: number,
    public readonly pedidoId: number,
    public readonly monto: number,
    public readonly usuarioId: number,
  ) {}
}

export class PagoRechazadoEvent {
  constructor(
    public readonly pagoId: number,
    public readonly pedidoId: number,
    public readonly razon: string,
  ) {}
}
