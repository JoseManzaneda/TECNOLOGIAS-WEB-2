import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateIngredienteDto } from './dto/create-ingrediente.dto';
import { UpdateIngredienteDto } from './dto/update-ingrediente.dto';
import { Ingrediente } from './entities/ingrediente.entity';

@Injectable()
export class IngredientesService {
  constructor(
    @InjectRepository(Ingrediente)
    private readonly ingredienteRepository: Repository<Ingrediente>,
  ) {}

  /**
   * Crear un nuevo ingrediente
   * @param createIngredienteDto - Datos del ingrediente a crear
   * @param currentUser - Usuario actual (debe ser admin)
   * @returns Promise<Ingrediente>
   * @throws ConflictException si el ingrediente ya existe
   * @throws ForbiddenException si no es admin
   */
  async create(createIngredienteDto: CreateIngredienteDto, currentUser: any): Promise<Ingrediente> {
    // Solo los administradores pueden crear ingredientes
    if (currentUser.rol !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden crear ingredientes');
    }

    // Verificar si ya existe un ingrediente con el mismo nombre
    const existeIngrediente = await this.ingredienteRepository.findOne({
      where: { nombre: createIngredienteDto.nombre }
    });

    if (existeIngrediente) {
      throw new ConflictException(`Ya existe un ingrediente con el nombre "${createIngredienteDto.nombre}"`);
    }

    // Crear y guardar el nuevo ingrediente
    const nuevoIngrediente = this.ingredienteRepository.create(createIngredienteDto);
    return await this.ingredienteRepository.save(nuevoIngrediente);
  }

  /**
   * Obtener todos los ingredientes
   * @param currentUser - Usuario actual
   * @returns Promise<Ingrediente[]>
   */
  async findAll(currentUser: any): Promise<Ingrediente[]> {
    // Tanto admins como clientes pueden ver los ingredientes
    return await this.ingredienteRepository.find({
      order: { nombre: 'ASC' }
    });
  }

  /**
   * Obtener un ingrediente por ID
   * @param id - ID del ingrediente
   * @param currentUser - Usuario actual
   * @returns Promise<Ingrediente>
   * @throws NotFoundException si el ingrediente no existe
   */
  async findOne(id: number, currentUser: any): Promise<Ingrediente> {
    const ingrediente = await this.ingredienteRepository.findOne({
      where: { id }
    });

    if (!ingrediente) {
      throw new NotFoundException(`Ingrediente con ID ${id} no encontrado`);
    }

    return ingrediente;
  }

  /**
   * Buscar ingredientes por nombre
   * @param nombre - Nombre a buscar (búsqueda parcial)
   * @param currentUser - Usuario actual
   * @returns Promise<Ingrediente[]>
   */
  async findByNombre(nombre: string, currentUser: any): Promise<Ingrediente[]> {
    return await this.ingredienteRepository
      .createQueryBuilder('ingrediente')
      .where('ingrediente.nombre LIKE :nombre', { nombre: `%${nombre}%` })
      .orderBy('ingrediente.nombre', 'ASC')
      .getMany();
  }

  /**
   * Actualizar un ingrediente
   * @param id - ID del ingrediente a actualizar
   * @param updateIngredienteDto - Datos a actualizar
   * @param currentUser - Usuario actual (debe ser admin)
   * @returns Promise<Ingrediente>
   * @throws NotFoundException si el ingrediente no existe
   * @throws ForbiddenException si no es admin
   * @throws ConflictException si el nuevo nombre ya existe
   */
  async update(id: number, updateIngredienteDto: UpdateIngredienteDto, currentUser: any): Promise<Ingrediente> {
    // Solo los administradores pueden actualizar ingredientes
    if (currentUser.rol !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden actualizar ingredientes');
    }

    // Verificar que el ingrediente existe
    const ingrediente = await this.ingredienteRepository.findOne({
      where: { id }
    });

    if (!ingrediente) {
      throw new NotFoundException(`Ingrediente con ID ${id} no encontrado`);
    }

    // Si se está actualizando el nombre, verificar que no exista otro ingrediente con ese nombre
    if (updateIngredienteDto.nombre && updateIngredienteDto.nombre !== ingrediente.nombre) {
      const existeIngrediente = await this.ingredienteRepository.findOne({
        where: { nombre: updateIngredienteDto.nombre }
      });

      if (existeIngrediente) {
        throw new ConflictException(`Ya existe un ingrediente con el nombre "${updateIngredienteDto.nombre}"`);
      }
    }

    // Actualizar y guardar los cambios
    Object.assign(ingrediente, updateIngredienteDto);
    return await this.ingredienteRepository.save(ingrediente);
  }

  /**
   * Eliminar un ingrediente
   * @param id - ID del ingrediente a eliminar
   * @param currentUser - Usuario actual (debe ser admin)
   * @throws NotFoundException si el ingrediente no existe
   * @throws ForbiddenException si no es admin
   */
  async remove(id: number, currentUser: any): Promise<void> {
    // Solo los administradores pueden eliminar ingredientes
    if (currentUser.rol !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden eliminar ingredientes');
    }

    // Verificar que el ingrediente existe
    const ingrediente = await this.ingredienteRepository.findOne({
      where: { id }
    });

    if (!ingrediente) {
      throw new NotFoundException(`Ingrediente con ID ${id} no encontrado`);
    }

    // TODO: En una implementación real, verificar si el ingrediente está siendo usado en productos
    // antes de eliminarlo para evitar violaciones de integridad referencial

    // Eliminar el ingrediente
    await this.ingredienteRepository.remove(ingrediente);
  }

  /**
   * Obtener estadísticas de ingredientes (solo para admin)
   * @param currentUser - Usuario actual (debe ser admin)
   * @returns Promise<object>
   * @throws ForbiddenException si no es admin
   */
  async getEstadisticas(currentUser: any): Promise<object> {
    if (currentUser.rol !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden ver las estadísticas');
    }

    const totalIngredientes = await this.ingredienteRepository.count();
    
    const ingredientesPorUnidad = await this.ingredienteRepository
      .createQueryBuilder('ingrediente')
      .select('ingrediente.unidad', 'unidad')
      .addSelect('COUNT(ingrediente.id)', 'cantidad')
      .where('ingrediente.unidad IS NOT NULL')
      .groupBy('ingrediente.unidad')
      .getRawMany();

    const ingredientesSinUnidad = await this.ingredienteRepository
      .createQueryBuilder('ingrediente')
      .where('ingrediente.unidad IS NULL')
      .getCount();

    return {
      totalIngredientes,
      ingredientesSinUnidad,
      ingredientesPorUnidad: ingredientesPorUnidad.map(item => ({
        unidad: item.unidad,
        cantidad: parseInt(item.cantidad, 10)
      }))
    };
  }
}