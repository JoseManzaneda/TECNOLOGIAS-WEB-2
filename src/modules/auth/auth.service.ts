import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsuarioRegistradoEvent } from '../../shared/events';
import { EventLogger } from '../../shared/utils';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService, private eventEmitter: EventEmitter2) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const valid = await bcrypt.compare(pass, user.passwordHash);
    if (!valid) return null;
    const { passwordHash, ...rest } = user;
    return rest;
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');
    const payload = { sub: user.id, rol: user.rol, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
    };
  }

  // Suponiendo que existe un método register en UsersService que crea el usuario
  async register(nombre: string, email: string, password: string) {
    const user = await this.usersService.create({ nombre, email, password, rol: 'cliente' });

    const event = new UsuarioRegistradoEvent(user.id, user.nombre, user.email);
    this.eventEmitter.emit('usuario.registrado', event);
    EventLogger.logEmit('usuario.registrado', event);

    const payload = { sub: user.id, rol: user.rol, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
    };
  }
}