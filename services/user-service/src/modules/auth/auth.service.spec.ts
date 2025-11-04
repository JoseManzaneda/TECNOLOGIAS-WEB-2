import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const usersServiceMock = {
      findByEmail: jest.fn(),
    };

    const jwtServiceMock = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('debe retornar usuario sin password si las credenciales son válidas', async () => {
      const user = {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        passwordHash: 'hashedPassword',
        rol: 'cliente' as const,
        telefono: '987654321',
        fechaRegistro: new Date(),
      };

      usersService.findByEmail.mockResolvedValue(user);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateUser('juan@example.com', 'Password123');

      expect(usersService.findByEmail).toHaveBeenCalledWith('juan@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('Password123', 'hashedPassword');
      expect(result).toEqual({
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        rol: 'cliente',
        telefono: '987654321',
        fechaRegistro: user.fechaRegistro,
      });
    });

    it('debe retornar null si el usuario no existe', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'Password123');

      expect(usersService.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('debe retornar null si la contraseña es incorrecta', async () => {
      const user = {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        passwordHash: 'hashedPassword',
        rol: 'cliente' as const,
        telefono: '987654321',
        fechaRegistro: new Date(),
      };

      usersService.findByEmail.mockResolvedValue(user);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validateUser('juan@example.com', 'wrongPassword');

      expect(usersService.findByEmail).toHaveBeenCalledWith('juan@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('debe retornar token JWT y datos del usuario si las credenciales son válidas', async () => {
      const user = {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        passwordHash: 'hashedPassword',
        rol: 'cliente' as const,
        telefono: '987654321',
        fechaRegistro: new Date(),
      };

      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

      usersService.findByEmail.mockResolvedValue(user);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      jwtService.signAsync.mockResolvedValue(mockToken);

      const result = await service.login('juan@example.com', 'Password123');

      expect(usersService.findByEmail).toHaveBeenCalledWith('juan@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('Password123', 'hashedPassword');
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 1,
        rol: 'cliente',
        email: 'juan@example.com',
      });
      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: 1,
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
          rol: 'cliente',
        },
      });
    });

    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login('nonexistent@example.com', 'Password123')
      ).rejects.toThrow(UnauthorizedException);

      expect(usersService.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });

    it('debe lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      const user = {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        passwordHash: 'hashedPassword',
        rol: 'cliente' as const,
        telefono: '987654321',
        fechaRegistro: new Date(),
      };

      usersService.findByEmail.mockResolvedValue(user);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        service.login('juan@example.com', 'wrongPassword')
      ).rejects.toThrow(UnauthorizedException);

      expect(usersService.findByEmail).toHaveBeenCalledWith('juan@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
    });
  });
});