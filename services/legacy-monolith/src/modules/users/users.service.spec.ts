import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const repositoryMock = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));

    // Reset mocks
    jest.clearAllMocks();
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

      const hashedPassword = 'hashedPassword123';
      const createdUser = {
        ...createUserDto,
        id: 1,
        passwordHash: hashedPassword,
        fechaRegistro: new Date(),
      };

      repository.findOne.mockResolvedValue(null); // Email no existe
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      repository.create.mockReturnValue(createdUser as User);
      repository.save.mockResolvedValue(createdUser as User);

      const result = await service.create(createUserDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: createUserDto.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(repository.create).toHaveBeenCalledWith({
        nombre: createUserDto.nombre,
        email: createUserDto.email,
        telefono: createUserDto.telefono,
        passwordHash: hashedPassword,
        rol: 'cliente',
      });
      expect(repository.save).toHaveBeenCalledWith(createdUser);
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.nombre).toBe(createUserDto.nombre);
    });

    it('debe lanzar ConflictException si el email ya existe', async () => {
      const createUserDto: CreateUserDto = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'Password123',
      };

      const existingUser = { id: 1, email: createUserDto.email } as User;
      repository.findOne.mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: createUserDto.email } });
    });
  });

  describe('findAll', () => {
    it('debe retornar lista de usuarios sin contraseñas', async () => {
      const users = [
        {
          id: 1,
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
          passwordHash: 'hash1',
          rol: 'cliente',
          fechaRegistro: new Date(),
        },
        {
          id: 2,
          nombre: 'María García',
          email: 'maria@example.com',
          passwordHash: 'hash2',
          rol: 'admin',
          fechaRegistro: new Date(),
        },
      ] as User[];

      repository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('passwordHash');
      expect(result[1]).not.toHaveProperty('passwordHash');
    });
  });

  describe('findOne', () => {
    it('debe retornar un usuario sin contraseña', async () => {
      const user = {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        passwordHash: 'hash1',
        rol: 'cliente',
        fechaRegistro: new Date(),
      } as User;

      repository.findOne.mockResolvedValue(user);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.nombre).toBe(user.nombre);
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar ForbiddenException si cliente intenta acceder a otro usuario', async () => {
      const user = {
        id: 2,
        nombre: 'María García',
        email: 'maria@example.com',
        passwordHash: 'hash2',
        rol: 'cliente',
        fechaRegistro: new Date(),
      } as User;

      const currentUser = { id: 1, rol: 'cliente' };

      repository.findOne.mockResolvedValue(user);

      await expect(service.findOne(2, currentUser)).rejects.toThrow(ForbiddenException);
    });

    it('debe permitir a admin acceder a cualquier usuario', async () => {
      const user = {
        id: 2,
        nombre: 'María García',
        email: 'maria@example.com',
        passwordHash: 'hash2',
        rol: 'cliente',
        fechaRegistro: new Date(),
      } as User;

      const currentUser = { id: 1, rol: 'admin' };

      repository.findOne.mockResolvedValue(user);

      const result = await service.findOne(2, currentUser);

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.nombre).toBe(user.nombre);
    });
  });

  describe('update', () => {
    it('debe actualizar usuario exitosamente', async () => {
      const updateUserDto: UpdateUserDto = {
        nombre: 'Juan Carlos Pérez',
      };

      const user = {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        passwordHash: 'hash1',
        rol: 'cliente' as UserRole,
        fechaRegistro: new Date(),
      } as User;

      const currentUser = { id: 1, rol: 'cliente' };

      repository.findOne.mockResolvedValue(user);
      repository.save.mockResolvedValue({ ...user, nombre: updateUserDto.nombre! });

      const result = await service.update(1, updateUserDto, currentUser);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.save).toHaveBeenCalled();
      expect(result.nombre).toBe(updateUserDto.nombre);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('debe lanzar ForbiddenException si cliente intenta cambiar su rol', async () => {
      const updateUserDto: UpdateUserDto = {
        rol: 'admin',
      };

      const user = {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        passwordHash: 'hash1',
        rol: 'cliente' as UserRole,
        fechaRegistro: new Date(),
      } as User;

      const currentUser = { id: 1, rol: 'cliente' };

      repository.findOne.mockResolvedValue(user);

      await expect(service.update(1, updateUserDto, currentUser)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('debe eliminar usuario exitosamente', async () => {
      const user = {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        passwordHash: 'hash1',
        rol: 'cliente' as UserRole,
        fechaRegistro: new Date(),
      } as User;

      repository.findOne.mockResolvedValue(user);
      repository.remove.mockResolvedValue(user);

      await service.remove(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.remove).toHaveBeenCalledWith(user);
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});