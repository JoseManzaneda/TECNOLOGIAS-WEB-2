export class ProductOutOfStockEvent {
  constructor(
    public readonly productId: number,
    public readonly nombre: string,
  ) {}
}
