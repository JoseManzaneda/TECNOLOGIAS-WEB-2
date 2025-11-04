import { PartialType } from '@nestjs/mapped-types';
import { CreateReservasDto } from './create-reservas.dto';

/**
 * DTO para actualizar una reserva existente
 * 
 * Hereda todas las propiedades de CreateReservasDto pero las hace opcionales.
 * Esto permite actualizaciones parciales donde el cliente puede enviar
 * solo los campos que desea modificar.
 * 
 * Casos de uso:
 * - Cambiar fecha u hora de la reserva
 * - Modificar el número de personas
 * - Actualizar el estado (solo administradores)
 * 
 * Restricciones:
 * - Solo se pueden actualizar reservas en estado 'pendiente' o 'confirmada'
 * - Los usuarios solo pueden actualizar sus propias reservas
 * - Los administradores pueden actualizar cualquier reserva
 * - No se pueden actualizar reservas pasadas o canceladas
 * 
 * @example
 * // Cambiar solo la fecha
 * { "fechaReserva": "2024-12-30" }
 * 
 * @example
 * // Cambiar fecha, hora y número de personas
 * {
 *   "fechaReserva": "2024-12-30",
 *   "hora": "19:00",
 *   "numPersonas": 6
 * }
 * 
 * @example
 * // Confirmar reserva (solo admin)
 * { "estado": "confirmada" }
 */
export class UpdateReservasDto extends PartialType(CreateReservasDto) {}