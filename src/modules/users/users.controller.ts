import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Put, HttpCode, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * Controlador de usuarios
 * 
 * Endpoints disponibles:
 * - POST /api/users - Crear usuario (solo admin)
 * - GET /api/users - Listar usuarios (solo admin)
 * - GET /api/users/profile - Obtener perfil del usuario autenticado
 * - GET /api/users/:id - Obtener usuario por ID (admin o el mismo usuario)
 * - PATCH /api/users/:id - Actualizar usuario (admin o el mismo usuario)
 * - PUT /api/users/:id - Reemplazar usuario (admin o el mismo usuario)
 * - DELETE /api/users/:id - Eliminar usuario (solo admin)
 */
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Crear nuevo usuario (solo administradores)
   * 
   * @example
   * POST /api/users
   * Authorization: Bearer <JWT_TOKEN>
   * {
   *   "nombre": "Juan Pérez",
   *   "email": "juan@example.com",
   *   "password": "Password123",
   *   "telefono": "987654321",
   *   "rol": "cliente"
   * }
   */
  @Post()
  @HttpCode(201)
  @Roles('admin')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  /**
   * Listar todos los usuarios (solo administradores)
   * 
   * @example
   * GET /api/users
   * Authorization: Bearer <JWT_TOKEN>
   */
  @Get()
  @Roles('admin')
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * Obtener perfil del usuario autenticado
   * 
   * @example
   * GET /api/users/profile
   * Authorization: Bearer <JWT_TOKEN>
   */
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.usersService.findOne(req.user.id);
  }

  /**
   * Obtener usuario por ID (admin o el mismo usuario)
   * 
   * @example
   * GET /api/users/1
   * Authorization: Bearer <JWT_TOKEN>
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.usersService.findOne(id, req.user);
  }

  /**
   * Actualizar usuario parcialmente (admin o el mismo usuario)
   * 
   * @example
   * PATCH /api/users/1
   * Authorization: Bearer <JWT_TOKEN>
   * {
   *   "nombre": "Juan Carlos Pérez"
   * }
   */
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto, @Request() req: any) {
    return this.usersService.update(id, dto, req.user);
  }

  /**
   * Reemplazar usuario completo (admin o el mismo usuario)
   * 
   * @example
   * PUT /api/users/1
   * Authorization: Bearer <JWT_TOKEN>
   * {
   *   "nombre": "Juan Carlos Pérez",
   *   "email": "juan.carlos@example.com",
   *   "password": "NewPassword123",
   *   "telefono": "123456789"
   * }
   */
  @Put(':id')
  replace(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateUserDto, @Request() req: any) {
    return this.usersService.replace(id, dto, req.user);
  }

  /**
   * Eliminar usuario (solo administradores)
   * 
   * @example
   * DELETE /api/users/1
   * Authorization: Bearer <JWT_TOKEN>
   */
  @Delete(':id')
  @HttpCode(200)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}