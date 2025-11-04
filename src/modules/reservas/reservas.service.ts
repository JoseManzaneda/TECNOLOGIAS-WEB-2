import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservas } from './entities/reservas.entity';
import { User } from '../users/entities/user.entity';
import { CreateReservasDto } from './dto/create-reservas.dto';
import { UpdateReservasDto } from './dto/update-reservas.dto';
import { CambiarEstadoReservaDto } from './dto/cambiar-estado-reserva.dto';

/**
 * Servicio para gestión de reservas de mesa
 * 
 * Proporciona toda la lógica de negocio para el sistema de reservas
 * de la cafetería, incluyendo validaciones de horarios, disponibilidad,
 * y gestión de estados de reservas.
 * 
 * Funcionalidades principales:
 * - CRUD completo de reservas con validaciones de negocio
 * - Verificación de disponibilidad de horarios
 * - Gestión de estados de reservas (pendiente/confirmada/cancelada)
 * - Control de acceso basado en roles (admin/cliente)
 * - Validaciones de fechas futuras y horarios de atención
 * - Límites de capacidad y tiempo mínimo de reserva
 * 
 * Reglas de negocio implementadas:
 * - Horario de atención: 08:00 - 22:00
 * - Reservas con mínimo 24 horas de anticipación
 * - Máximo 12 personas por reserva
 * - No se permiten reservas duplicadas (mismo usuario, fecha, hora)
 * - Solo reservas futuras pueden ser modificadas
 */
