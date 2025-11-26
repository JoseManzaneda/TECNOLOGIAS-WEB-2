export class PuntosAgregadosEvent {
  constructor(
    public readonly usuarioId: number,
    public readonly puntosAgregados: number,
    public readonly nuevoTotal: number,
    public readonly razon: string,
  ) {}
}

export class PuntosCanjeadosEvent {
  constructor(
    public readonly usuarioId: number,
    public readonly puntosCanjeados: number,
    public readonly nuevoTotal: number,
    public readonly premio: string,
  ) {}
}
