import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Direccion } from './entities/direccion.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Direccion) private readonly dirRepo: Repository<Direccion>,
  ) {}

  // CRUD de Usuarios
  async findAll() {
    return this.userRepo.find();
  }

  async findById(id: number) {
    const user = await this.userRepo.findOne({ where: { id }, relations: ['direcciones'] });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async create(dto: CreateUserDto & { id?: number }) {
    const user = this.userRepo.create({
      id: dto.id,
      nombre: dto.nombre,
      email: dto.email,
      telefono: dto.telefono,
      rol: dto.rol || 'cliente',
    });
    return this.userRepo.save(user);
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findById(id);
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  // Direcciones
  async listAddresses(userId: number) {
    const user = await this.findById(userId);
    return user.direcciones || [];
  }

  async addAddress(userId: number, dto: CreateAddressDto) {
    const user = await this.findById(userId);
    const address = this.dirRepo.create({ ...dto, usuario: user });
    return this.dirRepo.save(address);
  }

  async updateAddress(userId: number, addressId: number, dto: UpdateAddressDto) {
    const address = await this.dirRepo.findOne({ where: { id: addressId }, relations: ['usuario'] });
    if (!address || address.usuario.id !== userId) {
      throw new NotFoundException('Dirección no encontrada para el usuario');
    }
    Object.assign(address, dto);
    return this.dirRepo.save(address);
  }

  async removeAddress(userId: number, addressId: number) {
    const address = await this.dirRepo.findOne({ where: { id: addressId }, relations: ['usuario'] });
    if (!address || address.usuario.id !== userId) {
      throw new NotFoundException('Dirección no encontrada para el usuario');
    }
    await this.dirRepo.remove(address);
    return { deleted: true };
  }

  // Sincronización desde Auth (evento user.registered)
  async syncFromAuth(payload: {
    id: number;
    nombre: string;
    email: string;
    telefono?: string | null;
    rol: 'cliente' | 'admin';
    fechaRegistro?: string | Date;
  }) {
    const existing = await this.userRepo.findOne({ where: { id: payload.id } });
    if (!existing) {
      const created = this.userRepo.create({
        id: payload.id,
        nombre: payload.nombre,
        email: payload.email,
        telefono: payload.telefono || null,
        rol: payload.rol,
        fechaRegistro: payload.fechaRegistro ? new Date(payload.fechaRegistro) : new Date(),
      });
      return this.userRepo.save(created);
    } else {
      existing.nombre = payload.nombre;
      existing.email = payload.email;
      existing.telefono = payload.telefono || null;
      existing.rol = payload.rol;
      return this.userRepo.save(existing);
    }
  }
}
