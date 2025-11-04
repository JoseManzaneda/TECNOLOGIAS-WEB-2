import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { Reservas } from './entities/reservas.entity';
import { User } from '../users/entities/user.entity';
import { CreateReservasDto } from './dto/create-reservas.dto';
import { UpdateReservasDto } from './dto/update-reservas.dto';
import { CambiarEstadoReservaDto } from './dto/cambiar-estado-reserva.dto';

describe('ReservasService', () => {
  let service: ReservasService;
  let reservasRepository: jest.Mocked<Repository<Reservas>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let queryBuilder: any;

  beforeEach(async () => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
      getRawOne: jest.fn(),
    };

    const repositoryMock = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };

    const userRepositoryMock = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservasService,
        {
          provide: getRepositoryToken(Reservas),
          useValue: repositoryMock,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<ReservasService>(ReservasService);
    reservasRepository = module.get(getRepositoryToken(Reservas));
    userRepository = module.get(getRepositoryToken(User));

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

      const clientUser = { id: 5, rol: 'cliente' };
      const targetUser = { id: 5, nombre: 'María García', rol: 'cliente' };
      const newReserva = {
        id: 1,
        userId: 5,
        fechaReserva: '2024-12-25',
        hora: '19:30',
        numPersonas: 4,
        estado: 'pendiente',
      };

      // Mock current date to be before the reservation date (more than 24 hours before)
      jest.spyOn(Date, 'now').mockImplementation(() => new Date('2024-12-23T10:00:00Z').getTime());

      userRepository.findOne.mockResolvedValue(targetUser as User);
      queryBuilder.getMany.mockResolvedValue([]);
      reservasRepository.create.mockReturnValue(newReserva as Reservas);
      reservasRepository.save.mockResolvedValue(newReserva as Reservas);

      const result = await service.create(createDto, clientUser as User);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 5 },
      });
      expect(reservasRepository.create).toHaveBeenCalledWith({
        userId: 5,
        fechaReserva: '2024-12-25',
        hora: '19:30',
        numPersonas: 4,
        estado: 'pendiente',
      });
      expect(result).toEqual(newReserva);
    });

    it('debe lanzar ForbiddenException si cliente trata de crear reserva para otro usuario', async () => {
      const createDto: CreateReservasDto = {
        userId: 8,
        fechaReserva: '2024-12-25',
        hora: '19:30',
        numPersonas: 4,
      };

      const clientUser = { id: 5, rol: 'cliente' };
      const targetUser = { id: 8, nombre: 'Carlos López', rol: 'cliente' };

      userRepository.findOne.mockResolvedValue(targetUser as User);

      await expect(service.create(createDto, clientUser as User)).rejects.toThrow(ForbiddenException);
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      const createDto: CreateReservasDto = {
        userId: 999,
        fechaReserva: '2024-12-25',
        hora: '19:30',
        numPersonas: 4,
      };

      const adminUser = { id: 1, rol: 'admin' };

      userRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, adminUser as User)).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar BadRequestException si la fecha no es futura', async () => {
      const createDto: CreateReservasDto = {
        userId: 5,
        fechaReserva: '2024-01-01',
        hora: '10:00',
        numPersonas: 4,
      };

      const clientUser = { id: 5, rol: 'cliente' };
      const targetUser = { id: 5, nombre: 'María García', rol: 'cliente' };

      userRepository.findOne.mockResolvedValue(targetUser as User);

      await expect(service.create(createDto, clientUser as User)).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si la hora está fuera del horario de atención', async () => {
      const createDto: CreateReservasDto = {
        userId: 5,
        fechaReserva: '2024-12-25',
        hora: '06:00', // Antes de las 08:00
        numPersonas: 4,
      };

      const clientUser = { id: 5, rol: 'cliente' };
      const targetUser = { id: 5, nombre: 'María García', rol: 'cliente' };

      // Mock current date to be before the reservation date (more than 24 hours before)
      jest.spyOn(Date, 'now').mockImplementation(() => new Date('2024-12-23T10:00:00Z').getTime());

      userRepository.findOne.mockResolvedValue(targetUser as User);

      await expect(service.create(createDto, clientUser as User)).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar ConflictException si ya existe una reserva en ese horario', async () => {
      const createDto: CreateReservasDto = {
        userId: 5,
        fechaReserva: '2024-12-25',
        hora: '19:30',
        numPersonas: 4,
      };

      const clientUser = { id: 5, rol: 'cliente' };
      const targetUser = { id: 5, nombre: 'María García', rol: 'cliente' };
      const existingReserva = { id: 2, userId: 8, fechaReserva: '2024-12-25', hora: '19:30' };

      // Mock current date to be before the reservation date (more than 24 hours before)
      jest.spyOn(Date, 'now').mockImplementation(() => new Date('2024-12-23T10:00:00Z').getTime());

      userRepository.findOne.mockResolvedValue(targetUser as User);
      queryBuilder.getMany.mockResolvedValue([existingReserva]);

      await expect(service.create(createDto, clientUser as User)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('debe retornar todas las reservas para admin', async () => {
      const adminUser = { id: 1, rol: 'admin' };
      const mockReservas = [
        {
          id: 1,
          userId: 5,
          fechaReserva: '2024-12-25',
          hora: '19:30',
          numPersonas: 4,
          estado: 'pendiente',
          user: { id: 5, nombre: 'María García' },
        },
      ];

      queryBuilder.getMany.mockResolvedValue(mockReservas);

      const result = await service.findAll(adminUser as User);

      expect(reservasRepository.createQueryBuilder).toHaveBeenCalledWith('reservas');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('reservas.user', 'user');
      expect(result).toEqual(mockReservas);
    });

    it('debe retornar solo las reservas del usuario para cliente', async () => {
      const clientUser = { id: 5, rol: 'cliente' };
      const mockReservas = [
        {
          id: 1,
          userId: 5,
          fechaReserva: '2024-12-25',
          hora: '19:30',
          numPersonas: 4,
          estado: 'pendiente',
        },
      ];

      queryBuilder.getMany.mockResolvedValue(mockReservas);

      const result = await service.findAll(clientUser as User);

      expect(queryBuilder.where).toHaveBeenCalledWith('reservas.userId = :userId', { userId: 5 });
      expect(result).toEqual(mockReservas);
    });

    it('debe aplicar filtros correctamente', async () => {
      const adminUser = { id: 1, rol: 'admin' };

      queryBuilder.getMany.mockResolvedValue([]);

      await service.findAll(adminUser as User, 'confirmada', '2024-12-25');

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('reservas.estado = :estado', { estado: 'confirmada' });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('reservas.fechaReserva = :fecha', { fecha: '2024-12-25' });
    });
  });

  describe('getMisReservas', () => {
    it('debe retornar las reservas del usuario autenticado', async () => {
      const user = { id: 5, rol: 'cliente' };
      const mockReservas = [
        {
          id: 1,
          userId: 5,
          fechaReserva: '2024-12-25',
          hora: '19:30',
          numPersonas: 4,
          estado: 'confirmada',
          user: { id: 5, nombre: 'María García' },
        },
      ];

      queryBuilder.getMany.mockResolvedValue(mockReservas);

      const result = await service.getMisReservas(user as User);

      expect(queryBuilder.where).toHaveBeenCalledWith('reservas.userId = :userId', { userId: 5 });
      expect(result).toEqual(mockReservas);
    });

    it('debe aplicar filtro de estado', async () => {
      const user = { id: 5, rol: 'cliente' };

      queryBuilder.getMany.mockResolvedValue([]);

      await service.getMisReservas(user as User, 'confirmada');

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('reservas.estado = :estado', { estado: 'confirmada' });
    });
  });

  describe('getEstadisticas', () => {
    it('debe retornar estadísticas del sistema para admin', async () => {
      const adminUser = { id: 1, rol: 'admin' };
      const mockStats = {
        totalReservas: '150',
        reservasPendientes: '25',
        reservasConfirmadas: '98',
        reservasCanceladas: '27',
        reservasHoy: '8',
        reservasFuturas: '45',
        promedioPersonas: '3.2000',
      };

      queryBuilder.getRawOne.mockResolvedValue(mockStats);

      const result = await service.getEstadisticas(adminUser as User);

      expect(result).toEqual({
        totalReservas: 150,
        reservasPendientes: 25,
        reservasConfirmadas: 98,
        reservasCanceladas: 27,
        reservasHoy: 8,
        reservasFuturas: 45,
        promedioPersonasPorReserva: 3.2,
      });
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const clientUser = { id: 5, rol: 'cliente' };

      await expect(service.getEstadisticas(clientUser as User)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findOne', () => {
    it('debe retornar una reserva específica para admin', async () => {
      const adminUser = { id: 1, rol: 'admin' };
      const mockReserva = {
        id: 1,
        userId: 5,
        fechaReserva: '2024-12-25',
        hora: '19:30',
        numPersonas: 4,
        estado: 'confirmada',
        user: { id: 5, nombre: 'María García' },
      };

      reservasRepository.findOne.mockResolvedValue(mockReserva as Reservas);

      const result = await service.findOne(1, adminUser as User);

      expect(reservasRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user'],
        select: expect.any(Object),
      });
      expect(result).toEqual(mockReserva);
    });

    it('debe permitir al usuario ver su propia reserva', async () => {
      const clientUser = { id: 5, rol: 'cliente' };
      const mockReserva = {
        id: 1,
        userId: 5,
        fechaReserva: '2024-12-25',
        hora: '19:30',
        numPersonas: 4,
        estado: 'confirmada',
      };

      reservasRepository.findOne.mockResolvedValue(mockReserva as Reservas);

      const result = await service.findOne(1, clientUser as User);

      expect(result).toEqual(mockReserva);
    });

    it('debe lanzar ForbiddenException si cliente trata de ver reserva ajena', async () => {
      const clientUser = { id: 5, rol: 'cliente' };
      const mockReserva = {
        id: 1,
        userId: 8, // Diferente usuario
        fechaReserva: '2024-12-25',
        hora: '19:30',
        numPersonas: 4,
        estado: 'confirmada',
      };

      reservasRepository.findOne.mockResolvedValue(mockReserva as Reservas);

      await expect(service.findOne(1, clientUser as User)).rejects.toThrow(ForbiddenException);
    });

    it('debe lanzar NotFoundException si la reserva no existe', async () => {
      const adminUser = { id: 1, rol: 'admin' };

      reservasRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999, adminUser as User)).rejects.toThrow(NotFoundException);
    });
  });

  describe('cambiarEstado', () => {
    it('debe cambiar el estado de una reserva exitosamente', async () => {
      const cambiarEstadoDto: CambiarEstadoReservaDto = {
        estado: 'confirmada',
        motivo: 'Mesa confirmada',
      };

      const adminUser = { id: 1, rol: 'admin' };
      const existingReserva = {
        id: 1,
        userId: 5,
        fechaReserva: '2024-12-25',
        hora: '19:30',
        numPersonas: 4,
        estado: 'pendiente',
      };

      const updatedReserva = { ...existingReserva, estado: 'confirmada' };

      reservasRepository.findOne.mockResolvedValue(existingReserva as Reservas);
      reservasRepository.save.mockResolvedValue(updatedReserva as Reservas);

      const result = await service.cambiarEstado(1, cambiarEstadoDto, adminUser as User);

      expect(reservasRepository.save).toHaveBeenCalledWith({
        ...existingReserva,
        estado: 'confirmada',
      });
      expect(result).toEqual(updatedReserva);
    });

    it('debe lanzar ForbiddenException si cliente trata de confirmar', async () => {
      const cambiarEstadoDto: CambiarEstadoReservaDto = {
        estado: 'confirmada',
      };

      const clientUser = { id: 5, rol: 'cliente' };
      const existingReserva = {
        id: 1,
        userId: 5,
        estado: 'pendiente',
      };

      reservasRepository.findOne.mockResolvedValue(existingReserva as Reservas);

      await expect(service.cambiarEstado(1, cambiarEstadoDto, clientUser as User)).rejects.toThrow(ForbiddenException);
    });

    it('debe lanzar BadRequestException si trata de cambiar reserva cancelada', async () => {
      const cambiarEstadoDto: CambiarEstadoReservaDto = {
        estado: 'confirmada',
      };

      const adminUser = { id: 1, rol: 'admin' };
      const existingReserva = {
        id: 1,
        userId: 5,
        estado: 'cancelada',
      };

      reservasRepository.findOne.mockResolvedValue(existingReserva as Reservas);

      await expect(service.cambiarEstado(1, cambiarEstadoDto, adminUser as User)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('debe actualizar una reserva exitosamente', async () => {
      const updateDto: UpdateReservasDto = {
        fechaReserva: '2024-12-30',
        hora: '20:00',
        numPersonas: 6,
      };

      const clientUser = { id: 5, rol: 'cliente' };
      const existingReserva = {
        id: 1,
        userId: 5,
        fechaReserva: '2024-12-25',
        hora: '19:30',
        numPersonas: 4,
        estado: 'pendiente',
      };

      const updatedReserva = { ...existingReserva, ...updateDto };

      // Mock future date (more than 24 hours before reservation)
      jest.spyOn(Date, 'now').mockImplementation(() => new Date('2024-12-23T10:00:00Z').getTime());

      reservasRepository.findOne.mockResolvedValue(existingReserva as Reservas);
      queryBuilder.getMany.mockResolvedValue([]); // No conflicts
      reservasRepository.save.mockResolvedValue(updatedReserva as Reservas);

      const result = await service.update(1, updateDto, clientUser as User);

      expect(Object.assign).toHaveBeenCalledWith(existingReserva, updateDto);
      expect(result).toEqual(updatedReserva);
    });

    it('debe lanzar BadRequestException si trata de actualizar reserva cancelada', async () => {
      const updateDto: UpdateReservasDto = {
        numPersonas: 6,
      };

      const clientUser = { id: 5, rol: 'cliente' };
      const existingReserva = {
        id: 1,
        userId: 5,
        estado: 'cancelada',
      };

      reservasRepository.findOne.mockResolvedValue(existingReserva as Reservas);

      await expect(service.update(1, updateDto, clientUser as User)).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar ForbiddenException si cliente trata de cambiar userId', async () => {
      const updateDto: UpdateReservasDto = {
        userId: 8,
      };

      const clientUser = { id: 5, rol: 'cliente' };
      const existingReserva = {
        id: 1,
        userId: 5,
        fechaReserva: '2024-12-25',
        hora: '19:30',
        estado: 'pendiente',
      };

      // Mock future date (more than 24 hours before reservation)
      jest.spyOn(Date, 'now').mockImplementation(() => new Date('2024-12-23T10:00:00Z').getTime());

      reservasRepository.findOne.mockResolvedValue(existingReserva as Reservas);

      await expect(service.update(1, updateDto, clientUser as User)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('debe cancelar una reserva exitosamente', async () => {
      const clientUser = { id: 5, rol: 'cliente' };
      const existingReserva = {
        id: 1,
        userId: 5,
        fechaReserva: '2024-12-25',
        hora: '19:30',
        estado: 'pendiente',
      };

      const cancelledReserva = { ...existingReserva, estado: 'cancelada' };

      // Mock future date (more than 24 hours before reservation)
      jest.spyOn(Date, 'now').mockImplementation(() => new Date('2024-12-23T10:00:00Z').getTime());

      reservasRepository.findOne.mockResolvedValue(existingReserva as Reservas);
      reservasRepository.save.mockResolvedValue(cancelledReserva as Reservas);

      await service.remove(1, clientUser as User);

      expect(reservasRepository.save).toHaveBeenCalledWith({
        ...existingReserva,
        estado: 'cancelada',
      });
    });

    it('debe lanzar BadRequestException si la reserva ya está cancelada', async () => {
      const clientUser = { id: 5, rol: 'cliente' };
      const existingReserva = {
        id: 1,
        userId: 5,
        estado: 'cancelada',
      };

      reservasRepository.findOne.mockResolvedValue(existingReserva as Reservas);

      await expect(service.remove(1, clientUser as User)).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si trata de cancelar reserva pasada', async () => {
      const clientUser = { id: 5, rol: 'cliente' };
      const existingReserva = {
        id: 1,
        userId: 5,
        fechaReserva: '2024-01-01', // Fecha pasada
        hora: '19:30',
        estado: 'confirmada',
      };

      reservasRepository.findOne.mockResolvedValue(existingReserva as Reservas);

      await expect(service.remove(1, clientUser as User)).rejects.toThrow(BadRequestException);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});