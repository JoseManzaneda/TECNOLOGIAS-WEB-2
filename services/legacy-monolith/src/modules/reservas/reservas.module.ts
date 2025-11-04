import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservasService } from './reservas.service';
import { ReservasController } from './reservas.controller';
import { Reservas } from './entities/reservas.entity';
import { User } from '../users/entities/user.entity';

/**
 * Módulo de gestión de reservas de mesa
 * 
 * Este módulo maneja todo lo relacionado con el sistema de reservas
 * de mesa de la cafetería, proporcionando funcionalidades completas
 * para que los clientes puedan reservar mesas y los administradores
 * puedan gestionar el flujo de reservas.
 * 
 * Funcionalidades principales:
 * - Creación de reservas con validaciones de negocio
 * - Gestión de estados de reserva (pendiente/confirmada/cancelada)
 * - Control de disponibilidad y horarios
 * - Consultas filtradas por estado, fecha y usuario
 * - Estadísticas del sistema para administradores
 * - Control de acceso basado en roles
 * 
 * Reglas de negocio implementadas:
 * - Horario de atención: 08:00 - 22:00
 * - Reservas con mínimo 24 horas de anticipación
 * - Capacidad máxima: 12 personas por reserva
 * - No se permiten reservas duplicadas en mismo horario
 * - Solo reservas futuras pueden ser modificadas
 * - Cancelación lógica (cambio de estado, no eliminación física)
 * 
 * Permisos por rol:
 * - Administradores: Acceso completo a todas las funcionalidades
 *   - Ver todas las reservas del sistema
 *   - Confirmar/cancelar cualquier reserva
 *   - Ver estadísticas del sistema
 *   - Crear reservas para otros usuarios
 * 
 * - Clientes: Gestión de sus propias reservas
 *   - Crear reservas para sí mismos
 *   - Ver solo sus propias reservas
 *   - Modificar/cancelar sus reservas futuras
 *   - No pueden confirmar reservas (solo admin)
 * 
 * Dependencias:
 * - User: Para validación de usuarios y relaciones
 * - TypeORM: Para persistencia de datos
 * - Guards: Para autenticación y autorización
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Reservas, User])
  ],
  controllers: [ReservasController],
  providers: [ReservasService],
  exports: [ReservasService], // Para uso potencial en otros módulos
})
export class ReservasModule {}