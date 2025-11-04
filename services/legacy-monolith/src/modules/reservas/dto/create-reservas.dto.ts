import { 
  IsNotEmpty, 
  IsDateString, 
  IsString, 
  IsInt, 
  Min, 
  Max, 
  Matches,
  IsOptional
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para crear una nueva reserva
 * 
 * Define y valida todos los campos requeridos para crear una reserva
 * en el sistema de la cafetería. Incluye validaciones de negocio
 * específicas como horarios de atención y límites de personas.
 * 
 * Reglas de validación:
 * - Usuario ID: Requerido, debe ser entero positivo
 * - Fecha: Formato ISO (YYYY-MM-DD), debe ser fecha futura
 * - Hora: Formato HH:MM, dentro del horario de atención (08:00-22:00)
 * - Número de personas: Entre 1 y 12 personas máximo
 */
export class CreateReservasDto {
  /**
   * ID del usuario que realiza la reserva
   */
  @ApiProperty({
    description: 'ID del usuario que realiza la reserva',
    example: 1,
    minimum: 1
  })
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @Min(1, { message: 'El ID del usuario debe ser mayor a 0' })
  @Type(() => Number)
  id_usuario!: number;

  /**
   * Fecha de la reserva
   * Formato: YYYY-MM-DD
   * Debe ser fecha futura (no se permiten reservas para fechas pasadas)
   */
  @ApiProperty({
    description: 'Fecha de la reserva en formato YYYY-MM-DD',
    example: '2025-11-10',
    format: 'date'
  })
  @IsNotEmpty({ message: 'La fecha de reserva es obligatoria' })
  @IsDateString({ strict: true }, { 
    message: 'La fecha debe estar en formato YYYY-MM-DD válido' 
  })
  fecha_reserva!: string;

  /**
   * Hora de la reserva
   * Formato: HH:MM (24 horas)
   * Debe estar dentro del horario de atención: 08:00 - 22:00
   * Se aceptan reservas cada 30 minutos (:00 o :30)
   */
  @ApiProperty({
    description: 'Hora de la reserva en formato HH:MM (horario 24h)',
    example: '14:30',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
  })
  @IsNotEmpty({ message: 'La hora de reserva es obligatoria' })
  @IsString({ message: 'La hora debe ser una cadena de texto' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora debe estar en formato HH:MM válido (00:00-23:59)'
  })
  hora!: string;

  /**
   * Número de personas para la reserva
   * Mínimo: 1 persona
   * Máximo: 12 personas (capacidad máxima por mesa)
   */
  @ApiProperty({
    description: 'Número de personas para la reserva (mínimo 1, máximo 12)',
    example: 4,
    minimum: 1,
    maximum: 12
  })
  @IsNotEmpty({ message: 'El número de personas es obligatorio' })
  @IsInt({ message: 'El número de personas debe ser un número entero' })
  @Min(1, { message: 'Debe reservar para mínimo 1 persona' })
  @Max(12, { message: 'El máximo de personas por reserva es 12' })
  @Type(() => Number)
  num_personas!: number;

  /**
   * Estado inicial de la reserva (opcional)
   * Por defecto será 'pendiente'
   * Solo administradores pueden crear reservas con estado diferente
   */
  @ApiProperty({
    description: 'Estado de la reserva',
    enum: ['pendiente', 'confirmada', 'cancelada'],
    example: 'pendiente',
    required: false,
    default: 'pendiente'
  })
  @IsOptional()
  @IsString({ message: 'El estado debe ser una cadena de texto' })
  estado?: 'pendiente' | 'confirmada' | 'cancelada';
}