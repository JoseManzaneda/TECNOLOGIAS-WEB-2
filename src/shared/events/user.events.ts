export class UsuarioRegistradoEvent {
  constructor(
    public readonly usuarioId: number,
    public readonly nombre: string,
    public readonly email: string,
  ) {}
}

export class UsuarioActualizadoEvent {
  constructor(
    public readonly usuarioId: number,
    public readonly cambios: Record<string, any>,
  ) {}
}

export class UsuarioEliminadoEvent {
  constructor(
    public readonly usuarioId: number,
  ) {}
}
