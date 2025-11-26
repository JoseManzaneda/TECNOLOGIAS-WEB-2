export class StockActualizadoEvent {
  constructor(
    public readonly productoId: number,
    public readonly stockAnterior: number,
    public readonly stockNuevo: number,
    public readonly motivo: 'venta' | 'reposicion' | 'ajuste',
  ) {}
}

export class ProductoCreadoEvent {
  constructor(
    public readonly productoId: number,
    public readonly nombre: string,
    public readonly precio: number,
  ) {}
}

export class ProductoAgotadoEvent {
  constructor(
    public readonly productoId: number,
    public readonly nombre: string,
  ) {}
}
