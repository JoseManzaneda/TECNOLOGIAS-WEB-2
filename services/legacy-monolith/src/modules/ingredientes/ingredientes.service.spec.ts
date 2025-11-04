import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { IngredientesService } from './ingredientes.service';
import { Ingrediente } from './entities/ingrediente.entity';
import { CreateIngredienteDto } from './dto/create-ingrediente.dto';
import { UpdateIngredienteDto } from './dto/update-ingrediente.dto';

describe('IngredientesService', () => {
  let service: IngredientesService;
  let repository: jest.Mocked<Repository<Ingrediente>>;

  beforeEach(async () => {
    const repositoryMock = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngredientesService,
        {
          provide: getRepositoryToken(Ingrediente),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<IngredientesService>(IngredientesService);
    repository = module.get(getRepositoryToken(Ingrediente));

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear un ingrediente exitosamente', async () => {
      const createDto: CreateIngredienteDto = {
        nombre: 'Café molido',
        unidad: 'gramos',
      };

      const currentUser = { id: 1, rol: 'admin' };

      const ingredienteCreado = {
        id: 1,
        nombre: 'Café molido',
        unidad: 'gramos',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      } as Ingrediente;

      repository.findOne.mockResolvedValue(null); // No existe ingrediente con ese nombre
      repository.create.mockReturnValue(ingredienteCreado);
      repository.save.mockResolvedValue(ingredienteCreado);

      const result = await service.create(createDto, currentUser);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { nombre: 'Café molido' }
      });
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(ingredienteCreado);
      expect(result).toEqual(ingredienteCreado);
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const createDto: CreateIngredienteDto = {
        nombre: 'Café molido',
        unidad: 'gramos',
      };

      const currentUser = { id: 1, rol: 'cliente' };

      await expect(service.create(createDto, currentUser)).rejects.toThrow(
        new ForbiddenException('Solo los administradores pueden crear ingredientes')
      );

      expect(repository.findOne).not.toHaveBeenCalled();
    });

    it('debe lanzar ConflictException si el ingrediente ya existe', async () => {
      const createDto: CreateIngredienteDto = {
        nombre: 'Azúcar',
        unidad: 'gramos',
      };

      const currentUser = { id: 1, rol: 'admin' };

      const ingredienteExistente = {
        id: 1,
        nombre: 'Azúcar',
        unidad: 'gramos',
      } as Ingrediente;

      repository.findOne.mockResolvedValue(ingredienteExistente);

      await expect(service.create(createDto, currentUser)).rejects.toThrow(
        new ConflictException('Ya existe un ingrediente con el nombre "Azúcar"')
      );

      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('debe retornar todos los ingredientes ordenados alfabéticamente', async () => {
      const currentUser = { id: 1, rol: 'admin' };

      const ingredientes = [
        {
          id: 1,
          nombre: 'Azúcar',
          unidad: 'gramos',
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        },
        {
          id: 2,
          nombre: 'Café molido',
          unidad: 'gramos',
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        },
      ] as Ingrediente[];

      repository.find.mockResolvedValue(ingredientes);

      const result = await service.findAll(currentUser);

      expect(repository.find).toHaveBeenCalledWith({
        order: { nombre: 'ASC' }
      });
      expect(result).toEqual(ingredientes);
    });
  });

  describe('findOne', () => {
    it('debe retornar un ingrediente por ID', async () => {
      const currentUser = { id: 1, rol: 'admin' };

      const ingrediente = {
        id: 1,
        nombre: 'Azúcar',
        unidad: 'gramos',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      } as Ingrediente;

      repository.findOne.mockResolvedValue(ingrediente);

      const result = await service.findOne(1, currentUser);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(ingrediente);
    });

    it('debe lanzar NotFoundException si el ingrediente no existe', async () => {
      const currentUser = { id: 1, rol: 'admin' };

      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999, currentUser)).rejects.toThrow(
        new NotFoundException('Ingrediente con ID 999 no encontrado')
      );
    });
  });

  describe('findByNombre', () => {
    it('debe buscar ingredientes por nombre parcial', async () => {
      const currentUser = { id: 1, rol: 'cliente' };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findByNombre('café', currentUser);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('ingrediente');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'ingrediente.nombre LIKE :nombre',
        { nombre: '%café%' }
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('ingrediente.nombre', 'ASC');
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('debe actualizar un ingrediente exitosamente', async () => {
      const updateDto: UpdateIngredienteDto = {
        nombre: 'Azúcar refinada',
        unidad: 'kilogramos',
      };

      const currentUser = { id: 1, rol: 'admin' };

      const ingredienteExistente = {
        id: 1,
        nombre: 'Azúcar',
        unidad: 'gramos',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      } as Ingrediente;

      const ingredienteActualizado = {
        ...ingredienteExistente,
        nombre: 'Azúcar refinada',
        unidad: 'kilogramos',
      } as Ingrediente;

      repository.findOne
        .mockResolvedValueOnce(ingredienteExistente) // Primera llamada para verificar existencia
        .mockResolvedValueOnce(null); // Segunda llamada para verificar nombre único

      repository.save.mockResolvedValue(ingredienteActualizado);

      const result = await service.update(1, updateDto, currentUser);

      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(ingredienteActualizado);
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const updateDto: UpdateIngredienteDto = {
        nombre: 'Azúcar refinada',
      };

      const currentUser = { id: 1, rol: 'cliente' };

      await expect(service.update(1, updateDto, currentUser)).rejects.toThrow(
        new ForbiddenException('Solo los administradores pueden actualizar ingredientes')
      );
    });

    it('debe lanzar NotFoundException si el ingrediente no existe', async () => {
      const updateDto: UpdateIngredienteDto = {
        nombre: 'Azúcar refinada',
      };

      const currentUser = { id: 1, rol: 'admin' };

      repository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto, currentUser)).rejects.toThrow(
        new NotFoundException('Ingrediente con ID 999 no encontrado')
      );
    });

    it('debe lanzar ConflictException si el nuevo nombre ya existe', async () => {
      const updateDto: UpdateIngredienteDto = {
        nombre: 'Café molido',
      };

      const currentUser = { id: 1, rol: 'admin' };

      const ingredienteExistente = {
        id: 1,
        nombre: 'Azúcar',
        unidad: 'gramos',
      } as Ingrediente;

      const ingredienteConMismoNombre = {
        id: 2,
        nombre: 'Café molido',
        unidad: 'gramos',
      } as Ingrediente;

      repository.findOne
        .mockResolvedValueOnce(ingredienteExistente) // Primera llamada para verificar existencia
        .mockResolvedValueOnce(ingredienteConMismoNombre); // Segunda llamada para verificar nombre único

      await expect(service.update(1, updateDto, currentUser)).rejects.toThrow(
        new ConflictException('Ya existe un ingrediente con el nombre "Café molido"')
      );
    });
  });

  describe('remove', () => {
    it('debe eliminar un ingrediente exitosamente', async () => {
      const currentUser = { id: 1, rol: 'admin' };

      const ingrediente = {
        id: 1,
        nombre: 'Azúcar',
        unidad: 'gramos',
      } as Ingrediente;

      repository.findOne.mockResolvedValue(ingrediente);
      repository.remove.mockResolvedValue(ingrediente);

      await service.remove(1, currentUser);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.remove).toHaveBeenCalledWith(ingrediente);
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const currentUser = { id: 1, rol: 'cliente' };

      await expect(service.remove(1, currentUser)).rejects.toThrow(
        new ForbiddenException('Solo los administradores pueden eliminar ingredientes')
      );
    });

    it('debe lanzar NotFoundException si el ingrediente no existe', async () => {
      const currentUser = { id: 1, rol: 'admin' };

      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(999, currentUser)).rejects.toThrow(
        new NotFoundException('Ingrediente con ID 999 no encontrado')
      );
    });
  });

  describe('getEstadisticas', () => {
    it('debe retornar estadísticas para admin', async () => {
      const currentUser = { id: 1, rol: 'admin' };

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { unidad: 'gramos', cantidad: '15' },
          { unidad: 'mililitros', cantidad: '7' }
        ]),
        getCount: jest.fn().mockResolvedValue(3),
      };

      repository.count.mockResolvedValue(25); // totalIngredientes
      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.getEstadisticas(currentUser);

      expect(result).toEqual({
        totalIngredientes: 25,
        ingredientesSinUnidad: 3,
        ingredientesPorUnidad: [
          { unidad: 'gramos', cantidad: 15 },
          { unidad: 'mililitros', cantidad: 7 }
        ]
      });
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const currentUser = { id: 1, rol: 'cliente' };

      await expect(service.getEstadisticas(currentUser)).rejects.toThrow(
        new ForbiddenException('Solo los administradores pueden ver las estadísticas')
      );
    });
  });
});