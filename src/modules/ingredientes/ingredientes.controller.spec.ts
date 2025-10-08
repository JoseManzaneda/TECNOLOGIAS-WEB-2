import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { IngredientesController } from './ingredientes.controller';
import { IngredientesService } from './ingredientes.service';
import { CreateIngredienteDto } from './dto/create-ingrediente.dto';
import { UpdateIngredienteDto } from './dto/update-ingrediente.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

describe('IngredientesController', () => {
  let controller: IngredientesController;
  let service: jest.Mocked<IngredientesService>;

  beforeEach(async () => {
    const serviceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByNombre: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getEstadisticas: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngredientesController],
      providers: [
        {
          provide: IngredientesService,
          useValue: serviceMock,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<IngredientesController>(IngredientesController);
    service = module.get(IngredientesService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear un ingrediente exitosamente', async () => {
      const createDto: CreateIngredienteDto = {
        nombre: 'Café molido',
        unidad: 'gramos',
      };

      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      const expectedResult = {
        id: 1,
        nombre: 'Café molido',
        unidad: 'gramos',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };

      service.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto, mockRequest);

      expect(service.create).toHaveBeenCalledWith(createDto, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar ConflictException si el ingrediente ya existe', async () => {
      const createDto: CreateIngredienteDto = {
        nombre: 'Azúcar',
        unidad: 'gramos',
      };

      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      service.create.mockRejectedValue(
        new ConflictException('Ya existe un ingrediente con el nombre "Azúcar"')
      );

      await expect(controller.create(createDto, mockRequest)).rejects.toThrow(
        ConflictException
      );
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const createDto: CreateIngredienteDto = {
        nombre: 'Café molido',
        unidad: 'gramos',
      };

      const mockRequest = {
        user: { id: 1, rol: 'cliente' }
      };

      service.create.mockRejectedValue(
        new ForbiddenException('Solo los administradores pueden crear ingredientes')
      );

      await expect(controller.create(createDto, mockRequest)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('findAll', () => {
    it('debe retornar todos los ingredientes ordenados alfabéticamente', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      const expectedResult = [
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
      ];

      service.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(mockRequest);

      expect(service.findAll).toHaveBeenCalledWith(mockRequest.user);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getEstadisticas', () => {
    it('debe retornar estadísticas para admin', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      const expectedResult = {
        totalIngredientes: 25,
        ingredientesSinUnidad: 3,
        ingredientesPorUnidad: [
          { unidad: 'gramos', cantidad: 15 },
          { unidad: 'mililitros', cantidad: 7 },
        ],
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

      await expect(controller.getEstadisticas(mockRequest)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('findByNombre', () => {
    it('debe retornar ingredientes que coincidan con la búsqueda', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'cliente' }
      };

      const expectedResult = [
        {
          id: 2,
          nombre: 'Café molido',
          unidad: 'gramos',
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        },
        {
          id: 8,
          nombre: 'Café en grano',
          unidad: 'gramos',
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        },
      ];

      service.findByNombre.mockResolvedValue(expectedResult);

      const result = await controller.findByNombre('café', mockRequest);

      expect(service.findByNombre).toHaveBeenCalledWith('café', mockRequest.user);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('debe retornar un ingrediente por ID', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'cliente' }
      };

      const expectedResult = {
        id: 1,
        nombre: 'Azúcar',
        unidad: 'gramos',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };

      service.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(1, mockRequest);

      expect(service.findOne).toHaveBeenCalledWith(1, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar NotFoundException si el ingrediente no existe', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      service.findOne.mockRejectedValue(
        new NotFoundException('Ingrediente con ID 999 no encontrado')
      );

      await expect(controller.findOne(999, mockRequest)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('update', () => {
    it('debe actualizar un ingrediente exitosamente', async () => {
      const updateDto: UpdateIngredienteDto = {
        nombre: 'Azúcar refinada',
        unidad: 'kilogramos',
      };

      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      const expectedResult = {
        id: 1,
        nombre: 'Azúcar refinada',
        unidad: 'kilogramos',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };

      service.update.mockResolvedValue(expectedResult);

      const result = await controller.update(1, updateDto, mockRequest);

      expect(service.update).toHaveBeenCalledWith(1, updateDto, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const updateDto: UpdateIngredienteDto = {
        nombre: 'Azúcar refinada',
      };

      const mockRequest = {
        user: { id: 1, rol: 'cliente' }
      };

      service.update.mockRejectedValue(
        new ForbiddenException('Solo los administradores pueden actualizar ingredientes')
      );

      await expect(controller.update(1, updateDto, mockRequest)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('debe lanzar ConflictException si el nuevo nombre ya existe', async () => {
      const updateDto: UpdateIngredienteDto = {
        nombre: 'Café molido',
      };

      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      service.update.mockRejectedValue(
        new ConflictException('Ya existe un ingrediente con el nombre "Café molido"')
      );

      await expect(controller.update(1, updateDto, mockRequest)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('remove', () => {
    it('debe eliminar un ingrediente exitosamente', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1, mockRequest);

      expect(service.remove).toHaveBeenCalledWith(1, mockRequest.user);
      expect(result).toEqual({ message: 'Ingrediente eliminado exitosamente' });
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'cliente' }
      };

      service.remove.mockRejectedValue(
        new ForbiddenException('Solo los administradores pueden eliminar ingredientes')
      );

      await expect(controller.remove(1, mockRequest)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('debe lanzar NotFoundException si el ingrediente no existe', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      service.remove.mockRejectedValue(
        new NotFoundException('Ingrediente con ID 999 no encontrado')
      );

      await expect(controller.remove(999, mockRequest)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});