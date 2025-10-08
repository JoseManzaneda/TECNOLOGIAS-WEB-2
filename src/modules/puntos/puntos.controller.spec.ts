import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PuntosController } from './puntos.controller';
import { PuntosService } from './puntos.service';
import { CreatePuntosDto } from './dto/create-puntos.dto';
import { UpdatePuntosDto } from './dto/update-puntos.dto';
import { AgregarPuntosDto } from './dto/agregar-puntos.dto';
import { CanjearPuntosDto } from './dto/canjear-puntos.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

describe('PuntosController', () => {
  let controller: PuntosController;
  let service: jest.Mocked<PuntosService>;

  beforeEach(async () => {
    const serviceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByUserId: jest.fn(),
      getMisPuntos: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      agregarPuntos: jest.fn(),
      canjearPuntos: jest.fn(),
      getRanking: jest.fn(),
      getEstadisticas: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PuntosController],
      providers: [
        {
          provide: PuntosService,
          useValue: serviceMock,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<PuntosController>(PuntosController);
    service = module.get(PuntosService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear un registro de puntos exitosamente', async () => {
      const createDto: CreatePuntosDto = {
        userId: 5,
        puntosAcumulados: 150,
      };

      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      const expectedResult = {
        id: 1,
        userId: 5,
        puntosAcumulados: 150,
        ultimaActualizacion: new Date(),
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };

      service.create.mockResolvedValue(expectedResult as any);

      const result = await controller.create(createDto, mockRequest);

      expect(service.create).toHaveBeenCalledWith(createDto, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar ConflictException si el usuario ya tiene puntos', async () => {
      const createDto: CreatePuntosDto = {
        userId: 5,
        puntosAcumulados: 150,
      };

      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      service.create.mockRejectedValue(
        new ConflictException('El usuario ya tiene un registro de puntos')
      );

      await expect(controller.create(createDto, mockRequest)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('debe retornar todos los registros de puntos para admin', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      const expectedResult = [
        {
          id: 1,
          userId: 5,
          puntosAcumulados: 1250,
          ultimaActualizacion: new Date(),
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          user: {
            id: 5,
            nombre: 'María García',
            email: 'maria@example.com',
            rol: 'cliente',
          },
        },
      ];

      service.findAll.mockResolvedValue(expectedResult as any);

      const result = await controller.findAll(mockRequest);

      expect(service.findAll).toHaveBeenCalledWith(mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'cliente' }
      };

      service.findAll.mockRejectedValue(
        new ForbiddenException('Solo los administradores pueden ver todos los registros de puntos')
      );

      await expect(controller.findAll(mockRequest)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getMisPuntos', () => {
    it('debe retornar los puntos del usuario autenticado', async () => {
      const mockRequest = {
        user: { id: 5, rol: 'cliente' }
      };

      const expectedResult = {
        id: 3,
        userId: 5,
        puntosAcumulados: 750,
        ultimaActualizacion: new Date(),
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        user: {
          id: 5,
          nombre: 'María García',
          email: 'maria@example.com',
          rol: 'cliente',
        },
      };

      service.getMisPuntos.mockResolvedValue(expectedResult as any);

      const result = await controller.getMisPuntos(mockRequest);

      expect(service.getMisPuntos).toHaveBeenCalledWith(mockRequest.user);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getRanking', () => {
    it('debe retornar el ranking de usuarios con más puntos', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      const expectedResult = [
        {
          id: 1,
          userId: 5,
          puntosAcumulados: 2500,
          ultimaActualizacion: new Date(),
          user: {
            id: 5,
            nombre: 'María García',
            email: 'maria@example.com',
          },
        },
        {
          id: 2,
          userId: 8,
          puntosAcumulados: 1800,
          ultimaActualizacion: new Date(),
          user: {
            id: 8,
            nombre: 'Carlos López',
            email: 'carlos@example.com',
          },
        },
      ];

      service.getRanking.mockResolvedValue(expectedResult as any);

      const result = await controller.getRanking(5, mockRequest);

      expect(service.getRanking).toHaveBeenCalledWith(mockRequest.user, 5);
      expect(result).toEqual(expectedResult);
    });

    it('debe usar limit por defecto de 10', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      service.getRanking.mockResolvedValue([]);

      await controller.getRanking(undefined as any, mockRequest);

      expect(service.getRanking).toHaveBeenCalledWith(mockRequest.user, 10);
    });
  });

  describe('getEstadisticas', () => {
    it('debe retornar estadísticas del sistema para admin', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      const expectedResult = {
        totalUsuariosConPuntos: 45,
        usuariosActivos: 38,
        usuariosPremium: 12,
        totalPuntosEnCirculacion: 15750,
        promedioPuntosPorUsuario: 350.0,
        maximoPuntos: 2500,
        minimoPuntos: 0,
      };

      service.getEstadisticas.mockResolvedValue(expectedResult);

      const result = await controller.getEstadisticas(mockRequest);

      expect(service.getEstadisticas).toHaveBeenCalledWith(mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'cliente' }
      };

      service.getEstadisticas.mockRejectedValue(
        new ForbiddenException('Solo los administradores pueden ver las estadísticas')
      );

      await expect(controller.getEstadisticas(mockRequest)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findByUserId', () => {
    it('debe retornar puntos de un usuario específico', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      const expectedResult = {
        id: 1,
        userId: 5,
        puntosAcumulados: 1250,
        ultimaActualizacion: new Date(),
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        user: {
          id: 5,
          nombre: 'María García',
          email: 'maria@example.com',
          rol: 'cliente',
        },
      };

      service.findByUserId.mockResolvedValue(expectedResult as any);

      const result = await controller.findByUserId(5, mockRequest);

      expect(service.findByUserId).toHaveBeenCalledWith(5, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar NotFoundException si el usuario no tiene puntos', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      service.findByUserId.mockRejectedValue(
        new NotFoundException('El usuario con ID 999 no tiene registro de puntos')
      );

      await expect(controller.findByUserId(999, mockRequest)).rejects.toThrow(NotFoundException);
    });
  });

  describe('agregarPuntos', () => {
    it('debe agregar puntos a un usuario exitosamente', async () => {
      const agregarDto: AgregarPuntosDto = {
        puntos: 100,
        descripcion: 'Bonificación por cumpleaños',
      };

      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      const expectedResult = {
        id: 1,
        userId: 5,
        puntosAcumulados: 1350,
        ultimaActualizacion: new Date(),
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };

      service.agregarPuntos.mockResolvedValue(expectedResult as any);

      const result = await controller.agregarPuntos(5, agregarDto, mockRequest);

      expect(service.agregarPuntos).toHaveBeenCalledWith(5, agregarDto, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const agregarDto: AgregarPuntosDto = {
        puntos: 100,
        descripcion: 'Bonificación',
      };

      const mockRequest = {
        user: { id: 1, rol: 'cliente' }
      };

      service.agregarPuntos.mockRejectedValue(
        new ForbiddenException('Los clientes no pueden agregar puntos manualmente')
      );

      await expect(controller.agregarPuntos(5, agregarDto, mockRequest)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('canjearPuntos', () => {
    it('debe canjear puntos exitosamente', async () => {
      const canjearDto: CanjearPuntosDto = {
        puntos: 500,
        descripcion: 'Descuento 10% en próxima compra',
      };

      const mockRequest = {
        user: { id: 5, rol: 'cliente' }
      };

      const expectedResult = {
        id: 1,
        userId: 5,
        puntosAcumulados: 850,
        ultimaActualizacion: new Date(),
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };

      service.canjearPuntos.mockResolvedValue(expectedResult as any);

      const result = await controller.canjearPuntos(5, canjearDto, mockRequest);

      expect(service.canjearPuntos).toHaveBeenCalledWith(5, canjearDto, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar BadRequestException si no tiene suficientes puntos', async () => {
      const canjearDto: CanjearPuntosDto = {
        puntos: 500,
        descripcion: 'Descuento',
      };

      const mockRequest = {
        user: { id: 5, rol: 'cliente' }
      };

      service.canjearPuntos.mockRejectedValue(
        new BadRequestException('Puntos insuficientes. Disponibles: 300, Solicitados: 500')
      );

      await expect(controller.canjearPuntos(5, canjearDto, mockRequest)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('debe retornar un registro específico', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      const expectedResult = {
        id: 1,
        userId: 5,
        puntosAcumulados: 1250,
        ultimaActualizacion: new Date(),
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        user: {
          id: 5,
          nombre: 'María García',
          email: 'maria@example.com',
          rol: 'cliente',
        },
      };

      service.findOne.mockResolvedValue(expectedResult as any);

      const result = await controller.findOne(1, mockRequest);

      expect(service.findOne).toHaveBeenCalledWith(1, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar NotFoundException si el registro no existe', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      service.findOne.mockRejectedValue(
        new NotFoundException('Registro de puntos con ID 999 no encontrado')
      );

      await expect(controller.findOne(999, mockRequest)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar un registro exitosamente', async () => {
      const updateDto: UpdatePuntosDto = {
        puntosAcumulados: 2000,
      };

      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      const expectedResult = {
        id: 1,
        userId: 5,
        puntosAcumulados: 2000,
        ultimaActualizacion: new Date(),
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };

      service.update.mockResolvedValue(expectedResult as any);

      const result = await controller.update(1, updateDto, mockRequest);

      expect(service.update).toHaveBeenCalledWith(1, updateDto, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const updateDto: UpdatePuntosDto = {
        puntosAcumulados: 2000,
      };

      const mockRequest = {
        user: { id: 1, rol: 'cliente' }
      };

      service.update.mockRejectedValue(
        new ForbiddenException('Solo los administradores pueden actualizar puntos directamente')
      );

      await expect(controller.update(1, updateDto, mockRequest)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('debe eliminar un registro exitosamente', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1, mockRequest);

      expect(service.remove).toHaveBeenCalledWith(1, mockRequest.user);
      expect(result).toEqual({ message: 'Registro de puntos eliminado exitosamente' });
    });

    it('debe lanzar NotFoundException si el registro no existe', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      service.remove.mockRejectedValue(
        new NotFoundException('Registro de puntos con ID 999 no encontrado')
      );

      await expect(controller.remove(999, mockRequest)).rejects.toThrow(NotFoundException);
    });
  });
});