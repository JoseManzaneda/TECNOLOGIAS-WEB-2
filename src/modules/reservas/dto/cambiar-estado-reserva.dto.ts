import { IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';

/**
 * DTO para cambiar el estado de una reserva
 * 
 * Permite a los administradores y usuarios cambiar el estado de las reservas
 * con validaciones específicas para cada transición de estado.
 * 
 * Estados válidos:
 * - pendiente → confirmada (admin)
 * - pendiente → cancelada (admin/usuario)
 * - confirmada → cancelada (admin/usuario)
 * 
 * Transiciones no permitidas:
 * - cancelada → cualquier otro estado
 * - cambios a reservas pasadas
 */
export class CambiarEstadoReservaDto {
  /**
   * Nuevo estado para la reserva
   * 
   * Estados disponibles:
   * - 'confirmada': La reserva ha sido aprobada por el establecimiento
   * - 'cancelada': La reserva ha sido cancelada
   * 
   * Nota: 'pendiente' no está disponible ya que es el estado inicial
   * 
   * @example "confirmada"
   */
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  @IsString({ message: 'El estado debe ser una cadena de texto' })
  @IsIn(['confirmada', 'cancelada'], { 
    message: 'El estado debe ser "confirmada" o "cancelada"' 
  })
  estado!: 'confirmada' | 'cancelada';

  /**
   * Motivo del cambio de estado (opcional)
   * Se recomienda especificar el motivo, especialmente para cancelaciones
   * 
   * @example "Mesa no disponible para esa fecha"
   * @example "El cliente canceló por cambio de planes"
   */
  @IsOptional()
  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  motivo?: string;
}