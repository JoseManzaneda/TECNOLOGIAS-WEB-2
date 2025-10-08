import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Direccion } from './entities/direccion.entity';
import { CreateDireccionDto } from './dto/create-direccion.dto';
import { UpdateDireccionDto } from './dto/update-direccion.dto';

@Injectable()
export class DireccionesService {
  constructor(
    @InjectRepository(Direccion)
    private readonly direccionRepo: Repository<Direccion>
  ) {}

  async create(dto: CreateDireccionDto, userId: number) {
    const direccion = this.direccionRepo.create({
      direccion: dto.direccion,
      ciudad: dto.ciudad,
      referencia: dto.referencia,
      userId,
    });
    return this.direccionRepo.save(direccion);
  }

  async findAll(currentUser: any) {
    // Solo admin puede ver todas las direcciones
    if (currentUser.rol === 'admin') {
      return this.direccionRepo.find({
        relations: ['usuario'],
        select: {
          usuario: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      });
    }

    // Cliente solo puede ver sus propias direcciones
    return this.direccionRepo.find({
      where: { userId: currentUser.id },
    });
  }

  async findOne(id: number, currentUser: any) {
    const direccion = await this.direccionRepo.findOne({
      where: { id },
      relations: ['usuario'],
      select: {
        usuario: {
          id: true,
          nombre: true,
          email: true,
        },
      },
    });

    if (!direccion) {
      throw new NotFoundException('Dirección no encontrada');
    }

    // Verificar autorización: admin puede ver cualquier dirección, cliente solo la suya
    if (currentUser.rol !== 'admin' && direccion.userId !== currentUser.id) {
      throw new ForbiddenException('No tienes permisos para acceder a esta dirección');
    }

    return direccion;
  }

  async findByUser(userId: number, currentUser: any) {
    // Verificar autorización: admin puede ver direcciones de cualquier usuario
    if (currentUser.rol !== 'admin' && userId !== currentUser.id) {
      throw new ForbiddenException('No tienes permisos para acceder a estas direcciones');
    }

    return this.direccionRepo.find({
      where: { userId },
      relations: ['usuario'],
      select: {
        usuario: {
          id: true,
          nombre: true,
          email: true,
        },
      },
    });
  }

  async update(id: number, dto: UpdateDireccionDto, currentUser: any) {
    const direccion = await this.direccionRepo.findOne({ where: { id } });

    if (!direccion) {
      throw new NotFoundException('Dirección no encontrada');
    }

    // Verificar autorización: admin puede actualizar cualquier dirección, cliente solo la suya
    if (currentUser.rol !== 'admin' && direccion.userId !== currentUser.id) {
      throw new ForbiddenException('No tienes permisos para actualizar esta dirección');
    }

    if (dto.direccion !== undefined) direccion.direccion = dto.direccion;
    if (dto.ciudad !== undefined) direccion.ciudad = dto.ciudad;
    if (dto.referencia !== undefined) direccion.referencia = dto.referencia;

    return this.direccionRepo.save(direccion);
  }

  async remove(id: number, currentUser: any) {
    const direccion = await this.direccionRepo.findOne({ where: { id } });

    if (!direccion) {
      throw new NotFoundException('Dirección no encontrada');
    }

    // Verificar autorización: admin puede eliminar cualquier dirección, cliente solo la suya
    if (currentUser.rol !== 'admin' && direccion.userId !== currentUser.id) {
      throw new ForbiddenException('No tienes permisos para eliminar esta dirección');
    }

    await this.direccionRepo.remove(direccion);
  }
}