import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductoIngrediente } from './entities/producto-ingrediente.entity';
import { Product } from '../products/entities/product.entity';
import { Ingrediente } from '../ingredientes/entities/ingrediente.entity';
import { CreateProductoIngredienteDto } from './dto/create-producto-ingrediente.dto';
import { UpdateProductoIngredienteDto } from './dto/update-producto-ingrediente.dto';

@Injectable()
export class ProductoIngredientesService {
  constructor(
    @InjectRepository(ProductoIngrediente)
    private readonly productoIngredienteRepository: Repository<ProductoIngrediente>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Ingrediente)
    private readonly ingredienteRepository: Repository<Ingrediente>,
  ) {}

  /**
   * Crear una nueva relación producto-ingrediente
   * @param createDto - Datos de la relación a crear
   * @param currentUser - Usuario actual (debe ser admin)
   * @returns Promise<ProductoIngrediente>
   * @throws ForbiddenException si no es admin
   * @throws NotFoundException si el producto o ingrediente no existen
   * @throws ConflictException si la relación ya existe
   */
  async create(createDto: CreateProductoIngredienteDto, currentUser: any): Promise<ProductoIngrediente> {
    // Solo los administradores pueden crear relaciones
    if (currentUser.rol !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden crear relaciones producto-ingrediente');
    }

    // Verificar que el producto existe
    const producto = await this.productRepository.findOne({
      where: { id: createDto.productoId }
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${createDto.productoId} no encontrado`);
    }

    // Verificar que el ingrediente existe
    const ingrediente = await this.ingredienteRepository.findOne({
      where: { id: createDto.ingredienteId }
    });

    if (!ingrediente) {
      throw new NotFoundException(`Ingrediente con ID ${createDto.ingredienteId} no encontrado`);
    }

    // Verificar si la relación ya existe
    const relacionExistente = await this.productoIngredienteRepository.findOne({
      where: {
        productoId: createDto.productoId,
        ingredienteId: createDto.ingredienteId
      }
    });

    if (relacionExistente) {
      throw new ConflictException(
        `Ya existe una relación entre el producto "${producto.nombre}" y el ingrediente "${ingrediente.nombre}"`
      );
    }

    // Crear y guardar la nueva relación
    const nuevaRelacion = this.productoIngredienteRepository.create(createDto);
    return await this.productoIngredienteRepository.save(nuevaRelacion);
  }

  /**
   * Obtener todas las relaciones producto-ingrediente
   * @param currentUser - Usuario actual
   * @returns Promise<ProductoIngrediente[]>
   */
  async findAll(currentUser: any): Promise<ProductoIngrediente[]> {
    return await this.productoIngredienteRepository
      .createQueryBuilder('pi')
      .leftJoinAndSelect('pi.producto', 'producto')
      .leftJoinAndSelect('pi.ingrediente', 'ingrediente')
      .orderBy('producto.nombre', 'ASC')
      .addOrderBy('ingrediente.nombre', 'ASC')
      .getMany();
  }

  /**
   * Obtener ingredientes de un producto específico
   * @param productoId - ID del producto
   * @param currentUser - Usuario actual
   * @returns Promise<ProductoIngrediente[]>
   * @throws NotFoundException si el producto no existe
   */
  async findByProducto(productoId: number, currentUser: any): Promise<ProductoIngrediente[]> {
    // Verificar que el producto existe
    const producto = await this.productRepository.findOne({
      where: { id: productoId }
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${productoId} no encontrado`);
    }

    return await this.productoIngredienteRepository
      .createQueryBuilder('pi')
      .leftJoinAndSelect('pi.ingrediente', 'ingrediente')
      .where('pi.productoId = :productoId', { productoId })
      .orderBy('ingrediente.nombre', 'ASC')
      .getMany();
  }

  /**
   * Obtener productos que usan un ingrediente específico
   * @param ingredienteId - ID del ingrediente
   * @param currentUser - Usuario actual
   * @returns Promise<ProductoIngrediente[]>
   * @throws NotFoundException si el ingrediente no existe
   */
  async findByIngrediente(ingredienteId: number, currentUser: any): Promise<ProductoIngrediente[]> {
    // Verificar que el ingrediente existe
    const ingrediente = await this.ingredienteRepository.findOne({
      where: { id: ingredienteId }
    });

    if (!ingrediente) {
      throw new NotFoundException(`Ingrediente con ID ${ingredienteId} no encontrado`);
    }

    return await this.productoIngredienteRepository
      .createQueryBuilder('pi')
      .leftJoinAndSelect('pi.producto', 'producto')
      .where('pi.ingredienteId = :ingredienteId', { ingredienteId })
      .orderBy('producto.nombre', 'ASC')
      .getMany();
  }

  /**
   * Obtener una relación específica
   * @param productoId - ID del producto
   * @param ingredienteId - ID del ingrediente
   * @param currentUser - Usuario actual
   * @returns Promise<ProductoIngrediente>
   * @throws NotFoundException si la relación no existe
   */
  async findOne(productoId: number, ingredienteId: number, currentUser: any): Promise<ProductoIngrediente> {
    const relacion = await this.productoIngredienteRepository
      .createQueryBuilder('pi')
      .leftJoinAndSelect('pi.producto', 'producto')
      .leftJoinAndSelect('pi.ingrediente', 'ingrediente')
      .where('pi.productoId = :productoId AND pi.ingredienteId = :ingredienteId', { 
        productoId, 
        ingredienteId 
      })
      .getOne();

    if (!relacion) {
      throw new NotFoundException(
        `No se encontró relación entre producto ID ${productoId} e ingrediente ID ${ingredienteId}`
      );
    }

    return relacion;
  }

  /**
   * Actualizar una relación producto-ingrediente
   * @param productoId - ID del producto
   * @param ingredienteId - ID del ingrediente
   * @param updateDto - Datos a actualizar
   * @param currentUser - Usuario actual (debe ser admin)
   * @returns Promise<ProductoIngrediente>
   * @throws ForbiddenException si no es admin
   * @throws NotFoundException si la relación no existe
   */
  async update(
    productoId: number, 
    ingredienteId: number, 
    updateDto: UpdateProductoIngredienteDto, 
    currentUser: any
  ): Promise<ProductoIngrediente> {
    // Solo los administradores pueden actualizar relaciones
    if (currentUser.rol !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden actualizar relaciones producto-ingrediente');
    }

    // Verificar que la relación existe
    const relacion = await this.productoIngredienteRepository.findOne({
      where: {
        productoId,
        ingredienteId
      }
    });

    if (!relacion) {
      throw new NotFoundException(
        `No se encontró relación entre producto ID ${productoId} e ingrediente ID ${ingredienteId}`
      );
    }

    // Actualizar y guardar los cambios
    Object.assign(relacion, updateDto);
    return await this.productoIngredienteRepository.save(relacion);
  }

  /**
   * Eliminar una relación producto-ingrediente
   * @param productoId - ID del producto
   * @param ingredienteId - ID del ingrediente
   * @param currentUser - Usuario actual (debe ser admin)
   * @throws ForbiddenException si no es admin
   * @throws NotFoundException si la relación no existe
   */
  async remove(productoId: number, ingredienteId: number, currentUser: any): Promise<void> {
    // Solo los administradores pueden eliminar relaciones
    if (currentUser.rol !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden eliminar relaciones producto-ingrediente');
    }

    // Verificar que la relación existe
    const relacion = await this.productoIngredienteRepository.findOne({
      where: {
        productoId,
        ingredienteId
      }
    });

    if (!relacion) {
      throw new NotFoundException(
        `No se encontró relación entre producto ID ${productoId} e ingrediente ID ${ingredienteId}`
      );
    }

    // Eliminar la relación
    await this.productoIngredienteRepository.remove(relacion);
  }

  /**
   * Obtener estadísticas de relaciones producto-ingrediente (solo para admin)
   * @param currentUser - Usuario actual (debe ser admin)
   * @returns Promise<object>
   * @throws ForbiddenException si no es admin
   */
  async getEstadisticas(currentUser: any): Promise<object> {
    if (currentUser.rol !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden ver las estadísticas');
    }

    const totalRelaciones = await this.productoIngredienteRepository.count();

    // Productos con más ingredientes
    const productosConMasIngredientes = await this.productoIngredienteRepository
      .createQueryBuilder('pi')
      .select('producto.nombre', 'nombreProducto')
      .addSelect('COUNT(pi.ingredienteId)', 'cantidadIngredientes')
      .leftJoin('pi.producto', 'producto')
      .groupBy('pi.productoId, producto.nombre')
      .orderBy('COUNT(pi.ingredienteId)', 'DESC')
      .limit(5)
      .getRawMany();

    // Ingredientes más utilizados
    const ingredientesMasUtilizados = await this.productoIngredienteRepository
      .createQueryBuilder('pi')
      .select('ingrediente.nombre', 'nombreIngrediente')
      .addSelect('COUNT(pi.productoId)', 'cantidadProductos')
      .leftJoin('pi.ingrediente', 'ingrediente')
      .groupBy('pi.ingredienteId, ingrediente.nombre')
      .orderBy('COUNT(pi.productoId)', 'DESC')
      .limit(5)
      .getRawMany();

    // Relaciones con cantidad especificada
    const relacionesConCantidad = await this.productoIngredienteRepository
      .createQueryBuilder('pi')
      .where('pi.cantidad IS NOT NULL')
      .getCount();

    const relacionesSinCantidad = totalRelaciones - relacionesConCantidad;

    return {
      totalRelaciones,
      relacionesConCantidad,
      relacionesSinCantidad,
      productosConMasIngredientes: productosConMasIngredientes.map(item => ({
        nombreProducto: item.nombreProducto,
        cantidadIngredientes: parseInt(item.cantidadIngredientes, 10)
      })),
      ingredientesMasUtilizados: ingredientesMasUtilizados.map(item => ({
        nombreIngrediente: item.nombreIngrediente,
        cantidadProductos: parseInt(item.cantidadProductos, 10)
      }))
    };
  }

  /**
   * Crear múltiples relaciones para un producto (método helper)
   * @param productoId - ID del producto
   * @param ingredientesData - Array de ingredientes con sus cantidades
   * @param currentUser - Usuario actual (debe ser admin)
   * @returns Promise<ProductoIngrediente[]>
   */
  async createMultiple(
    productoId: number, 
    ingredientesData: Array<{ ingredienteId: number; cantidad?: number }>,
    currentUser: any
  ): Promise<ProductoIngrediente[]> {
    if (currentUser.rol !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden crear relaciones masivas');
    }

    // Verificar que el producto existe
    const producto = await this.productRepository.findOne({
      where: { id: productoId }
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${productoId} no encontrado`);
    }

    const relacionesCreadas: ProductoIngrediente[] = [];

    for (const data of ingredientesData) {
      try {
        const createDto: CreateProductoIngredienteDto = {
          productoId,
          ingredienteId: data.ingredienteId,
          cantidad: data.cantidad
        };

        const nuevaRelacion = await this.create(createDto, currentUser);
        relacionesCreadas.push(nuevaRelacion);
      } catch (error) {
        // Si es un ConflictException (relación ya existe), continuamos con el siguiente
        if (error instanceof ConflictException) {
          continue;
        }
        // Si es otro tipo de error, lo re-lanzamos
        throw error;
      }
    }

    return relacionesCreadas;
  }
}