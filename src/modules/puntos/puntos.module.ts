import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PuntosService } from './puntos.service';
import { PuntosController } from './puntos.controller';
import { Puntos } from './entities/puntos.entity';
import { User } from '../users/entities/user.entity';
import { PuntosPagoListener } from './listeners/puntos-pago.listener';
import { PuntosUsuarioListener } from './listeners/puntos-usuario.listener';

/**
 * Módulo de gestión de puntos de lealtad
 * 
 * Este módulo maneja todo lo relacionado con el sistema de puntos de fidelización
 * de la cafetería, incluyendo la acumulación de puntos por compras, canje de puntos
 * por beneficios, y gestión administrativa del programa de lealtad.
 * 
 * Funcionalidades principales:
 * - Acumulación automática de puntos por compras
 * - Canje de puntos por descuentos y beneficios
 * - Ranking de usuarios por puntos
 * - Estadísticas del programa de fidelización
 * - Gestión administrativa de puntos
 * 
 * Reglas de negocio:
 * - 1 punto por cada $1 gastado (máximo 500 puntos por compra)
 * - Los puntos se acumulan automáticamente al completar pedidos
 * - Los clientes pueden canjear sus puntos por beneficios
 * - Solo administradores pueden ver estadísticas globales y ranking
 * - Solo administradores pueden agregar/editar puntos manualmente
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Puntos, User], 'customerConnection')
  ],
  controllers: [PuntosController],
  providers: [PuntosService, PuntosPagoListener, PuntosUsuarioListener],
  exports: [PuntosService], // Para usar en otros módulos (ej: Pedidos)
})
export class PuntosModule {}