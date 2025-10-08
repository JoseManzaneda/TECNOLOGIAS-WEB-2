import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

/**
 * Controlador de autenticación
 * 
 * Endpoints disponibles:
 * - POST /api/auth/register - Registrar nuevo usuario
 * - POST /api/auth/login - Iniciar sesión y obtener token JWT
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Registrar nuevo usuario
   * 
   * @example
   * POST /api/auth/register
   * {
   *   "nombre": "Juan Pérez",
   *   "email": "juan@example.com",
   *   "password": "Password123",
   *   "telefono": "987654321",
   *   "rol": "cliente"
   * }
   * 
   * Response:
   * {
   *   "status": "success",
   *   "code": 201,
   *   "data": {
   *     "id": 1,
   *     "nombre": "Juan Pérez",
   *     "email": "juan@example.com",
   *     "telefono": "987654321",
   *     "rol": "cliente",
   *     "fechaRegistro": "2025-01-07T..."
   *   }
   * }
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    // Forzar rol cliente para registro público
    const userDto: CreateUserDto = {
      ...dto,
      rol: 'cliente'
    };
    return this.usersService.create(userDto);
  }

  /**
   * Iniciar sesión
   * 
   * @example
   * POST /api/auth/login
   * {
   *   "email": "juan@example.com",
   *   "password": "Password123"
   * }
   * 
   * Response:
   * {
   *   "status": "success",
   *   "code": 200,
   *   "data": {
   *     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *     "user": {
   *       "id": 1,
   *       "nombre": "Juan Pérez",
   *       "email": "juan@example.com",
   *       "rol": "cliente"
   *     }
   *   }
   * }
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
}