export class ReservaConfirmadaEvent {
  constructor(
    public readonly reservaId: number,
    public readonly usuarioId: number,
    public readonly fechaReserva: Date,
    public readonly hora: string,
    public readonly numPersonas: number,
  ) {}
}

export class ReservaCanceladaEvent {
  constructor(
    public readonly reservaId: number,
    public readonly usuarioId: number,
    public readonly motivo?: string,
  ) {}
}
