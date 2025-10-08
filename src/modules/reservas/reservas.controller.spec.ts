import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';
import { CreateReservasDto } from './dto/create-reservas.dto';
import { UpdateReservasDto } from './dto/update-reservas.dto';
import { CambiarEstadoReservaDto } from './dto/cambiar-estado-reserva.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

describe('ReservasController', () => {
  let controller: ReservasController;
  let service: jest.Mocked<ReservasService>;

  beforeEach(async () => {
    const serviceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      getMisReservas: jest.fn(),
      update: jest.fn(),
      cambiarEstado: jest.fn(),
      remove: jest.fn(),
      getEstadisticas: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservasController],
      providers: [
        {
          provide: ReservasService,
          useValue: serviceMock,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<ReservasController>(ReservasController);
    service = module.get(ReservasService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear una reserva exitosamente', async () => {
      const createDto: CreateReservasDto = {
        userId: 5,
        fechaReserva: '2024-12-25',
        hora: '19:30',
        numPersonas: 4,
      };

      const mockRequest = {
        user: { id: 5, rol: 'cliente' }
      };

      const expectedResult = {
        id: 1,
        userId: 5,
        fechaReserva: '2024-12-25',
        hora: '19:30',
        numPersonas: 4,
        estado: 'pendiente',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };

      service.create.mockResolvedValue(expectedResult as any);

      const result = await controller.create(createDto, mockRequest);

      expect(service.create).toHaveBeenCalledWith(createDto, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar BadRequestException si la fecha no es futura', async () => {
      const createDto: CreateReservasDto = {
        userId: 5,
        fechaReserva: '2024-01-01',
        hora: '19:30',
        numPersonas: 4,
      };

      const mockRequest = {
        user: { id: 5, rol: 'cliente' }
      };

      service.create.mockRejectedValue(
        new BadRequestException('La reserva debe ser para una fecha y hora futuras')
      );

      await expect(controller.create(createDto, mockRequest)).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar ConflictException si ya existe una reserva en ese horario', async () => {
      const createDto: CreateReservasDto = {
        userId: 5,
        fechaReserva: '2024-12-25',
        hora: '19:30',
        numPersonas: 4,
      };

      const mockRequest = {
        user: { id: 5, rol: 'cliente' }
      };

      service.create.mockRejectedValue(
        new ConflictException('Ya existe una reserva para 2024-12-25 a las 19:30')
      );

      await expect(controller.create(createDto, mockRequest)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('debe retornar todas las reservas para admin', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      const expectedResult = [
        {
          id: 1,
          userId: 5,
          fechaReserva: '2024-12-25',
          hora: '19:30',
          numPersonas: 4,
          estado: 'pendiente',
          user: {
            id: 5,
            nombre: 'María García',
            email: 'maria@example.com',
          },
        },
      ];

      service.findAll.mockResolvedValue(expectedResult as any);

      const result = await controller.findAll(mockRequest);

      expect(service.findAll).toHaveBeenCalledWith(mockRequest.user, undefined, undefined);
      expect(result).toEqual(expectedResult);
    });

    it('debe aplicar filtros correctamente', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      service.findAll.mockResolvedValue([]);

      await controller.findAll(mockRequest, 'confirmada', '2024-12-25');

      expect(service.findAll).toHaveBeenCalledWith(mockRequest.user, 'confirmada', '2024-12-25');
    });

    it('debe retornar solo las reservas del usuario para cliente', async () => {
      const mockRequest = {
        user: { id: 5, rol: 'cliente' }
      };

      const expectedResult = [
        {
          id: 1,
          userId: 5,
          fechaReserva: '2024-12-25',
          hora: '19:30',
          numPersonas: 4,
          estado: 'pendiente',
        },
      ];

      service.findAll.mockResolvedValue(expectedResult as any);

      const result = await controller.findAll(mockRequest);

      expect(service.findAll).toHaveBeenCalledWith(mockRequest.user, undefined, undefined);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getMisReservas', () => {
    it('debe retornar las reservas del usuario autenticado', async () => {
      const mockRequest = {
        user: { id: 5, rol: 'cliente' }
      };

      const expectedResult = [
        {
          id: 1,
          userId: 5,
          fechaReserva: '2024-12-25',
          hora: '19:30',
          numPersonas: 4,
          estado: 'confirmada',
          user: {
            id: 5,
            nombre: 'María García',
            email: 'maria@example.com',
          },
        },
      ];

      service.getMisReservas.mockResolvedValue(expectedResult as any);

      const result = await controller.getMisReservas(mockRequest);

      expect(service.getMisReservas).toHaveBeenCalledWith(mockRequest.user, undefined);
      expect(result).toEqual(expectedResult);
    });

    it('debe aplicar filtro de estado', async () => {
      const mockRequest = {
        user: { id: 5, rol: 'cliente' }
      };

      service.getMisReservas.mockResolvedValue([]);

      await controller.getMisReservas(mockRequest, 'confirmada');

      expect(service.getMisReservas).toHaveBeenCalledWith(mockRequest.user, 'confirmada');
    });
  });

  describe('getEstadisticas', () => {
    it('debe retornar estadísticas del sistema para admin', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      const expectedResult = {
        totalReservas: 150,
        reservasPendientes: 25,
        reservasConfirmadas: 98,
        reservasCanceladas: 27,
        reservasHoy: 8,
        reservasFuturas: 45,
        promedioPersonasPorReserva: 3.2,
      };

      service.getEstadisticas.mockResolvedValue(expectedResult);

      const result = await controller.getEstadisticas(mockRequest);

      expect(service.getEstadisticas).toHaveBeenCalledWith(mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const mockRequest = {
        user: { id: 5, rol: 'cliente' }
      };

      service.getEstadisticas.mockRejectedValue(
        new ForbiddenException('Solo los administradores pueden ver las estadísticas')
      );

      await expect(controller.getEstadisticas(mockRequest)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findOne', () => {
    it('debe retornar una reserva específica', async () => {
      const mockRequest = {
        user: { id: 5, rol: 'cliente' }
      };

      const expectedResult = {
        id: 1,
        userId: 5,
        fechaReserva: '2024-12-25',
        hora: '19:30',
        numPersonas: 4,
        estado: 'confirmada',
        user: {
          id: 5,
          nombre: 'María García',
          email: 'maria@example.com',
          telefono: '+1234567890',
        },
      };

      service.findOne.mockResolvedValue(expectedResult as any);

      const result = await controller.findOne(1, mockRequest);

      expect(service.findOne).toHaveBeenCalledWith(1, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar NotFoundException si la reserva no existe', async () => {
      const mockRequest = {
        user: { id: 5, rol: 'cliente' }
      };

      service.findOne.mockRejectedValue(
        new NotFoundException('Reserva con ID 999 no encontrada')
      );

      await expect(controller.findOne(999, mockRequest)).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar ForbiddenException si el usuario no puede ver la reserva', async () => {
      const mockRequest = {
        user: { id: 5, rol: 'cliente' }
      };

      service.findOne.mockRejectedValue(
        new ForbiddenException('No tienes permiso para ver esta reserva')
      );

      await expect(controller.findOne(1, mockRequest)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('cambiarEstado', () => {
    it('debe cambiar el estado de una reserva exitosamente', async () => {
      const cambiarEstadoDto: CambiarEstadoReservaDto = {
        estado: 'confirmada',
        motivo: 'Mesa confirmada para la fecha solicitada',
      };

      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      const expectedResult = {
        id: 1,
        userId: 5,
        fechaReserva: '2024-12-25',
        hora: '19:30',
        numPersonas: 4,
        estado: 'confirmada',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };

      service.cambiarEstado.mockResolvedValue(expectedResult as any);

      const result = await controller.cambiarEstado(1, cambiarEstadoDto, mockRequest);

      expect(service.cambiarEstado).toHaveBeenCalledWith(1, cambiarEstadoDto, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar ForbiddenException si cliente trata de confirmar', async () => {
      const cambiarEstadoDto: CambiarEstadoReservaDto = {
        estado: 'confirmada',
      };

      const mockRequest = {
        user: { id: 5, rol: 'cliente' }
      };

      service.cambiarEstado.mockRejectedValue(
        new ForbiddenException('Solo los administradores pueden confirmar reservas')
      );

      await expect(controller.cambiarEstado(1, cambiarEstadoDto, mockRequest)).rejects.toThrow(ForbiddenException);
    });

    it('debe permitir al cliente cancelar su propia reserva', async () => {
      const cambiarEstadoDto: CambiarEstadoReservaDto = {
        estado: 'cancelada',
        motivo: 'Cambio de planes',
      };

      const mockRequest = {
        user: { id: 5, rol: 'cliente' }
      };

      const expectedResult = {
        id: 1,
        userId: 5,
        estado: 'cancelada',
      };

      service.cambiarEstado.mockResolvedValue(expectedResult as any);

      const result = await controller.cambiarEstado(1, cambiarEstadoDto, mockRequest);

      expect(service.cambiarEstado).toHaveBeenCalledWith(1, cambiarEstadoDto, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('debe actualizar una reserva exitosamente', async () => {
      const updateDto: UpdateReservasDto = {
        fechaReserva: '2024-12-30',
        hora: '20:00',
        numPersonas: 6,
      };

      const mockRequest = {
        user: { id: 5, rol: 'cliente' }
      };

      const expectedResult = {
        id: 1,
        userId: 5,
        fechaReserva: '2024-12-30',
        hora: '20:00',
        numPersonas: 6,
        estado: 'pendiente',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };

      service.update.mockResolvedValue(expectedResult as any);

      const result = await controller.update(1, updateDto, mockRequest);

      expect(service.update).toHaveBeenCalledWith(1, updateDto, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar BadRequestException si la reserva no se puede modificar', async () => {
      const updateDto: UpdateReservasDto = {
        numPersonas: 6,
      };

      const mockRequest = {
        user: { id: 5, rol: 'cliente' }
      };

      service.update.mockRejectedValue(
        new BadRequestException('No se puede modificar una reserva cancelada')
      );

      await expect(controller.update(1, updateDto, mockRequest)).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar ForbiddenException si cliente trata de cambiar userId', async () => {
      const updateDto: UpdateReservasDto = {
        userId: 8,
      };

      const mockRequest = {
        user: { id: 5, rol: 'cliente' }
      };

      service.update.mockRejectedValue(
        new ForbiddenException('Solo los administradores pueden cambiar el usuario de las reservas')
      );

      await expect(controller.update(1, updateDto, mockRequest)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('debe cancelar una reserva exitosamente', async () => {
      const mockRequest = {
        user: { id: 5, rol: 'cliente' }
      };

      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1, mockRequest);

      expect(service.remove).toHaveBeenCalledWith(1, mockRequest.user);
      expect(result).toEqual({ message: 'Reserva cancelada exitosamente' });
    });

    it('debe lanzar BadRequestException si la reserva ya está cancelada', async () => {
      const mockRequest = {
        user: { id: 5, rol: 'cliente' }
      };

      service.remove.mockRejectedValue(
        new BadRequestException('La reserva ya está cancelada')
      );

      await expect(controller.remove(1, mockRequest)).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si trata de cancelar reserva pasada', async () => {
      const mockRequest = {
        user: { id: 5, rol: 'cliente' }
      };

      service.remove.mockRejectedValue(
        new BadRequestException('No se puede cancelar una reserva pasada')
      );

      await expect(controller.remove(1, mockRequest)).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar NotFoundException si la reserva no existe', async () => {
      const mockRequest = {
        user: { id: 5, rol: 'cliente' }
      };

      service.remove.mockRejectedValue(
        new NotFoundException('Reserva con ID 999 no encontrada')
      );

      await expect(controller.remove(999, mockRequest)).rejects.toThrow(NotFoundException);
    });
  });
});