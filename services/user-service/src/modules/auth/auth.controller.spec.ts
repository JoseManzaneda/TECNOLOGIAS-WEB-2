import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const authServiceMock = {
      login: jest.fn(),
    };

    const usersServiceMock = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    usersService = module.get(UsersService);
  });

  describe('register', () => {
    it('debe registrar un usuario exitosamente', async () => {
      const registerDto = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'Password123',
        telefono: '987654321',
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

      const result = await controller.register(registerDto);

      expect(usersService.create).toHaveBeenCalledWith({
        ...registerDto,
        rol: 'cliente'
      });
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar ConflictException si el email ya existe', async () => {
      const registerDto = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'Password123',
      };

      usersService.create.mockRejectedValue(
        new ConflictException('Email ya registrado')
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        ConflictException
      );
      expect(usersService.create).toHaveBeenCalledWith({
        ...registerDto,
        rol: 'cliente'
      });
    });
  });

  describe('login', () => {
    it('debe hacer login exitosamente con credenciales válidas', async () => {
      const loginDto: LoginDto = {
        email: 'juan@example.com',
        password: 'Password123',
      };

      const expectedResult = {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
          rol: 'cliente' as UserRole,
        },
      };

      authService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password
      );
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar UnauthorizedException con credenciales inválidas', async () => {
      const loginDto: LoginDto = {
        email: 'juan@example.com',
        password: 'wrongpassword',
      };

      authService.login.mockRejectedValue(
        new UnauthorizedException('Credenciales inválidas')
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      expect(authService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password
      );
    });
  });
});