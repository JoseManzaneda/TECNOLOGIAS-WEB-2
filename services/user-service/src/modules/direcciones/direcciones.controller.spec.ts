import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DireccionesController } from './direcciones.controller';
import { DireccionesService } from './direcciones.service';
import { CreateDireccionDto } from './dto/create-direccion.dto';
import { UpdateDireccionDto } from './dto/update-direccion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

describe('DireccionesController', () => {
  let controller: DireccionesController;
  let direccionesService: jest.Mocked<DireccionesService>;

  beforeEach(async () => {
    const direccionesServiceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByUser: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DireccionesController],
      providers: [
        {
          provide: DireccionesService,
          useValue: direccionesServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DireccionesController>(DireccionesController);
    direccionesService = module.get(DireccionesService);
  });

  describe('create', () => {
    it('debe crear una dirección exitosamente', async () => {
      const createDireccionDto: CreateDireccionDto = {
        direccion: 'Av. Siempre Viva 123, Col. Centro',
        ciudad: 'Ciudad de México',
        referencia: 'Entre calle A y calle B, casa azul',
      };

      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' },
      };

      const expectedResult = {
        id: 1,
        direccion: 'Av. Siempre Viva 123, Col. Centro',
        ciudad: 'Ciudad de México',
        referencia: 'Entre calle A y calle B, casa azul',
        userId: 1,
      };

      direccionesService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDireccionDto, mockRequest);

      expect(direccionesService.create).toHaveBeenCalledWith(createDireccionDto, 1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('debe retornar direcciones del usuario autenticado (cliente)', async () => {
      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' },
      };

      const expectedResult = [
        {
          id: 1,
          direccion: 'Av. Siempre Viva 123',
          ciudad: 'Ciudad de México',
          referencia: 'Casa azul',
          userId: 1,
        },
      ];

      direccionesService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(mockRequest);

      expect(direccionesService.findAll).toHaveBeenCalledWith(mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe retornar todas las direcciones (admin)', async () => {
      const mockRequest = {
        user: { id: 2, email: 'admin@example.com', rol: 'admin' },
      };

      const expectedResult = [
        {
          id: 1,
          direccion: 'Av. Siempre Viva 123',
          ciudad: 'Ciudad de México',
          userId: 1,
        },
        {
          id: 2,
          direccion: 'Calle Falsa 456',
          ciudad: 'Guadalajara',
          userId: 3,
        },
      ] as any;

      direccionesService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(mockRequest);

      expect(direccionesService.findAll).toHaveBeenCalledWith(mockRequest.user);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('debe retornar una dirección por ID', async () => {
      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' },
      };

      const expectedResult = {
        id: 1,
        direccion: 'Av. Siempre Viva 123',
        ciudad: 'Ciudad de México',
        referencia: 'Casa azul',
        userId: 1,
      } as any;

      direccionesService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(1, mockRequest);

      expect(direccionesService.findOne).toHaveBeenCalledWith(1, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar NotFoundException si la dirección no existe', async () => {
      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' },
      };

      direccionesService.findOne.mockRejectedValue(
        new NotFoundException('Dirección no encontrada'),
      );

      await expect(controller.findOne(999, mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByUser', () => {
    it('debe retornar direcciones de un usuario específico', async () => {
      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'admin' },
      };

      const expectedResult = [
        {
          id: 1,
          direccion: 'Av. Siempre Viva 123',
          ciudad: 'Ciudad de México',
          userId: 2,
        },
      ] as any;

      direccionesService.findByUser.mockResolvedValue(expectedResult);

      const result = await controller.findByUser(2, mockRequest);

      expect(direccionesService.findByUser).toHaveBeenCalledWith(2, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar ForbiddenException si cliente intenta acceder a direcciones de otro usuario', async () => {
      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' },
      };

      direccionesService.findByUser.mockRejectedValue(
        new ForbiddenException('No tienes permisos para acceder a estas direcciones'),
      );

      await expect(controller.findByUser(2, mockRequest)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('debe actualizar una dirección exitosamente', async () => {
      const updateDireccionDto: UpdateDireccionDto = {
        ciudad: 'Guadalajara',
        referencia: 'Nueva referencia',
      };

      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' },
      };

      const expectedResult = {
        id: 1,
        direccion: 'Av. Siempre Viva 123',
        ciudad: 'Guadalajara',
        referencia: 'Nueva referencia',
        userId: 1,
      };

      direccionesService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(1, updateDireccionDto, mockRequest);

      expect(direccionesService.update).toHaveBeenCalledWith(
        1,
        updateDireccionDto,
        mockRequest.user,
      );
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar ForbiddenException si usuario no tiene permisos', async () => {
      const updateDireccionDto: UpdateDireccionDto = {
        ciudad: 'Guadalajara',
      };

      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' },
      };

      direccionesService.update.mockRejectedValue(
        new ForbiddenException('No tienes permisos para actualizar esta dirección'),
      );

      await expect(controller.update(2, updateDireccionDto, mockRequest)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('debe eliminar una dirección exitosamente', async () => {
      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'admin' },
      };

      direccionesService.remove.mockResolvedValue(undefined);

      await controller.remove(1, mockRequest);

      expect(direccionesService.remove).toHaveBeenCalledWith(1, mockRequest.user);
    });

    it('debe lanzar NotFoundException si la dirección no existe', async () => {
      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'admin' },
      };

      direccionesService.remove.mockRejectedValue(
        new NotFoundException('Dirección no encontrada'),
      );

      await expect(controller.remove(999, mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});