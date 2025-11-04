import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

/**
 * Controlador interno para comunicación entre microservicios
 * No expuesto en Swagger - Solo para uso interno
 */
@Controller('internal/users')
export class UsersInternalController {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * Validar si un usuario existe
   * Endpoint interno para comunicación entre servicios
   */
  @Get(':id/validate')
  async validateUser(@Param('id', ParseIntPipe) id: number) {
    // Buscar directamente en el repositorio para evitar excepciones
    const user = await this.userRepo.findOne({ where: { id } });
    return {
      exists: !!user,
      id: id,
    };
  }
}
