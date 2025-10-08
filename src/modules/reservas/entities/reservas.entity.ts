import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Entidad que representa las reservas de mesa en la cafetería
 * 
 * Una reserva permite a los usuarios separar una mesa para una fecha,
 * hora y número de personas específicos. Las reservas tienen estados
 * que permiten gestionar el flujo completo desde la solicitud hasta
 * la confirmación o cancelación.
 * 
 * Estados de reserva:
 * - pendiente: Reserva creada, esperando confirmación del establecimiento
 * - confirmada: Reserva aprobada y confirmada por el establecimiento
 * - cancelada: Reserva cancelada (por el usuario o el establecimiento)
 * 
 * Reglas de negocio:
 * - Cada reserva debe tener fecha futura (no se permiten reservas para fechas pasadas)
 * - El horario debe estar dentro del horario de atención
 * - Número máximo de personas por reserva: 12
 * - Número mínimo de personas por reserva: 1
 * - Solo se permiten reservas con 24 horas de anticipación mínima
 */
@Entity('reservas')
export class Reservas {
  /**
   * Identificador único de la reserva
   */
  @PrimaryGeneratedColumn({ name: 'id_reserva' })
  id!: number;

  /**
   * ID del usuario que realiza la reserva
   * Referencia a la tabla usuarios
   */
  @Column({ name: 'id_usuario' })
  userId!: number;

  /**
   * Fecha de la reserva (sin hora)
   * Formato: YYYY-MM-DD
   * Debe ser fecha futura
   */
  @Column({ 
    name: 'fecha_reserva',
    type: 'date',
    comment: 'Fecha de la reserva en formato YYYY-MM-DD'
  })
  fechaReserva!: string;

  /**
   * Hora de la reserva
   * Formato: HH:MM:SS
   * Debe estar dentro del horario de atención (08:00 - 22:00)
   */
  @Column({ 
    name: 'hora',
    type: 'time',
    comment: 'Hora de la reserva en formato HH:MM:SS'
  })
  hora!: string;

  /**
   * Número de personas para la reserva
   * Mínimo: 1, Máximo: 12
   */
  @Column({ 
    name: 'num_personas',
    type: 'int',
    comment: 'Número de personas (1-12)'
  })
  numPersonas!: number;

  /**
   * Estado actual de la reserva
   * - pendiente: Esperando confirmación
   * - confirmada: Aprobada por el establecimiento
   * - cancelada: Cancelada por cualquier motivo
   */
  @Column({
    type: 'enum',
    enum: ['pendiente', 'confirmada', 'cancelada'],
    default: 'pendiente',
    comment: 'Estado de la reserva: pendiente, confirmada o cancelada'
  })
  estado!: 'pendiente' | 'confirmada' | 'cancelada';

  /**
   * Fecha y hora de creación del registro
   */
  @CreateDateColumn({ 
    name: 'fecha_creacion',
    comment: 'Fecha y hora de creación de la reserva' 
  })
  fechaCreacion!: Date;

  /**
   * Fecha y hora de la última actualización
   */
  @UpdateDateColumn({ 
    name: 'fecha_actualizacion',
    comment: 'Fecha y hora de la última actualización' 
  })
  fechaActualizacion!: Date;

  /**
   * Relación Many-to-One con User
   * Una reserva pertenece a un usuario
   * Un usuario puede tener muchas reservas
   */
  @ManyToOne(() => User, user => user.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'id_usuario' })
  user!: User;

  /**
   * Método helper para obtener fecha y hora completas
   * Combina fechaReserva y hora en un objeto Date
   */
  getFechaHoraCompleta(): Date {
    return new Date(`${this.fechaReserva}T${this.hora}`);
  }

  /**
   * Método helper para verificar si la reserva es futura
   * Retorna true si la fecha y hora de la reserva son futuras
   */
  esFutura(): boolean {
    const ahora = new Date();
    const fechaHoraReserva = this.getFechaHoraCompleta();
    return fechaHoraReserva > ahora;
  }

  /**
   * Método helper para verificar si la reserva se puede cancelar
   * Las reservas se pueden cancelar si están pendientes o confirmadas
   * y la fecha de la reserva aún no ha pasado
   */
  sePuedeCancelar(): boolean {
    return (this.estado === 'pendiente' || this.estado === 'confirmada') && this.esFutura();
  }

  /**
   * Método helper para verificar si la reserva se puede confirmar
   * Solo se pueden confirmar reservas en estado pendiente y futuras
   */
  sePuedeConfirmar(): boolean {
    return this.estado === 'pendiente' && this.esFutura();
  }
}