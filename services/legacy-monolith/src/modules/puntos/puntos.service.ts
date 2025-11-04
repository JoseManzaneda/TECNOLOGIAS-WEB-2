import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Puntos } from './entities/puntos.entity';
import { User } from '../users/entities/user.entity';
import { CreatePuntosDto } from './dto/create-puntos.dto';
import { UpdatePuntosDto } from './dto/update-puntos.dto';
import { AgregarPuntosDto } from './dto/agregar-puntos.dto';
import { CanjearPuntosDto } from './dto/canjear-puntos.dto';

@Injectable()
export class PuntosService {
  constructor(
    @InjectRepository(Puntos)
    private readonly puntosRepository: Repository<Puntos>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Crear un registro de puntos para un usuario
   * @param createDto - Datos del registro de puntos a crear
   * @param currentUser - Usuario actual (debe ser admin)
   * @returns Promise<Puntos>
   * @throws ForbiddenException si no es admin
   * @throws NotFoundException si el usuario no existe
   * @throws ConflictException si el usuario ya tiene un registro de puntos
   */
  async create(createDto: CreatePuntosDto, currentUser: any): Promise<Puntos> {
    // Solo los administradores pueden crear registros de puntos manualmente
    if (currentUser.rol !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden crear registros de puntos');
    }

    // Verificar que el usuario existe
    const usuario = await this.userRepository.findOne({
      where: { id: createDto.userId }
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${createDto.userId} no encontrado`);
    }

    // Verificar si el usuario ya tiene un registro de puntos
    const puntosExistentes = await this.puntosRepository.findOne({
      where: { userId: createDto.userId }
    });

    if (puntosExistentes) {
      throw new ConflictException(`El usuario "${usuario.nombre}" ya tiene un registro de puntos`);
    }

    const nuevoRegistro = this.puntosRepository.create({
      userId: createDto.userId,
      puntosAcumulados: createDto.puntosAcumulados,
      ultimaActualizacion: new Date(),
    });

    return this.puntosRepository.save(nuevoRegistro);
  }

  /**
   * Crea un registro de puntos inicial para un nuevo usuario con 0 puntos.
   * Este método es llamado por un evento cuando un usuario se registra.
   * @param userId - ID del usuario para el que se crea el registro de puntos.
   * @returns Promise<Puntos>
   * @throws NotFoundException si el usuario no existe.
   */
  async crearPuntosParaNuevoUsuario(userId: number): Promise<Puntos> {
    const puntosExistentes = await this.puntosRepository.findOne({ where: { userId } });
    if (puntosExistentes) {
      // Opcional: loggear que ya existían
      return puntosExistentes;
    }
    const nuevoRegistro = this.puntosRepository.create({
      userId,
      puntosAcumulados: 0,
      ultimaActualizacion: new Date(),
    });
    return this.puntosRepository.save(nuevoRegistro);
  }

  /**
   * Obtener todos los registros de puntos (solo para admin)
   * @param currentUser - Usuario actual (debe ser admin)
   * @returns Promise<Puntos[]>
   * @throws ForbiddenException si no es admin
   */
  async findAll(currentUser: any): Promise<Puntos[]> {
    // Solo los administradores pueden ver todos los registros
    if (currentUser.rol !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden ver todos los registros de puntos');
    }

    return await this.puntosRepository
      .createQueryBuilder('puntos')
      .leftJoinAndSelect('puntos.user', 'user')
      .select([
        'puntos.id',
        'puntos.userId',
        'puntos.puntosAcumulados',
        'puntos.ultimaActualizacion',
        'puntos.fechaCreacion',
        'puntos.fechaActualizacion',
        'user.id',
        'user.nombre',
        'user.email',
        'user.rol'
      ])
      .orderBy('puntos.puntosAcumulados', 'DESC')
      .getMany();
  }

  /**
   * Obtener puntos de un usuario específico
   * @param id - ID del registro de puntos
   * @param currentUser - Usuario actual
   * @returns Promise<Puntos>
   * @throws NotFoundException si el registro no existe
   * @throws ForbiddenException si cliente intenta ver puntos ajenos
   */
  async findOne(id: number, currentUser: any): Promise<Puntos> {
    const puntos = await this.puntosRepository
      .createQueryBuilder('puntos')
      .leftJoinAndSelect('puntos.user', 'user')
      .select([
        'puntos.id',
        'puntos.userId',
        'puntos.puntosAcumulados',
        'puntos.ultimaActualizacion',
        'puntos.fechaCreacion',
        'puntos.fechaActualizacion',
        'user.id',
        'user.nombre',
        'user.email',
        'user.rol'
      ])
      .where('puntos.id = :id', { id })
      .getOne();

    if (!puntos) {
      throw new NotFoundException(`Registro de puntos con ID ${id} no encontrado`);
    }

    // Verificar autorización: admin puede ver cualquier registro, cliente solo el suyo
    if (currentUser.rol !== 'admin' && puntos.userId !== currentUser.id) {
      throw new ForbiddenException('No tienes permisos para acceder a este registro de puntos');
    }

    return puntos;
  }

  /**
   * Obtener puntos de un usuario por su ID de usuario
   * @param userId - ID del usuario
   * @param currentUser - Usuario actual
   * @returns Promise<Puntos>
   * @throws NotFoundException si el usuario no tiene registro de puntos
   * @throws ForbiddenException si cliente intenta ver puntos ajenos
   */
  async findByUserId(userId: number, currentUser: any): Promise<Puntos> {
    // Verificar autorización: admin puede ver cualquier usuario, cliente solo el suyo
    if (currentUser.rol !== 'admin' && userId !== currentUser.id) {
      throw new ForbiddenException('No tienes permisos para acceder a los puntos de este usuario');
    }

    const puntos = await this.puntosRepository
      .createQueryBuilder('puntos')
      .leftJoinAndSelect('puntos.user', 'user')
      .select([
        'puntos.id',
        'puntos.userId',
        'puntos.puntosAcumulados',
        'puntos.ultimaActualizacion',
        'puntos.fechaCreacion',
        'puntos.fechaActualizacion',
        'user.id',
        'user.nombre',
        'user.email',
        'user.rol'
      ])
      .where('puntos.userId = :userId', { userId })
      .getOne();

    if (!puntos) {
      throw new NotFoundException(`El usuario con ID ${userId} no tiene registro de puntos`);
    }

    return puntos;
  }

  /**
   * Obtener mis puntos (usuario autenticado)
   * @param currentUser - Usuario actual
   * @returns Promise<Puntos>
   */
  async getMisPuntos(currentUser: any): Promise<Puntos> {
    return await this.findByUserId(currentUser.id, currentUser);
  }

  /**
   * Actualizar puntos de un usuario
   * @param id - ID del registro de puntos
   * @param updateDto - Datos a actualizar
   * @param currentUser - Usuario actual (debe ser admin)
   * @returns Promise<Puntos>
   * @throws NotFoundException si el registro no existe
   * @throws ForbiddenException si no es admin
   */
  async update(id: number, updateDto: UpdatePuntosDto, currentUser: any): Promise<Puntos> {
    // Solo los administradores pueden actualizar puntos directamente
    if (currentUser.rol !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden actualizar puntos directamente');
    }

    // Verificar que el registro existe
    const puntos = await this.puntosRepository.findOne({
      where: { id }
    });

    if (!puntos) {
      throw new NotFoundException(`Registro de puntos con ID ${id} no encontrado`);
    }

    // Actualizar y guardar los cambios
    Object.assign(puntos, updateDto);
    puntos.ultimaActualizacion = new Date();
    return await this.puntosRepository.save(puntos);
  }

  /**
   * Agregar puntos a un usuario
   * @param userId - ID del usuario
   * @param agregarDto - Datos de los puntos a agregar
   * @param currentUser - Usuario actual
   * @returns Promise<Puntos>
   */
  async agregarPuntos(userId: number, agregarDto: AgregarPuntosDto, currentUser: any): Promise<Puntos> {
    // Verificar autorización: admin puede agregar a cualquier usuario, cliente solo puede ver sus puntos
    if (currentUser.rol !== 'admin' && userId !== currentUser.id) {
      throw new ForbiddenException('No tienes permisos para agregar puntos a este usuario');
    }

    // Si es cliente, no puede agregar puntos manualmente
    if (currentUser.rol === 'cliente') {
      throw new ForbiddenException('Los clientes no pueden agregar puntos manualmente');
    }

    // Buscar o crear registro de puntos
    let puntos = await this.puntosRepository.findOne({
      where: { userId }
    });

    if (!puntos) {
      // Verificar que el usuario existe
      const usuario = await this.userRepository.findOne({
        where: { id: userId }
      });

      if (!usuario) {
        throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
      }

      // Crear nuevo registro de puntos
      puntos = this.puntosRepository.create({
        userId,
        puntosAcumulados: 0
      });
    }

    // Agregar puntos
    puntos.puntosAcumulados += agregarDto.puntos;
    puntos.ultimaActualizacion = new Date();

    return await this.puntosRepository.save(puntos);
  }

  /**
   * Canjear puntos de un usuario
   * @param userId - ID del usuario
   * @param canjearDto - Datos del canje
   * @param currentUser - Usuario actual
   * @returns Promise<Puntos>
   * @throws BadRequestException si no tiene suficientes puntos
   */
  async canjearPuntos(userId: number, canjearDto: CanjearPuntosDto, currentUser: any): Promise<Puntos> {
    // Verificar autorización: admin puede canjear para cualquier usuario, cliente solo para sí mismo
    if (currentUser.rol !== 'admin' && userId !== currentUser.id) {
      throw new ForbiddenException('No tienes permisos para canjear puntos de este usuario');
    }

    // Buscar registro de puntos
    const puntos = await this.puntosRepository.findOne({
      where: { userId }
    });

    if (!puntos) {
      throw new NotFoundException(`El usuario con ID ${userId} no tiene registro de puntos`);
    }

    // Verificar que tiene suficientes puntos
    if (puntos.puntosAcumulados < canjearDto.puntos) {
      throw new BadRequestException(
        `Puntos insuficientes. Disponibles: ${puntos.puntosAcumulados}, Solicitados: ${canjearDto.puntos}`
      );
    }

    // Canjear puntos
    puntos.puntosAcumulados -= canjearDto.puntos;
    puntos.ultimaActualizacion = new Date();

    return await this.puntosRepository.save(puntos);
  }

  /**
   * Eliminar registro de puntos
   * @param id - ID del registro de puntos
   * @param currentUser - Usuario actual (debe ser admin)
   * @throws NotFoundException si el registro no existe
   * @throws ForbiddenException si no es admin
   */
  async remove(id: number, currentUser: any): Promise<void> {
    // Solo los administradores pueden eliminar registros de puntos
    if (currentUser.rol !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden eliminar registros de puntos');
    }

    // Verificar que el registro existe
    const puntos = await this.puntosRepository.findOne({
      where: { id }
    });

    if (!puntos) {
      throw new NotFoundException(`Registro de puntos con ID ${id} no encontrado`);
    }

    // Eliminar el registro
    await this.puntosRepository.remove(puntos);
  }

  /**
   * Obtener ranking de usuarios con más puntos
   * @param currentUser - Usuario actual (debe ser admin)
   * @param limit - Límite de resultados (por defecto 10)
   * @returns Promise<Puntos[]>
   * @throws ForbiddenException si no es admin
   */
  async getRanking(currentUser: any, limit: number = 10): Promise<Puntos[]> {
    if (currentUser.rol !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden ver el ranking de puntos');
    }

    return await this.puntosRepository
      .createQueryBuilder('puntos')
      .leftJoinAndSelect('puntos.user', 'user')
      .select([
        'puntos.id',
        'puntos.userId',
        'puntos.puntosAcumulados',
        'puntos.ultimaActualizacion',
        'user.id',
        'user.nombre',
        'user.email'
      ])
      .orderBy('puntos.puntosAcumulados', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * Obtener estadísticas del sistema de puntos (solo para admin)
   * @param currentUser - Usuario actual (debe ser admin)
   * @returns Promise<object>
   * @throws ForbiddenException si no es admin
   */
  async getEstadisticas(currentUser: any): Promise<object> {
    if (currentUser.rol !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden ver las estadísticas');
    }

    const totalUsuariosConPuntos = await this.puntosRepository.count();
    
    const estadisticas = await this.puntosRepository
      .createQueryBuilder('puntos')
      .select([
        'SUM(puntos.puntosAcumulados) as totalPuntos',
        'AVG(puntos.puntosAcumulados) as promedioPuntos',
        'MAX(puntos.puntosAcumulados) as maximoPuntos',
        'MIN(puntos.puntosAcumulados) as minimoPuntos'
      ])
      .getRawOne();

    // Usuarios con más de 1000 puntos
    const usuariosPremium = await this.puntosRepository
      .createQueryBuilder('puntos')
      .where('puntos.puntosAcumulados >= :minPuntos', { minPuntos: 1000 })
      .getCount();

    // Usuarios activos (con puntos > 0)
    const usuariosActivos = await this.puntosRepository
      .createQueryBuilder('puntos')
      .where('puntos.puntosAcumulados > 0')
      .getCount();

    return {
      totalUsuariosConPuntos,
      usuariosActivos,
      usuariosPremium,
      totalPuntosEnCirculacion: parseInt(estadisticas.totalPuntos) || 0,
      promedioPuntosPorUsuario: parseFloat(estadisticas.promedioPuntos) || 0,
      maximoPuntos: parseInt(estadisticas.maximoPuntos) || 0,
      minimoPuntos: parseInt(estadisticas.minimoPuntos) || 0,
    };
  }

  /**
   * Calcular puntos por compra (método helper)
   * @param montoCompra - Monto total de la compra
   * @returns number - Puntos calculados
   */
  calculatePuntosPorCompra(montoCompra: number): number {
    // Regla: 1 punto por cada $1 gastado, máximo 500 puntos por compra
    const puntos = Math.floor(montoCompra);
    return Math.min(puntos, 500);
  }

  /**
   * Procesar puntos por compra automáticamente
   * @param userId - ID del usuario
   * @param montoCompra - Monto de la compra
   * @returns Promise<Puntos>
   */
  async procesarPuntosPorCompra(userId: number, montoCompra: number): Promise<Puntos> {
    const puntosGanados = this.calculatePuntosPorCompra(montoCompra);
    
    if (puntosGanados <= 0) {
      throw new BadRequestException('El monto de compra no genera puntos');
    }

    const agregarDto: AgregarPuntosDto = {
      puntos: puntosGanados,
      descripcion: `Puntos por compra de $${montoCompra.toFixed(2)}`
    };

    // Usar un usuario admin ficticio para el procesamiento automático
    const adminUser = { id: 0, rol: 'admin' };
    return await this.agregarPuntos(userId, agregarDto, adminUser);
  }
}