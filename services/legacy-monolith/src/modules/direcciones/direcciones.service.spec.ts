import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DireccionesService } from './direcciones.service';
import { Direccion } from './entities/direccion.entity';
import { CreateDireccionDto } from './dto/create-direccion.dto';
import { UpdateDireccionDto } from './dto/update-direccion.dto';

describe('DireccionesService', () => {
  let service: DireccionesService;
  let repository: jest.Mocked<Repository<Direccion>>;

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
        DireccionesService,
        {
          provide: getRepositoryToken(Direccion),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<DireccionesService>(DireccionesService);
    repository = module.get(getRepositoryToken(Direccion));

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear una dirección exitosamente', async () => {
      const createDireccionDto: CreateDireccionDto = {
        direccion: 'Av. Siempre Viva 123, Col. Centro',
        ciudad: 'Ciudad de México',
        referencia: 'Entre calle A y calle B, casa azul',
      };

      const userId = 1;
      const createdDireccion = {
        id: 1,
        direccion: createDireccionDto.direccion,
        ciudad: createDireccionDto.ciudad,
        referencia: createDireccionDto.referencia,
        userId,
      } as Direccion;

      repository.create.mockReturnValue(createdDireccion);
      repository.save.mockResolvedValue(createdDireccion);

      const result = await service.create(createDireccionDto, userId);

      expect(repository.create).toHaveBeenCalledWith({
        direccion: createDireccionDto.direccion,
        ciudad: createDireccionDto.ciudad,
        referencia: createDireccionDto.referencia,
        userId,
      });
      expect(repository.save).toHaveBeenCalledWith(createdDireccion);
      expect(result).toEqual(createdDireccion);
    });
  });

  describe('findAll', () => {
    it('debe retornar todas las direcciones para admin', async () => {
      const currentUser = { id: 1, rol: 'admin' };
      const direcciones = [
        {
          id: 1,
          direccion: 'Av. Siempre Viva 123',
          ciudad: 'Ciudad de México',
          userId: 2,
        },
        {
          id: 2,
          direccion: 'Calle Falsa 456',
          ciudad: 'Guadalajara',
          userId: 3,
        },
      ] as Direccion[];

      repository.find.mockResolvedValue(direcciones);

      const result = await service.findAll(currentUser);

      expect(repository.find).toHaveBeenCalledWith({
        relations: ['usuario'],
        select: {
          usuario: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      });
      expect(result).toEqual(direcciones);
    });

    it('debe retornar solo direcciones propias para cliente', async () => {
      const currentUser = { id: 2, rol: 'cliente' };
      const direcciones = [
        {
          id: 1,
          direccion: 'Av. Siempre Viva 123',
          ciudad: 'Ciudad de México',
          userId: 2,
        },
      ] as Direccion[];

      repository.find.mockResolvedValue(direcciones);

      const result = await service.findAll(currentUser);

      expect(repository.find).toHaveBeenCalledWith({
        where: { userId: currentUser.id },
      });
      expect(result).toEqual(direcciones);
    });
  });

  describe('findOne', () => {
    it('debe retornar una dirección por ID para admin', async () => {
      const currentUser = { id: 1, rol: 'admin' };
      const direccion = {
        id: 1,
        direccion: 'Av. Siempre Viva 123',
        ciudad: 'Ciudad de México',
        userId: 2,
      } as Direccion;

      repository.findOne.mockResolvedValue(direccion);

      const result = await service.findOne(1, currentUser);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['usuario'],
        select: {
          usuario: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      });
      expect(result).toEqual(direccion);
    });

    it('debe retornar dirección propia para cliente', async () => {
      const currentUser = { id: 2, rol: 'cliente' };
      const direccion = {
        id: 1,
        direccion: 'Av. Siempre Viva 123',
        ciudad: 'Ciudad de México',
        userId: 2,
      } as Direccion;

      repository.findOne.mockResolvedValue(direccion);

      const result = await service.findOne(1, currentUser);

      expect(result).toEqual(direccion);
    });

    it('debe lanzar NotFoundException si la dirección no existe', async () => {
      const currentUser = { id: 1, rol: 'admin' };
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999, currentUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar ForbiddenException si cliente intenta acceder a dirección ajena', async () => {
      const currentUser = { id: 1, rol: 'cliente' };
      const direccion = {
        id: 1,
        direccion: 'Av. Siempre Viva 123',
        userId: 2,
      } as Direccion;

      repository.findOne.mockResolvedValue(direccion);

      await expect(service.findOne(1, currentUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findByUser', () => {
    it('debe retornar direcciones de un usuario para admin', async () => {
      const currentUser = { id: 1, rol: 'admin' };
      const userId = 2;
      const direcciones = [
        {
          id: 1,
          direccion: 'Av. Siempre Viva 123',
          userId: 2,
        },
      ] as Direccion[];

      repository.find.mockResolvedValue(direcciones);

      const result = await service.findByUser(userId, currentUser);

      expect(repository.find).toHaveBeenCalledWith({
        where: { userId },
        relations: ['usuario'],
        select: {
          usuario: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      });
      expect(result).toEqual(direcciones);
    });

    it('debe lanzar ForbiddenException si cliente intenta acceder a direcciones ajenas', async () => {
      const currentUser = { id: 1, rol: 'cliente' };
      const userId = 2;

      await expect(service.findByUser(userId, currentUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('debe actualizar una dirección exitosamente', async () => {
      const updateDto: UpdateDireccionDto = {
        ciudad: 'Guadalajara',
        referencia: 'Nueva referencia',
      };

      const currentUser = { id: 1, rol: 'cliente' };
      const direccion = {
        id: 1,
        direccion: 'Av. Siempre Viva 123',
        ciudad: 'Ciudad de México',
        referencia: 'Referencia vieja',
        userId: 1,
      } as Direccion;

      const updatedDireccion = { ...direccion, ...updateDto };

      repository.findOne.mockResolvedValue(direccion);
      repository.save.mockResolvedValue(updatedDireccion);

      const result = await service.update(1, updateDto, currentUser);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.save).toHaveBeenCalled();
      expect(result.ciudad).toBe(updateDto.ciudad);
      expect(result.referencia).toBe(updateDto.referencia);
    });

    it('debe lanzar NotFoundException si la dirección no existe', async () => {
      const updateDto: UpdateDireccionDto = { ciudad: 'Guadalajara' };
      const currentUser = { id: 1, rol: 'cliente' };

      repository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto, currentUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar ForbiddenException si cliente intenta actualizar dirección ajena', async () => {
      const updateDto: UpdateDireccionDto = { ciudad: 'Guadalajara' };
      const currentUser = { id: 1, rol: 'cliente' };
      const direccion = {
        id: 1,
        direccion: 'Av. Siempre Viva 123',
        userId: 2,
      } as Direccion;

      repository.findOne.mockResolvedValue(direccion);

      await expect(service.update(1, updateDto, currentUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('debe eliminar una dirección exitosamente', async () => {
      const currentUser = { id: 1, rol: 'admin' };
      const direccion = {
        id: 1,
        direccion: 'Av. Siempre Viva 123',
        userId: 2,
      } as Direccion;

      repository.findOne.mockResolvedValue(direccion);
      repository.remove.mockResolvedValue(direccion);

      await service.remove(1, currentUser);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.remove).toHaveBeenCalledWith(direccion);
    });

    it('debe lanzar NotFoundException si la dirección no existe', async () => {
      const currentUser = { id: 1, rol: 'admin' };
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(999, currentUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar ForbiddenException si cliente intenta eliminar dirección ajena', async () => {
      const currentUser = { id: 1, rol: 'cliente' };
      const direccion = {
        id: 1,
        direccion: 'Av. Siempre Viva 123',
        userId: 2,
      } as Direccion;

      repository.findOne.mockResolvedValue(direccion);

      await expect(service.remove(1, currentUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});