@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reservas)
    private readonly reservasRepository: Repository<Reservas>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Crear una nueva reserva
   * 
   * Valida todos los requisitos de negocio antes de crear la reserva:
   * - Usuario existente y activo
   * - Fecha futura con mínimo 24 horas de anticipación
   * - Horario dentro del rango de atención
   * - Disponibilidad de horario (no conflictos)
   * - Límites de personas
   * 
   * @param createReservasDto - Datos de la nueva reserva
   * @param user - Usuario que realiza la acción
   * @returns Promise<Reservas> - La reserva creada
   * 
   * @throws NotFoundException - Si el usuario no existe
   * @throws BadRequestException - Si la fecha/hora no son válidas
   * @throws ConflictException - Si ya existe una reserva en ese horario
   */
  async create(createReservasDto: CreateReservasDto, user: User): Promise<Reservas> {
    const { id_usuario, fecha_reserva, hora, num_personas, estado } = createReservasDto;

    // Verificar que el usuario existe
    const targetUser = await this.userRepository.findOne({
      where: { id: id_usuario },
    });

    if (!targetUser) {
      throw new NotFoundException(`Usuario con ID ${id_usuario} no encontrado`);
    }

    // Validar que solo admin puede crear reservas para otros usuarios
    if (user.rol !== 'admin' && user.id !== id_usuario) {
      throw new ForbiddenException('Solo puedes crear reservas para tu propio usuario');
    }

    // Validar que solo admin puede establecer estado diferente a 'pendiente'
    if (estado && estado !== 'pendiente' && user.rol !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden crear reservas con estado específico');
    }

    // Validar fecha futura
    await this.validarFechaFutura(fecha_reserva, hora);

    // Validar horario de atención
    this.validarHorarioAtencion(hora);

    // Validar disponibilidad (no conflictos)
    await this.validarDisponibilidad(fecha_reserva, hora, num_personas);

    // Crear la reserva
    const nuevaReserva = this.reservasRepository.create({
      userId: id_usuario,
      fechaReserva: fecha_reserva,
      hora,
      numPersonas: num_personas,
      estado: estado || 'pendiente',
    });

    return await this.reservasRepository.save(nuevaReserva);
  }

  /**
   * Obtener todas las reservas con filtros opcionales
   * 
   * Los administradores pueden ver todas las reservas.
   * Los usuarios solo pueden ver sus propias reservas.
   * 
   * @param user - Usuario que realiza la consulta
   * @param estado - Filtro opcional por estado
   * @param fecha - Filtro opcional por fecha
   * @returns Promise<Reservas[]> - Lista de reservas
   */
  async findAll(user: User, estado?: string, fecha?: string): Promise<Reservas[]> {
    const queryBuilder = this.reservasRepository
      .createQueryBuilder('reservas')
      .leftJoinAndSelect('reservas.user', 'user')
      .select([
        'reservas.id',
        'reservas.userId',
        'reservas.fechaReserva',
        'reservas.hora',
        'reservas.numPersonas',
        'reservas.estado',
        'user.id',
        'user.nombre',
        'user.email',
        'user.telefono',
      ]);

    // Si no es admin, solo mostrar sus propias reservas
    if (user.rol !== 'admin') {
      queryBuilder.where('reservas.userId = :userId', { userId: user.id });
    }

    // Aplicar filtros opcionales
    if (estado) {
      queryBuilder.andWhere('reservas.estado = :estado', { estado });
    }

    if (fecha) {
      queryBuilder.andWhere('reservas.fechaReserva = :fecha', { fecha });
    }

    // Ordenar por fecha y hora más recientes
    queryBuilder.orderBy('reservas.fechaReserva', 'DESC')
               .addOrderBy('reservas.hora', 'DESC');

    return await queryBuilder.getMany();
  }

  /**
   * Obtener las reservas del usuario autenticado
   * 
   * @param user - Usuario autenticado
   * @param estado - Filtro opcional por estado
   * @returns Promise<Reservas[]> - Reservas del usuario
   */
  async getMisReservas(user: User, estado?: string): Promise<Reservas[]> {
    const queryBuilder = this.reservasRepository
      .createQueryBuilder('reservas')
      .leftJoinAndSelect('reservas.user', 'user')
      .where('reservas.userId = :userId', { userId: user.id })
      .select([
        'reservas.id',
        'reservas.userId',
        'reservas.fechaReserva',
        'reservas.hora',
        'reservas.numPersonas',
        'reservas.estado',
        'user.id',
        'user.nombre',
        'user.email',
      ]);

    if (estado) {
      queryBuilder.andWhere('reservas.estado = :estado', { estado });
    }

    queryBuilder.orderBy('reservas.fechaReserva', 'DESC')
               .addOrderBy('reservas.hora', 'DESC');

    return await queryBuilder.getMany();
  }

  /**
   * Obtener una reserva específica por ID
   * 
   * @param id - ID de la reserva
   * @param user - Usuario que realiza la consulta
   * @returns Promise<Reservas> - La reserva encontrada
   * 
   * @throws NotFoundException - Si la reserva no existe
   * @throws ForbiddenException - Si el usuario no tiene permisos
   */
  async findOne(id: number, user: User): Promise<Reservas> {
    const reserva = await this.reservasRepository.findOne({
      where: { id },
      relations: ['user'],
      select: {
        id: true,
        userId: true,
        fechaReserva: true,
        hora: true,
        numPersonas: true,
        estado: true,
        user: {
          id: true,
          nombre: true,
          email: true,
          telefono: true,
        },
      },
    });

    if (!reserva) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }

    // Verificar autorización: admin puede ver cualquier reserva, usuario solo la suya
    if (user.rol !== 'admin' && reserva.userId !== user.id) {
      throw new ForbiddenException('No tienes permiso para ver esta reserva');
    }

    return reserva;
  }

  /**
   * Actualizar una reserva existente
   * 
   * @param id - ID de la reserva a actualizar
   * @param updateReservasDto - Datos a actualizar
   * @param user - Usuario que realiza la acción
   * @returns Promise<Reservas> - La reserva actualizada
   * 
   * @throws NotFoundException - Si la reserva no existe
   * @throws ForbiddenException - Si no tiene permisos
   * @throws BadRequestException - Si la reserva no se puede modificar
   */
  async update(id: number, updateReservasDto: UpdateReservasDto, user: User): Promise<Reservas> {
    const reserva = await this.findOne(id, user);

    // Validar que se puede modificar la reserva
    if (reserva.estado === 'cancelada') {
      throw new BadRequestException('No se puede modificar una reserva cancelada');
    }

    // Verificar que la reserva es futura
    const fechaHoraReserva = new Date(`${reserva.fechaReserva}T${reserva.hora}`);
    if (fechaHoraReserva <= new Date()) {
      throw new BadRequestException('No se puede modificar una reserva pasada');
    }

    // Si se actualiza fecha/hora, validar nuevamente
    if (updateReservasDto.fecha_reserva || updateReservasDto.hora) {
      const nuevaFecha = updateReservasDto.fecha_reserva || reserva.fechaReserva;
      const nuevaHora = updateReservasDto.hora || reserva.hora;

      await this.validarFechaFutura(nuevaFecha, nuevaHora);
      this.validarHorarioAtencion(nuevaHora);
      
      // Validar disponibilidad solo si cambia la fecha/hora
      if (nuevaFecha !== reserva.fechaReserva || nuevaHora !== reserva.hora) {
        await this.validarDisponibilidad(
          nuevaFecha, 
          nuevaHora, 
          updateReservasDto.num_personas || reserva.numPersonas,
          id // Excluir la reserva actual de la validación
        );
      }
    }

    // Validar que solo admin puede cambiar ciertos campos
    if (updateReservasDto.estado && user.rol !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden cambiar el estado de las reservas');
    }

    if (updateReservasDto.id_usuario && user.rol !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden cambiar el usuario de las reservas');
    }

    // Mapear los campos del DTO a la entidad
    if (updateReservasDto.id_usuario !== undefined) reserva.userId = updateReservasDto.id_usuario;
    if (updateReservasDto.fecha_reserva !== undefined) reserva.fechaReserva = updateReservasDto.fecha_reserva;
    if (updateReservasDto.hora !== undefined) reserva.hora = updateReservasDto.hora;
    if (updateReservasDto.num_personas !== undefined) reserva.numPersonas = updateReservasDto.num_personas;
    if (updateReservasDto.estado !== undefined) reserva.estado = updateReservasDto.estado;

    return await this.reservasRepository.save(reserva);
  }

  /**
   * Cambiar el estado de una reserva
   * 
   * @param id - ID de la reserva
   * @param cambiarEstadoDto - Nuevo estado y motivo opcional
   * @param user - Usuario que realiza la acción
   * @returns Promise<Reservas> - La reserva actualizada
   */
  async cambiarEstado(id: number, cambiarEstadoDto: CambiarEstadoReservaDto, user: User): Promise<Reservas> {
    const reserva = await this.findOne(id, user);
    const { estado } = cambiarEstadoDto;

    // Validar transiciones de estado válidas
    if (reserva.estado === 'cancelada') {
      throw new BadRequestException('No se puede cambiar el estado de una reserva cancelada');
    }

    // Solo admin puede confirmar reservas
    if (estado === 'confirmada' && user.rol !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden confirmar reservas');
    }

    // Actualizar estado
    reserva.estado = estado;
    return await this.reservasRepository.save(reserva);
  }

  /**
   * Eliminar una reserva (cancelar)
   * 
   * @param id - ID de la reserva
   * @param user - Usuario que realiza la acción
   * @returns Promise<void>
   */
  async remove(id: number, user: User): Promise<void> {
    const reserva = await this.findOne(id, user);

    // Solo se pueden eliminar reservas pendientes o futuras
    if (reserva.estado === 'cancelada') {
      throw new BadRequestException('La reserva ya está cancelada');
    }

    // Verificar que la reserva es futura (solo reservas futuras se pueden cancelar)
    const fechaHoraReserva = new Date(`${reserva.fechaReserva}T${reserva.hora}`);
    if (fechaHoraReserva <= new Date()) {
      throw new BadRequestException('No se puede cancelar una reserva pasada');
    }

    // En lugar de eliminar físicamente, cambiar estado a cancelada
    reserva.estado = 'cancelada';
    await this.reservasRepository.save(reserva);
  }

  /**
   * Obtener estadísticas de reservas (solo admin)
   * 
   * @param user - Usuario que realiza la consulta
   * @returns Promise<object> - Estadísticas del sistema
   */
  async getEstadisticas(user: User): Promise<{
    totalReservas: number;
    reservasPendientes: number;
    reservasConfirmadas: number;
    reservasCanceladas: number;
    reservasHoy: number;
    reservasFuturas: number;
    promedioPersonasPorReserva: number;
  }> {
    if (user.rol !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden ver las estadísticas');
    }

    // Fecha de hoy (YYYY-MM-DD)
    const hoy = new Date().toISOString().split('T')[0];

    // Contadores principales (sin riesgo de mapeo de columnas)
    const [
      totalReservas,
      reservasPendientes,
      reservasConfirmadas,
      reservasCanceladas,
    ] = await Promise.all([
      this.reservasRepository.count(),
      this.reservasRepository.count({ where: { estado: 'pendiente' } }),
      this.reservasRepository.count({ where: { estado: 'confirmada' } }),
      this.reservasRepository.count({ where: { estado: 'cancelada' } }),
    ]);

    // Contadores por fecha usando property paths (TypeORM los resuelve correctamente en WHERE)
    const reservasHoy = await this.reservasRepository
      .createQueryBuilder('reservas')
      .where('reservas.fechaReserva = :hoy', { hoy })
      .getCount();

    const reservasFuturas = await this.reservasRepository
      .createQueryBuilder('reservas')
      .where('reservas.fechaReserva > :hoy', { hoy })
      .getCount();

    // Promedio de personas por reserva (consultado con snake_case explícito para evitar ambigüedad)
    const promedioRaw = await this.reservasRepository
      .createQueryBuilder('reservas')
      .select('AVG("num_personas")', 'avg')
      .getRawOne<{ avg: string | null }>();

    const promedioPersonasPorReserva = promedioRaw?.avg ? parseFloat(promedioRaw.avg) : 0;

    return {
      totalReservas,
      reservasPendientes,
      reservasConfirmadas,
      reservasCanceladas,
      reservasHoy,
      reservasFuturas,
      promedioPersonasPorReserva,
    };
  }

  /**
   * Validar que la fecha y hora son futuras (mínimo 24 horas)
   * 
   * @param fecha - Fecha de la reserva
   * @param hora - Hora de la reserva
   * @throws BadRequestException - Si la fecha/hora no son válidas
   */
  private async validarFechaFutura(fecha: string, hora: string): Promise<void> {
    const ahora = new Date();
    const fechaHoraReserva = new Date(`${fecha}T${hora}:00`);

    // Verificar que es fecha futura
    if (fechaHoraReserva <= ahora) {
      throw new BadRequestException('La reserva debe ser para una fecha y hora futuras');
    }

    // Verificar mínimo 24 horas de anticipación
    const diferenciaTiempo = fechaHoraReserva.getTime() - ahora.getTime();
    const horasAnticipacion = diferenciaTiempo / (1000 * 60 * 60);

    if (horasAnticipacion < 24) {
      throw new BadRequestException('Las reservas deben realizarse con mínimo 24 horas de anticipación');
    }
  }

  /**
   * Validar que la hora está dentro del horario de atención
   * 
   * @param hora - Hora en formato HH:MM
   * @throws BadRequestException - Si está fuera del horario
   */
  private validarHorarioAtencion(hora: string): void {
    const [horas, minutos] = hora.split(':').map(Number);
    const horaEnMinutos = horas * 60 + minutos;

    // Horario de atención: 08:00 - 22:00
    const inicioAtencion = 8 * 60; // 08:00 en minutos
    const finAtencion = 22 * 60;   // 22:00 en minutos

    if (horaEnMinutos < inicioAtencion || horaEnMinutos > finAtencion) {
      throw new BadRequestException('Las reservas solo están disponibles de 08:00 a 22:00');
    }
  }

  /**
   * Validar disponibilidad de horario (no conflictos)
   * 
   * @param fecha - Fecha de la reserva
   * @param hora - Hora de la reserva
   * @param numPersonas - Número de personas
   * @param excluirId - ID de reserva a excluir (para actualizaciones)
   * @throws ConflictException - Si ya existe una reserva
   */
  private async validarDisponibilidad(
    fecha: string, 
    hora: string, 
    numPersonas: number,
    excluirId?: number
  ): Promise<void> {
    const queryBuilder = this.reservasRepository
      .createQueryBuilder('reservas')
      .where('reservas.fechaReserva = :fecha', { fecha })
      .andWhere('reservas.hora = :hora', { hora })
      .andWhere('reservas.estado IN (:...estados)', { estados: ['pendiente', 'confirmada'] });

    if (excluirId) {
      queryBuilder.andWhere('reservas.id != :excluirId', { excluirId });
    }

    const reservasExistentes = await queryBuilder.getMany();

    if (reservasExistentes.length > 0) {
      throw new ConflictException(`Ya existe una reserva para ${fecha} a las ${hora}`);
    }

    // Aquí se podrían agregar más validaciones de capacidad total
    // por ejemplo, verificar que no se excedan las mesas disponibles
  }
}