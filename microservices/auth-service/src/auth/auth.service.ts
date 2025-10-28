import { 
  Injectable, 
  UnauthorizedException, 
  ConflictException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @Inject('RABBITMQ_SERVICE')
    private readonly rabbitClient: ClientProxy,
  ) {}

  /**
   * Registrar nuevo usuario
   */
  async register(registerDto: RegisterDto) {
    const { email, password, nombre, telefono, rol } = registerDto;

    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findOne({ 
      where: { email } 
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario en auth_db
    const user = this.userRepository.create({
      nombre,
      email,
      contraseña: hashedPassword,
      rol: rol || 'cliente',
    });

    const savedUser = await this.userRepository.save(user);

    // Emitir evento a RabbitMQ para sincronizar con Users Service
    this.rabbitClient.emit('user.registered', {
      id: savedUser.id,
      nombre: savedUser.nombre,
      email: savedUser.email,
      telefono: telefono || null,
      rol: savedUser.rol,
      fechaRegistro: savedUser.fechaRegistro,
    });

    // Retornar datos sin contraseña
    const { contraseña, ...result } = savedUser;
    return {
      message: 'Usuario registrado exitosamente',
      user: result,
    };
  }

  /**
   * Iniciar sesión
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Buscar usuario
    const user = await this.userRepository.findOne({ 
      where: { email } 
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.contraseña);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token JWT
    const payload = { 
      sub: user.id, 
      email: user.email, 
      rol: user.rol 
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    };
  }

  /**
   * Validar usuario (usado por JWT Strategy)
   */
  async validateUser(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Buscar usuario por ID
   */
  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * Validar token JWT
   */
  async validateToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.findById(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      return {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          rol: user.rol,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
