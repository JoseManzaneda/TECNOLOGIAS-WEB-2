import { Body, Controller, Get, Param, Post, Put, Delete, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Info del usuario autenticado
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Request() req: any) {
    return this.usersService.findById(req.user.id);
  }

  // Listado (podría requerir rol admin en producción)
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(Number(id));
  }

  // Crear usuario manualmente (opcional - admin)
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  // Actualizar perfil
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(Number(id), dto);
  }

  // Direcciones
  @Get(':id/addresses')
  @UseGuards(JwtAuthGuard)
  async listAddresses(@Param('id') id: string) {
    return this.usersService.listAddresses(Number(id));
  }

  @Post(':id/addresses')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async addAddress(@Param('id') id: string, @Body() dto: CreateAddressDto) {
    return this.usersService.addAddress(Number(id), dto);
  }

  @Put(':id/addresses/:addressId')
  @UseGuards(JwtAuthGuard)
  async updateAddress(
    @Param('id') id: string,
    @Param('addressId') addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.usersService.updateAddress(Number(id), Number(addressId), dto);
  }

  @Delete(':id/addresses/:addressId')
  @UseGuards(JwtAuthGuard)
  async removeAddress(
    @Param('id') id: string,
    @Param('addressId') addressId: string,
  ) {
    return this.usersService.removeAddress(Number(id), Number(addressId));
  }
}
