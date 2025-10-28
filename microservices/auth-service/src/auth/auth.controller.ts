import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * Controlador de Autenticación
 * Endpoints: /auth/*
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Registrar nuevo usuario
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * POST /auth/login
   * Iniciar sesión y obtener token JWT
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * GET /auth/profile
   * Obtener perfil del usuario autenticado
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getProfile(@Request() req: any) {
    const user = await this.authService.findById(req.user.id);
    if (!user) {
      return { message: 'Usuario no encontrado' };
    }
    
    const { contraseña, ...result } = user;
    return result;
  }

  /**
   * GET /auth/validate
   * Validar token JWT (usado por otros servicios)
   */
  @Get('validate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async validate(@Request() req: any) {
    return {
      valid: true,
      user: req.user,
    };
  }

  /**
   * GET /auth/health
   * Health check endpoint
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  health() {
    return {
      status: 'ok',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
    };
  }
}
