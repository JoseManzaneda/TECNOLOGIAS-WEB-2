import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PuntosService } from './puntos.service';
import { Puntos } from './entities/puntos.entity';
import { User } from '../users/entities/user.entity';
import { CreatePuntosDto } from './dto/create-puntos.dto';
import { UpdatePuntosDto } from './dto/update-puntos.dto';
import { AgregarPuntosDto } from './dto/agregar-puntos.dto';
import { CanjearPuntosDto } from './dto/canjear-puntos.dto';

describe('PuntosService', () => {
  let service: PuntosService;
  let puntosRepository: jest.Mocked<Repository<Puntos>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let queryBuilder: any;

  beforeEach(async () => {
    queryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
    } as any;

    const repositoryMock = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        ...queryBuilder,
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
      }),
    };

    const userRepositoryMock = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PuntosService,
        {
          provide: getRepositoryToken(Puntos),
          useValue: repositoryMock,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<PuntosService>(PuntosService);
    puntosRepository = module.get(getRepositoryToken(Puntos));
    userRepository = module.get(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear un registro de puntos exitosamente', async () => {
      const createDto: CreatePuntosDto = {
        userId: 5,
        puntosAcumulados: 150,
      };

      const adminUser = { id: 1, rol: 'admin' };
      const targetUser = { id: 5, nombre: 'María García', rol: 'cliente' };
      const newPuntos = { 
        id: 1, 
        userId: 5, 
        puntosAcumulados: 150,
        ultimaActualizacion: new Date(),
      };

      userRepository.findOne.mockResolvedValueOnce(targetUser as User);
      puntosRepository.findOne.mockResolvedValueOnce(null);
      puntosRepository.create.mockReturnValue(newPuntos as Puntos);
      puntosRepository.save.mockResolvedValue(newPuntos as Puntos);

      const result = await service.create(createDto, adminUser as User);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 5 },
      });
      expect(puntosRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 5 },
      });
      expect(puntosRepository.create).toHaveBeenCalledWith({
        userId: 5,
        puntosAcumulados: 150,
        ultimaActualizacion: expect.any(Date),
      });
      expect(result).toEqual(newPuntos);
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const createDto: CreatePuntosDto = {
        userId: 5,
        puntosAcumulados: 150,
      };
      const clientUser = { id: 2, rol: 'cliente' };

      await expect(service.create(createDto, clientUser as User)).rejects.toThrow(ForbiddenException);
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      const createDto: CreatePuntosDto = {
        userId: 999,
        puntosAcumulados: 150,
      };
      const adminUser = { id: 1, rol: 'admin' };

      userRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, adminUser as User)).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar ConflictException si el usuario ya tiene puntos', async () => {
      const createDto: CreatePuntosDto = {
        userId: 5,
        puntosAcumulados: 150,
      };
      const adminUser = { id: 1, rol: 'admin' };
      const targetUser = { id: 5, nombre: 'María García', rol: 'cliente' };
      const existingPuntos = { id: 1, userId: 5, puntosAcumulados: 100 };

      userRepository.findOne.mockResolvedValue(targetUser as User);
      puntosRepository.findOne.mockResolvedValue(existingPuntos as Puntos);

      await expect(service.create(createDto, adminUser as User)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('debe retornar todos los registros para admin', async () => {
      const adminUser = { id: 1, rol: 'admin' };
      const mockPuntos = [
        {
          id: 1,
          userId: 5,
          puntosAcumulados: 1250,
          user: { id: 5, nombre: 'María García' },
        },
      ];

      const queryBuilderInstance = puntosRepository.createQueryBuilder();
      queryBuilderInstance.getMany = jest.fn().mockResolvedValue(mockPuntos);

      const result = await service.findAll(adminUser as User);

      expect(puntosRepository.createQueryBuilder).toHaveBeenCalledWith('puntos');
      expect(result).toEqual(mockPuntos);
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const clientUser = { id: 2, rol: 'cliente' };

      await expect(service.findAll(clientUser as User)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getMisPuntos', () => {
    it('debe retornar los puntos del usuario autenticado', async () => {
      const user = { id: 5, rol: 'cliente' };
      const mockPuntos = {
        id: 1,
        userId: 5,
        puntosAcumulados: 750,
        user: { id: 5, nombre: 'María García' },
      };

      puntosRepository.findOne.mockResolvedValue(mockPuntos as Puntos);

      const result = await service.getMisPuntos(user as User);

      expect(puntosRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 5 },
        relations: ['user'],
        select: {
          id: true,
          userId: true,
          puntosAcumulados: true,
          ultimaActualizacion: true,
          fechaCreacion: true,
          fechaActualizacion: true,
          user: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          },
        },
      });
      expect(result).toEqual(mockPuntos);
    });

    it('debe crear un registro inicial si el usuario no tiene puntos', async () => {
      const user = { id: 5, rol: 'cliente' };
      const newPuntos = {
        id: 1,
        userId: 5,
        puntosAcumulados: 0,
        ultimaActualizacion: new Date(),
      };

      puntosRepository.findOne.mockResolvedValueOnce(null);
      puntosRepository.create.mockReturnValue(newPuntos as Puntos);
      puntosRepository.save.mockResolvedValueOnce(newPuntos as Puntos);
      puntosRepository.findOne.mockResolvedValueOnce(newPuntos as Puntos);

      const result = await service.getMisPuntos(user as User);

      expect(puntosRepository.create).toHaveBeenCalledWith({
        userId: 5,
        puntosAcumulados: 0,
        ultimaActualizacion: expect.any(Date),
      });
      expect(result).toEqual(newPuntos);
    });
  });

  describe('getRanking', () => {
    it('debe retornar el ranking de usuarios para admin', async () => {
      const adminUser = { id: 1, rol: 'admin' };
      const mockRanking = [
        {
          id: 1,
          userId: 5,
          puntosAcumulados: 2500,
          user: { id: 5, nombre: 'María García' },
        },
      ];

      puntosRepository.find.mockResolvedValue(mockRanking as Puntos[]);

      const result = await service.getRanking(adminUser as User, 5);

      expect(puntosRepository.find).toHaveBeenCalledWith({
        relations: ['user'],
        select: {
          id: true,
          userId: true,
          puntosAcumulados: true,
          ultimaActualizacion: true,
          user: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        order: { puntosAcumulados: 'DESC' },
        take: 5,
      });
      expect(result).toEqual(mockRanking);
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const clientUser = { id: 2, rol: 'cliente' };

      await expect(service.getRanking(clientUser as User, 10)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getEstadisticas', () => {
    it('debe retornar estadísticas del sistema para admin', async () => {
      const adminUser = { id: 1, rol: 'admin' };
      const mockStats = {
        totalUsuarios: '45',
        usuariosActivos: '38',
        usuariosPremium: '12',
        totalPuntos: '15750',
        promedioPuntos: '350.0000',
        maxPuntos: '2500',
        minPuntos: '0',
      };

      queryBuilder.getRawOne.mockResolvedValue(mockStats);

      const result = await service.getEstadisticas(adminUser as User);

      expect(queryBuilder.select).toHaveBeenCalledWith('COUNT(p.id)', 'totalUsuarios');
      expect(result).toEqual({
        totalUsuariosConPuntos: 45,
        usuariosActivos: 38,
        usuariosPremium: 12,
        totalPuntosEnCirculacion: 15750,
        promedioPuntosPorUsuario: 350.0,
        maximoPuntos: 2500,
        minimoPuntos: 0,
      });
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const clientUser = { id: 2, rol: 'cliente' };

      await expect(service.getEstadisticas(clientUser as User)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('agregarPuntos', () => {
    it('debe agregar puntos a un usuario exitosamente', async () => {
      const agregarDto: AgregarPuntosDto = {
        puntos: 100,
        descripcion: 'Bonificación por cumpleaños',
      };
      const adminUser = { id: 1, rol: 'admin' };
      const existingPuntos = {
        id: 1,
        userId: 5,
        puntosAcumulados: 1250,
        ultimaActualizacion: new Date(),
      };
      const updatedPuntos = { ...existingPuntos, puntosAcumulados: 1350 };

      puntosRepository.findOne.mockResolvedValue(existingPuntos as Puntos);
      puntosRepository.save.mockResolvedValue(updatedPuntos as Puntos);

      const result = await service.agregarPuntos(5, agregarDto, adminUser as User);

      expect(puntosRepository.save).toHaveBeenCalledWith({
        ...existingPuntos,
        puntosAcumulados: 1350,
        ultimaActualizacion: expect.any(Date),
      });
      expect(result).toEqual(updatedPuntos);
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const agregarDto: AgregarPuntosDto = {
        puntos: 100,
        descripcion: 'Bonificación',
      };
      const clientUser = { id: 2, rol: 'cliente' };

      await expect(service.agregarPuntos(5, agregarDto, clientUser as User)).rejects.toThrow(ForbiddenException);
    });

    it('debe crear registro si el usuario no tiene puntos', async () => {
      const agregarDto: AgregarPuntosDto = {
        puntos: 100,
        descripcion: 'Bonificación inicial',
      };
      const adminUser = { id: 1, rol: 'admin' };
      const targetUser = { id: 5, nombre: 'María García', rol: 'cliente' };
      const newPuntos = {
        id: 1,
        userId: 5,
        puntosAcumulados: 100,
        ultimaActualizacion: new Date(),
      };

      userRepository.findOne.mockResolvedValue(targetUser as User);
      puntosRepository.findOne.mockResolvedValue(null);
      puntosRepository.create.mockReturnValue(newPuntos as Puntos);
      puntosRepository.save.mockResolvedValue(newPuntos as Puntos);

      const result = await service.agregarPuntos(5, agregarDto, adminUser as User);

      expect(puntosRepository.create).toHaveBeenCalledWith({
        userId: 5,
        puntosAcumulados: 100,
        ultimaActualizacion: expect.any(Date),
      });
      expect(result).toEqual(newPuntos);
    });
  });

  describe('canjearPuntos', () => {
    it('debe canjear puntos exitosamente', async () => {
      const canjearDto: CanjearPuntosDto = {
        puntos: 500,
        descripcion: 'Descuento 10% en próxima compra',
      };
      const user = { id: 5, rol: 'cliente' };
      const existingPuntos = {
        id: 1,
        userId: 5,
        puntosAcumulados: 1350,
        ultimaActualizacion: new Date(),
      };
      const updatedPuntos = { ...existingPuntos, puntosAcumulados: 850 };

      puntosRepository.findOne.mockResolvedValue(existingPuntos as Puntos);
      puntosRepository.save.mockResolvedValue(updatedPuntos as Puntos);

      const result = await service.canjearPuntos(5, canjearDto, user as User);

      expect(puntosRepository.save).toHaveBeenCalledWith({
        ...existingPuntos,
        puntosAcumulados: 850,
        ultimaActualizacion: expect.any(Date),
      });
      expect(result).toEqual(updatedPuntos);
    });

    it('debe lanzar NotFoundException si el usuario no tiene puntos', async () => {
      const canjearDto: CanjearPuntosDto = {
        puntos: 500,
        descripcion: 'Descuento',
      };
      const user = { id: 5, rol: 'cliente' };

      puntosRepository.findOne.mockResolvedValue(null);

      await expect(service.canjearPuntos(5, canjearDto, user as User)).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar BadRequestException si no tiene suficientes puntos', async () => {
      const canjearDto: CanjearPuntosDto = {
        puntos: 500,
        descripcion: 'Descuento',
      };
      const user = { id: 5, rol: 'cliente' };
      const existingPuntos = {
        id: 1,
        userId: 5,
        puntosAcumulados: 300,
        ultimaActualizacion: new Date(),
      };

      puntosRepository.findOne.mockResolvedValue(existingPuntos as Puntos);

      await expect(service.canjearPuntos(5, canjearDto, user as User)).rejects.toThrow(BadRequestException);
    });

    it('debe permitir al admin canjear puntos para otros usuarios', async () => {
      const canjearDto: CanjearPuntosDto = {
        puntos: 500,
        descripcion: 'Descuento administrativo',
      };
      const adminUser = { id: 1, rol: 'admin' };
      const existingPuntos = {
        id: 1,
        userId: 8,
        puntosAcumulados: 1000,
        ultimaActualizacion: new Date(),
      };
      const updatedPuntos = { ...existingPuntos, puntosAcumulados: 500 };

      puntosRepository.findOne.mockResolvedValue(existingPuntos as Puntos);
      puntosRepository.save.mockResolvedValue(updatedPuntos as Puntos);

      const result = await service.canjearPuntos(8, canjearDto, adminUser as User);

      expect(result).toEqual(updatedPuntos);
    });

    it('debe lanzar ForbiddenException si un cliente trata de canjear puntos de otro usuario', async () => {
      const canjearDto: CanjearPuntosDto = {
        puntos: 500,
        descripcion: 'Descuento',
      };
      const user = { id: 5, rol: 'cliente' };

      await expect(service.canjearPuntos(8, canjearDto, user as User)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findByUserId', () => {
    it('debe retornar puntos de un usuario específico para admin', async () => {
      const adminUser = { id: 1, rol: 'admin' };
      const mockPuntos = {
        id: 1,
        userId: 5,
        puntosAcumulados: 1250,
        user: { id: 5, nombre: 'María García' },
      };

      puntosRepository.findOne.mockResolvedValue(mockPuntos as Puntos);

      const result = await service.findByUserId(5, adminUser as User);

      expect(puntosRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 5 },
        relations: ['user'],
        select: {
          id: true,
          userId: true,
          puntosAcumulados: true,
          ultimaActualizacion: true,
          fechaCreacion: true,
          fechaActualizacion: true,
          user: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          },
        },
      });
      expect(result).toEqual(mockPuntos);
    });

    it('debe lanzar NotFoundException si el usuario no tiene puntos', async () => {
      const adminUser = { id: 1, rol: 'admin' };

      puntosRepository.findOne.mockResolvedValue(null);

      await expect(service.findByUserId(999, adminUser as User)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('debe retornar un registro específico para admin', async () => {
      const adminUser = { id: 1, rol: 'admin' };
      const mockPuntos = {
        id: 1,
        userId: 5,
        puntosAcumulados: 1250,
        user: { id: 5, nombre: 'María García' },
      };

      puntosRepository.findOne.mockResolvedValue(mockPuntos as Puntos);

      const result = await service.findOne(1, adminUser as User);

      expect(result).toEqual(mockPuntos);
    });

    it('debe lanzar NotFoundException si el registro no existe', async () => {
      const adminUser = { id: 1, rol: 'admin' };

      puntosRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999, adminUser as User)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar un registro exitosamente', async () => {
      const updateDto: UpdatePuntosDto = {
        puntosAcumulados: 2000,
      };
      const adminUser = { id: 1, rol: 'admin' };
      const existingPuntos = {
        id: 1,
        userId: 5,
        puntosAcumulados: 1250,
        ultimaActualizacion: new Date(),
      };
      const updatedPuntos = { ...existingPuntos, ...updateDto };

      puntosRepository.findOne.mockResolvedValue(existingPuntos as Puntos);
      puntosRepository.save.mockResolvedValue(updatedPuntos as Puntos);

      const result = await service.update(1, updateDto, adminUser as User);

      expect(puntosRepository.save).toHaveBeenCalledWith({
        ...existingPuntos,
        ...updateDto,
        ultimaActualizacion: expect.any(Date),
      });
      expect(result).toEqual(updatedPuntos);
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const updateDto: UpdatePuntosDto = {
        puntosAcumulados: 2000,
      };
      const clientUser = { id: 2, rol: 'cliente' };

      await expect(service.update(1, updateDto, clientUser as User)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('debe eliminar un registro exitosamente', async () => {
      const adminUser = { id: 1, rol: 'admin' };
      const existingPuntos = {
        id: 1,
        userId: 5,
        puntosAcumulados: 1250,
      };

      puntosRepository.findOne.mockResolvedValue(existingPuntos as Puntos);
      puntosRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.remove(1, adminUser as User);

      expect(puntosRepository.delete).toHaveBeenCalledWith(1);
    });

    it('debe lanzar NotFoundException si el registro no existe', async () => {
      const adminUser = { id: 1, rol: 'admin' };

      puntosRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999, adminUser as User)).rejects.toThrow(NotFoundException);
    });
  });

  describe('calculatePuntosPorCompra', () => {
    it('debe calcular puntos basado en el monto de compra', () => {
      expect(service.calculatePuntosPorCompra(100)).toBe(100);  // 1 punto por $1
      expect(service.calculatePuntosPorCompra(250)).toBe(250);
      expect(service.calculatePuntosPorCompra(0)).toBe(0);
      expect(service.calculatePuntosPorCompra(600)).toBe(500);  // Máximo 500 puntos
    });
  });

  describe('procesarPuntosPorCompra', () => {
    it('debe procesar puntos por compra exitosamente', async () => {
      const montoCompra = 150;
      const userId = 5;
      const puntosEsperados = 150;
      
      const existingPuntos = {
        id: 1,
        userId: 5,
        puntosAcumulados: 1000,
        ultimaActualizacion: new Date(),
      };
      const updatedPuntos = { ...existingPuntos, puntosAcumulados: 1150 };

      puntosRepository.findOne.mockResolvedValue(existingPuntos as Puntos);
      puntosRepository.save.mockResolvedValue(updatedPuntos as Puntos);

      const result = await service.procesarPuntosPorCompra(userId, montoCompra);

      expect(puntosRepository.save).toHaveBeenCalledWith({
        ...existingPuntos,
        puntosAcumulados: 1150,
        ultimaActualizacion: expect.any(Date),
      });
      expect(result).toEqual(updatedPuntos);
    });

    it('debe lanzar BadRequestException si el monto no genera puntos', async () => {
      await expect(service.procesarPuntosPorCompra(5, 0)).rejects.toThrow(BadRequestException);
    });
  });
});