import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { EventService } from '../../events/event.service';
import { UserRegisteredEvent } from '@shared/events/user.events';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly eventService: EventService,
  ) {}

  private sanitize(user: User) {
    const { passwordHash, ...rest } = user;
    return rest;
  }

  async create(dto: CreateUserDto) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email ya registrado');
    const passwordHash = await bcrypt.hash(dto.contrasena, 10);
    const user = this.userRepo.create({
      nombre: dto.nombre,
      email: dto.email,
      telefono: dto.telefono,
      passwordHash,
      rol: dto.rol ?? 'cliente',
    });
    const saved = await this.userRepo.save(user);

    // Emitir evento
    this.eventService.emitUserRegistered(
      new UserRegisteredEvent(saved.id, saved.email, saved.nombre)
    );

    return this.sanitize(saved);
  }

  async findAll() {
    const users = await this.userRepo.find();
    return users.map((u) => this.sanitize(u));
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  async findOne(id: number, currentUser?: any) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    
    // Verificar autorización: admin puede ver cualquier usuario, cliente solo su propio perfil
    if (currentUser && currentUser.rol !== 'admin' && currentUser.id !== id) {
      throw new ForbiddenException('No tienes permisos para acceder a este usuario');
    }
    
    return this.sanitize(user);
  }

  async update(id: number, dto: UpdateUserDto, currentUser?: any) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Verificar autorización: admin puede actualizar cualquier usuario, cliente solo su propio perfil
    if (currentUser && currentUser.rol !== 'admin' && currentUser.id !== id) {
      throw new ForbiddenException('No tienes permisos para actualizar este usuario');
    }

    // Los clientes no pueden cambiar su propio rol
    if (currentUser && currentUser.rol !== 'admin' && dto.rol !== undefined) {
      throw new ForbiddenException('No puedes cambiar tu propio rol');
    }

    if (dto.email && dto.email !== user.email) {
      const exists = await this.userRepo.findOne({ where: { email: dto.email } });
      if (exists) throw new ConflictException('Email ya registrado');
      user.email = dto.email;
    }
    if (dto.nombre !== undefined) user.nombre = dto.nombre;
    if (dto.telefono !== undefined) user.telefono = dto.telefono;
    if (dto.rol !== undefined) user.rol = dto.rol;
    if (dto.contrasena) user.passwordHash = await bcrypt.hash(dto.contrasena, 10);

    const saved = await this.userRepo.save(user);
    return this.sanitize(saved);
  }

  async replace(id: number, dto: CreateUserDto, currentUser?: any) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Verificar autorización: admin puede reemplazar cualquier usuario, cliente solo su propio perfil
    if (currentUser && currentUser.rol !== 'admin' && currentUser.id !== id) {
      throw new ForbiddenException('No tienes permisos para reemplazar este usuario');
    }

    // Los clientes no pueden cambiar su propio rol
    if (currentUser && currentUser.rol !== 'admin' && dto.rol !== undefined && dto.rol !== user.rol) {
      throw new ForbiddenException('No puedes cambiar tu propio rol');
    }

    if (dto.email && dto.email !== user.email) {
      const exists = await this.userRepo.findOne({ where: { email: dto.email } });
      if (exists) throw new ConflictException('Email ya registrado');
      user.email = dto.email;
    }
    user.nombre = dto.nombre;
    user.telefono = dto.telefono;
    user.rol = dto.rol ?? user.rol;
    user.passwordHash = await bcrypt.hash(dto.contrasena, 10);
    const saved = await this.userRepo.save(user);
    return this.sanitize(saved);
  }

  async remove(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    await this.userRepo.remove(user);
  }
}