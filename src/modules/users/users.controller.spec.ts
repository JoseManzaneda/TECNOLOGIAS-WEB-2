import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const usersServiceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      replace: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  describe('create', () => {
    it('debe crear un usuario exitosamente', async () => {
      const createUserDto: CreateUserDto = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'Password123',
        telefono: '987654321',
        rol: 'cliente',
      };

      const expectedResult = {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '987654321',
        rol: 'cliente' as UserRole,
        fechaRegistro: new Date(),
      };

      usersService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto);

      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar ConflictException si el email ya existe', async () => {
      const createUserDto: CreateUserDto = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'Password123',
      };

      usersService.create.mockRejectedValue(
        new ConflictException('Email ya registrado')
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('findAll', () => {
    it('debe retornar lista de usuarios', async () => {
      const expectedResult = [
        {
          id: 1,
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
          telefono: '987654321',
          rol: 'cliente' as UserRole,
          fechaRegistro: new Date(),
        },
        {
          id: 2,
          nombre: 'María García',
          email: 'maria@example.com',
          telefono: '123456789',
          rol: 'admin' as UserRole,
          fechaRegistro: new Date(),
        },
      ];

      usersService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getProfile', () => {
    it('debe retornar el perfil del usuario autenticado', async () => {
      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' }
      };

      const expectedResult = {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '987654321',
        rol: 'cliente' as UserRole,
        fechaRegistro: new Date(),
      };

      usersService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.getProfile(mockRequest);

      expect(usersService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('debe retornar un usuario por ID', async () => {
      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'admin' }
      };

      const expectedResult = {
        id: 2,
        nombre: 'María García',
        email: 'maria@example.com',
        telefono: '123456789',
        rol: 'cliente' as UserRole,
        fechaRegistro: new Date(),
      };

      usersService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(2, mockRequest);

      expect(usersService.findOne).toHaveBeenCalledWith(2, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'admin' }
      };

      usersService.findOne.mockRejectedValue(
        new NotFoundException('Usuario no encontrado')
      );

      await expect(controller.findOne(999, mockRequest)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('update', () => {
    it('debe actualizar un usuario exitosamente', async () => {
      const updateUserDto: UpdateUserDto = {
        nombre: 'Juan Carlos Pérez',
      };

      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' }
      };

      const expectedResult = {
        id: 1,
        nombre: 'Juan Carlos Pérez',
        email: 'juan@example.com',
        telefono: '987654321',
        rol: 'cliente' as UserRole,
        fechaRegistro: new Date(),
      };

      usersService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(1, updateUserDto, mockRequest);

      expect(usersService.update).toHaveBeenCalledWith(1, updateUserDto, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar ForbiddenException si el usuario no tiene permisos', async () => {
      const updateUserDto: UpdateUserDto = {
        nombre: 'Juan Carlos Pérez',
      };

      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' }
      };

      usersService.update.mockRejectedValue(
        new ForbiddenException('No tienes permisos para actualizar este usuario')
      );

      await expect(controller.update(2, updateUserDto, mockRequest)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('replace', () => {
    it('debe reemplazar un usuario exitosamente', async () => {
      const replaceUserDto: CreateUserDto = {
        nombre: 'Juan Carlos Pérez',
        email: 'juan.carlos@example.com',
        password: 'NewPassword123',
        telefono: '999888777',
      };

      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' }
      };

      const expectedResult = {
        id: 1,
        nombre: 'Juan Carlos Pérez',
        email: 'juan.carlos@example.com',
        telefono: '999888777',
        rol: 'cliente' as UserRole,
        fechaRegistro: new Date(),
      };

      usersService.replace.mockResolvedValue(expectedResult);

      const result = await controller.replace(1, replaceUserDto, mockRequest);

      expect(usersService.replace).toHaveBeenCalledWith(1, replaceUserDto, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('debe eliminar un usuario exitosamente', async () => {
      usersService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(usersService.remove).toHaveBeenCalledWith(1);
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      usersService.remove.mockRejectedValue(
        new NotFoundException('Usuario no encontrado')
      );

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});