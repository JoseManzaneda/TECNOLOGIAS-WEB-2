import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProductoIngredientesService } from './producto-ingredientes.service';
import { ProductoIngrediente } from './entities/producto-ingrediente.entity';
import { Product } from '../products/entities/product.entity';
import { Ingrediente } from '../ingredientes/entities/ingrediente.entity';
import { CreateProductoIngredienteDto } from './dto/create-producto-ingrediente.dto';
import { UpdateProductoIngredienteDto } from './dto/update-producto-ingrediente.dto';

describe('ProductoIngredientesService', () => {
  let service: ProductoIngredientesService;
  let productoIngredienteRepo: jest.Mocked<Repository<ProductoIngrediente>>;
  let productRepo: jest.Mocked<Repository<Product>>;
  let ingredienteRepo: jest.Mocked<Repository<Ingrediente>>;

  beforeEach(async () => {
    const productoIngredienteRepoMock = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const productRepoMock = {
      findOne: jest.fn(),
    };

    const ingredienteRepoMock = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductoIngredientesService,
        {
          provide: getRepositoryToken(ProductoIngrediente),
          useValue: productoIngredienteRepoMock,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: productRepoMock,
        },
        {
          provide: getRepositoryToken(Ingrediente),
          useValue: ingredienteRepoMock,
        },
      ],
    }).compile();

    service = module.get<ProductoIngredientesService>(ProductoIngredientesService);
    productoIngredienteRepo = module.get(getRepositoryToken(ProductoIngrediente));
    productRepo = module.get(getRepositoryToken(Product));
    ingredienteRepo = module.get(getRepositoryToken(Ingrediente));

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear una relación exitosamente', async () => {
      const createDto: CreateProductoIngredienteDto = {
        productoId: 1,
        ingredienteId: 2,
        cantidad: 50.5,
      };

      const currentUser = { id: 1, rol: 'admin' };

      const producto = {
        id: 1,
        nombre: 'Café Americano',
        precio: 3.50,
      } as Product;

      const ingrediente = {
        id: 2,
        nombre: 'Café molido',
        unidad: 'gramos',
      } as Ingrediente;

      const relacionCreada = {
        productoId: 1,
        ingredienteId: 2,
        cantidad: 50.5,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      } as ProductoIngrediente;

      productRepo.findOne.mockResolvedValue(producto);
      ingredienteRepo.findOne.mockResolvedValue(ingrediente);
      productoIngredienteRepo.findOne.mockResolvedValue(null); // No existe la relación
      productoIngredienteRepo.create.mockReturnValue(relacionCreada);
      productoIngredienteRepo.save.mockResolvedValue(relacionCreada);

      const result = await service.create(createDto, currentUser);

      expect(productRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(ingredienteRepo.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(productoIngredienteRepo.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(relacionCreada);
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const createDto: CreateProductoIngredienteDto = {
        productoId: 1,
        ingredienteId: 2,
        cantidad: 50.5,
      };

      const currentUser = { id: 1, rol: 'cliente' };

      await expect(service.create(createDto, currentUser)).rejects.toThrow(
        new ForbiddenException('Solo los administradores pueden crear relaciones producto-ingrediente')
      );
    });

    it('debe lanzar NotFoundException si el producto no existe', async () => {
      const createDto: CreateProductoIngredienteDto = {
        productoId: 999,
        ingredienteId: 2,
        cantidad: 50.5,
      };

      const currentUser = { id: 1, rol: 'admin' };

      productRepo.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, currentUser)).rejects.toThrow(
        new NotFoundException('Producto con ID 999 no encontrado')
      );
    });

    it('debe lanzar NotFoundException si el ingrediente no existe', async () => {
      const createDto: CreateProductoIngredienteDto = {
        productoId: 1,
        ingredienteId: 999,
        cantidad: 50.5,
      };

      const currentUser = { id: 1, rol: 'admin' };

      const producto = {
        id: 1,
        nombre: 'Café Americano',
      } as Product;

      productRepo.findOne.mockResolvedValue(producto);
      ingredienteRepo.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, currentUser)).rejects.toThrow(
        new NotFoundException('Ingrediente con ID 999 no encontrado')
      );
    });

    it('debe lanzar ConflictException si la relación ya existe', async () => {
      const createDto: CreateProductoIngredienteDto = {
        productoId: 1,
        ingredienteId: 2,
        cantidad: 50.5,
      };

      const currentUser = { id: 1, rol: 'admin' };

      const producto = {
        id: 1,
        nombre: 'Café Americano',
      } as Product;

      const ingrediente = {
        id: 2,
        nombre: 'Café molido',
      } as Ingrediente;

      const relacionExistente = {
        productoId: 1,
        ingredienteId: 2,
      } as ProductoIngrediente;

      productRepo.findOne.mockResolvedValue(producto);
      ingredienteRepo.findOne.mockResolvedValue(ingrediente);
      productoIngredienteRepo.findOne.mockResolvedValue(relacionExistente);

      await expect(service.create(createDto, currentUser)).rejects.toThrow(
        new ConflictException('Ya existe una relación entre el producto "Café Americano" y el ingrediente "Café molido"')
      );
    });
  });

  describe('findAll', () => {
    it('debe retornar todas las relaciones con productos e ingredientes', async () => {
      const currentUser = { id: 1, rol: 'admin' };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      productoIngredienteRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll(currentUser);

      expect(productoIngredienteRepo.createQueryBuilder).toHaveBeenCalledWith('pi');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('pi.producto', 'producto');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('pi.ingrediente', 'ingrediente');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('producto.nombre', 'ASC');
      expect(result).toEqual([]);
    });
  });

  describe('findByProducto', () => {
    it('debe retornar ingredientes de un producto específico', async () => {
      const currentUser = { id: 1, rol: 'cliente' };

      const producto = {
        id: 1,
        nombre: 'Café Americano',
      } as Product;

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      productRepo.findOne.mockResolvedValue(producto);
      productoIngredienteRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findByProducto(1, currentUser);

      expect(productRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('pi.productoId = :productoId', { productoId: 1 });
      expect(result).toEqual([]);
    });

    it('debe lanzar NotFoundException si el producto no existe', async () => {
      const currentUser = { id: 1, rol: 'cliente' };

      productRepo.findOne.mockResolvedValue(null);

      await expect(service.findByProducto(999, currentUser)).rejects.toThrow(
        new NotFoundException('Producto con ID 999 no encontrado')
      );
    });
  });

  describe('findByIngrediente', () => {
    it('debe retornar productos que usan un ingrediente específico', async () => {
      const currentUser = { id: 1, rol: 'cliente' };

      const ingrediente = {
        id: 2,
        nombre: 'Café molido',
      } as Ingrediente;

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      ingredienteRepo.findOne.mockResolvedValue(ingrediente);
      productoIngredienteRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findByIngrediente(2, currentUser);

      expect(ingredienteRepo.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('pi.ingredienteId = :ingredienteId', { ingredienteId: 2 });
      expect(result).toEqual([]);
    });

    it('debe lanzar NotFoundException si el ingrediente no existe', async () => {
      const currentUser = { id: 1, rol: 'cliente' };

      ingredienteRepo.findOne.mockResolvedValue(null);

      await expect(service.findByIngrediente(999, currentUser)).rejects.toThrow(
        new NotFoundException('Ingrediente con ID 999 no encontrado')
      );
    });
  });

  describe('findOne', () => {
    it('debe retornar una relación específica', async () => {
      const currentUser = { id: 1, rol: 'cliente' };

      const relacion = {
        productoId: 1,
        ingredienteId: 2,
        cantidad: 50.5,
        producto: { id: 1, nombre: 'Café Americano' },
        ingrediente: { id: 2, nombre: 'Café molido' },
      } as ProductoIngrediente;

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(relacion),
      };

      productoIngredienteRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findOne(1, 2, currentUser);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'pi.productoId = :productoId AND pi.ingredienteId = :ingredienteId',
        { productoId: 1, ingredienteId: 2 }
      );
      expect(result).toEqual(relacion);
    });

    it('debe lanzar NotFoundException si la relación no existe', async () => {
      const currentUser = { id: 1, rol: 'cliente' };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      productoIngredienteRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await expect(service.findOne(1, 999, currentUser)).rejects.toThrow(
        new NotFoundException('No se encontró relación entre producto ID 1 e ingrediente ID 999')
      );
    });
  });

  describe('update', () => {
    it('debe actualizar una relación exitosamente', async () => {
      const updateDto: UpdateProductoIngredienteDto = {
        cantidad: 75.0,
      };

      const currentUser = { id: 1, rol: 'admin' };

      const relacionExistente = {
        productoId: 1,
        ingredienteId: 2,
        cantidad: 50.5,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      } as ProductoIngrediente;

      const relacionActualizada = {
        ...relacionExistente,
        cantidad: 75.0,
      } as ProductoIngrediente;

      productoIngredienteRepo.findOne.mockResolvedValue(relacionExistente);
      productoIngredienteRepo.save.mockResolvedValue(relacionActualizada);

      const result = await service.update(1, 2, updateDto, currentUser);

      expect(productoIngredienteRepo.save).toHaveBeenCalled();
      expect(result).toEqual(relacionActualizada);
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const updateDto: UpdateProductoIngredienteDto = {
        cantidad: 75.0,
      };

      const currentUser = { id: 1, rol: 'cliente' };

      await expect(service.update(1, 2, updateDto, currentUser)).rejects.toThrow(
        new ForbiddenException('Solo los administradores pueden actualizar relaciones producto-ingrediente')
      );
    });

    it('debe lanzar NotFoundException si la relación no existe', async () => {
      const updateDto: UpdateProductoIngredienteDto = {
        cantidad: 75.0,
      };

      const currentUser = { id: 1, rol: 'admin' };

      productoIngredienteRepo.findOne.mockResolvedValue(null);

      await expect(service.update(1, 999, updateDto, currentUser)).rejects.toThrow(
        new NotFoundException('No se encontró relación entre producto ID 1 e ingrediente ID 999')
      );
    });
  });

  describe('remove', () => {
    it('debe eliminar una relación exitosamente', async () => {
      const currentUser = { id: 1, rol: 'admin' };

      const relacion = {
        productoId: 1,
        ingredienteId: 2,
        cantidad: 50.5,
      } as ProductoIngrediente;

      productoIngredienteRepo.findOne.mockResolvedValue(relacion);
      productoIngredienteRepo.remove.mockResolvedValue(relacion);

      await service.remove(1, 2, currentUser);

      expect(productoIngredienteRepo.remove).toHaveBeenCalledWith(relacion);
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const currentUser = { id: 1, rol: 'cliente' };

      await expect(service.remove(1, 2, currentUser)).rejects.toThrow(
        new ForbiddenException('Solo los administradores pueden eliminar relaciones producto-ingrediente')
      );
    });

    it('debe lanzar NotFoundException si la relación no existe', async () => {
      const currentUser = { id: 1, rol: 'admin' };

      productoIngredienteRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(1, 999, currentUser)).rejects.toThrow(
        new NotFoundException('No se encontró relación entre producto ID 1 e ingrediente ID 999')
      );
    });
  });

  describe('getEstadisticas', () => {
    it('debe retornar estadísticas para admin', async () => {
      const currentUser = { id: 1, rol: 'admin' };

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(32),
      };

      // Mock para productos con más ingredientes
      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([
          { nombreProducto: 'Latte', cantidadIngredientes: '5' }
        ])
        .mockResolvedValueOnce([
          { nombreIngrediente: 'Leche', cantidadProductos: '8' }
        ]);

      productoIngredienteRepo.count.mockResolvedValue(45);
      productoIngredienteRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.getEstadisticas(currentUser);

      expect(result).toEqual({
        totalRelaciones: 45,
        relacionesConCantidad: 32,
        relacionesSinCantidad: 13,
        productosConMasIngredientes: [
          { nombreProducto: 'Latte', cantidadIngredientes: 5 }
        ],
        ingredientesMasUtilizados: [
          { nombreIngrediente: 'Leche', cantidadProductos: 8 }
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

  describe('createMultiple', () => {
    it('debe crear múltiples relaciones exitosamente', async () => {
      const currentUser = { id: 1, rol: 'admin' };

      const ingredientesData = [
        { ingredienteId: 2, cantidad: 50 },
        { ingredienteId: 3, cantidad: 25 },
      ];

      const producto = {
        id: 1,
        nombre: 'Café Americano',
      } as Product;

      productRepo.findOne.mockResolvedValue(producto);

      // Mock del método create para cada relación
      const serviceSpy = jest.spyOn(service, 'create');
      serviceSpy.mockResolvedValueOnce({
        productoId: 1,
        ingredienteId: 2,
        cantidad: 50,
      } as ProductoIngrediente);
      serviceSpy.mockResolvedValueOnce({
        productoId: 1,
        ingredienteId: 3,
        cantidad: 25,
      } as ProductoIngrediente);

      const result = await service.createMultiple(1, ingredientesData, currentUser);

      expect(productRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(serviceSpy).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);

      serviceSpy.mockRestore();
    });

    it('debe lanzar NotFoundException si el producto no existe', async () => {
      const currentUser = { id: 1, rol: 'admin' };

      const ingredientesData = [
        { ingredienteId: 2, cantidad: 50 },
      ];

      productRepo.findOne.mockResolvedValue(null);

      await expect(service.createMultiple(999, ingredientesData, currentUser)).rejects.toThrow(
        new NotFoundException('Producto con ID 999 no encontrado')
      );
    });
  });
});