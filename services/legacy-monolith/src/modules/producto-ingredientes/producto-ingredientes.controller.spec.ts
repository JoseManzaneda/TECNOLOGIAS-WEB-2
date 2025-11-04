import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProductoIngredientesController } from './producto-ingredientes.controller';
import { ProductoIngredientesService } from './producto-ingredientes.service';
import { CreateProductoIngredienteDto } from './dto/create-producto-ingrediente.dto';
import { UpdateProductoIngredienteDto } from './dto/update-producto-ingrediente.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

describe('ProductoIngredientesController', () => {
  let controller: ProductoIngredientesController;
  let service: jest.Mocked<ProductoIngredientesService>;

  beforeEach(async () => {
    const serviceMock = {
      create: jest.fn(),
      createMultiple: jest.fn(),
      findAll: jest.fn(),
      findByProducto: jest.fn(),
      findByIngrediente: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getEstadisticas: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductoIngredientesController],
      providers: [
        {
          provide: ProductoIngredientesService,
          useValue: serviceMock,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<ProductoIngredientesController>(ProductoIngredientesController);
    service = module.get(ProductoIngredientesService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear una relación producto-ingrediente exitosamente', async () => {
      const createDto: CreateProductoIngredienteDto = {
        productoId: 1,
        ingredienteId: 2,
        cantidad: 50.5,
      };

      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      const expectedResult = {
        productoId: 1,
        ingredienteId: 2,
        cantidad: 50.5,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };

      service.create.mockResolvedValue(expectedResult as any);

      const result = await controller.create(createDto, mockRequest);

      expect(service.create).toHaveBeenCalledWith(createDto, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar ConflictException si la relación ya existe', async () => {
      const createDto: CreateProductoIngredienteDto = {
        productoId: 1,
        ingredienteId: 2,
        cantidad: 50.5,
      };

      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      service.create.mockRejectedValue(
        new ConflictException('Ya existe una relación entre el producto y el ingrediente')
      );

      await expect(controller.create(createDto, mockRequest)).rejects.toThrow(ConflictException);
    });
  });

  describe('createMultiple', () => {
    it('debe crear múltiples relaciones exitosamente', async () => {
      const ingredientesData = [
        { ingredienteId: 2, cantidad: 50 },
        { ingredienteId: 3, cantidad: 25 },
      ];

      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      const expectedResult = [
        {
          productoId: 1,
          ingredienteId: 2,
          cantidad: 50,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        },
        {
          productoId: 1,
          ingredienteId: 3,
          cantidad: 25,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        },
      ];

      service.createMultiple.mockResolvedValue(expectedResult as any);

      const result = await controller.createMultiple(1, ingredientesData, mockRequest);

      expect(service.createMultiple).toHaveBeenCalledWith(1, ingredientesData, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('debe retornar todas las relaciones', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      const expectedResult = [
        {
          productoId: 1,
          ingredienteId: 2,
          cantidad: 50.5,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          producto: { id: 1, nombre: 'Café Americano' },
          ingrediente: { id: 2, nombre: 'Café molido' },
        },
      ];

      service.findAll.mockResolvedValue(expectedResult as any);

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
        totalRelaciones: 45,
        relacionesConCantidad: 32,
        relacionesSinCantidad: 13,
        productosConMasIngredientes: [],
        ingredientesMasUtilizados: [],
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

  describe('findByProducto', () => {
    it('debe retornar ingredientes de un producto', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'cliente' }
      };

      const expectedResult = [
        {
          productoId: 1,
          ingredienteId: 2,
          cantidad: 15,
          ingrediente: { id: 2, nombre: 'Café molido' },
        },
      ];

      service.findByProducto.mockResolvedValue(expectedResult as any);

      const result = await controller.findByProducto(1, mockRequest);

      expect(service.findByProducto).toHaveBeenCalledWith(1, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar NotFoundException si el producto no existe', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'cliente' }
      };

      service.findByProducto.mockRejectedValue(
        new NotFoundException('Producto con ID 999 no encontrado')
      );

      await expect(controller.findByProducto(999, mockRequest)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByIngrediente', () => {
    it('debe retornar productos que usan un ingrediente', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'cliente' }
      };

      const expectedResult = [
        {
          productoId: 1,
          ingredienteId: 2,
          cantidad: 15,
          producto: { id: 1, nombre: 'Café Americano' },
        },
      ];

      service.findByIngrediente.mockResolvedValue(expectedResult as any);

      const result = await controller.findByIngrediente(2, mockRequest);

      expect(service.findByIngrediente).toHaveBeenCalledWith(2, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('debe retornar una relación específica', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'cliente' }
      };

      const expectedResult = {
        productoId: 1,
        ingredienteId: 2,
        cantidad: 15,
        producto: { id: 1, nombre: 'Café Americano' },
        ingrediente: { id: 2, nombre: 'Café molido' },
      };

      service.findOne.mockResolvedValue(expectedResult as any);

      const result = await controller.findOne(1, 2, mockRequest);

      expect(service.findOne).toHaveBeenCalledWith(1, 2, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar NotFoundException si la relación no existe', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'cliente' }
      };

      service.findOne.mockRejectedValue(
        new NotFoundException('No se encontró relación entre producto ID 1 e ingrediente ID 999')
      );

      await expect(controller.findOne(1, 999, mockRequest)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar una relación exitosamente', async () => {
      const updateDto: UpdateProductoIngredienteDto = {
        cantidad: 25.5,
      };

      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      const expectedResult = {
        productoId: 1,
        ingredienteId: 2,
        cantidad: 25.5,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };

      service.update.mockResolvedValue(expectedResult as any);

      const result = await controller.update(1, 2, updateDto, mockRequest);

      expect(service.update).toHaveBeenCalledWith(1, 2, updateDto, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const updateDto: UpdateProductoIngredienteDto = {
        cantidad: 25.5,
      };

      const mockRequest = {
        user: { id: 1, rol: 'cliente' }
      };

      service.update.mockRejectedValue(
        new ForbiddenException('Solo los administradores pueden actualizar relaciones producto-ingrediente')
      );

      await expect(controller.update(1, 2, updateDto, mockRequest)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('debe eliminar una relación exitosamente', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1, 2, mockRequest);

      expect(service.remove).toHaveBeenCalledWith(1, 2, mockRequest.user);
      expect(result).toEqual({ message: 'Relación producto-ingrediente eliminada exitosamente' });
    });

    it('debe lanzar NotFoundException si la relación no existe', async () => {
      const mockRequest = {
        user: { id: 1, rol: 'admin' }
      };

      service.remove.mockRejectedValue(
        new NotFoundException('No se encontró relación entre producto ID 1 e ingrediente ID 999')
      );

      await expect(controller.remove(1, 999, mockRequest)).rejects.toThrow(NotFoundException);
    });
  });
});