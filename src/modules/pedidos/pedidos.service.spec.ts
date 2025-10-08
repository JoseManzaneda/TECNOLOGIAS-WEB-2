import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { Pedido, EstadoPedido, MetodoPago } from './entities/pedido.entity';
import { PedidoDetalle } from './entities/pedido-detalle.entity';
import { Product } from '../products/entities/product.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

describe('PedidosService', () => {
  let service: PedidosService;
  let pedidoRepo: jest.Mocked<Repository<Pedido>>;
  let pedidoDetalleRepo: jest.Mocked<Repository<PedidoDetalle>>;
  let productRepo: jest.Mocked<Repository<Product>>;

  beforeEach(async () => {
    const pedidoRepoMock = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const pedidoDetalleRepoMock = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    const productRepoMock = {
      find: jest.fn(),
      save: jest.fn(),
    };

    const dataSourceMock = {
      transaction: jest.fn((callback) => callback({
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidosService,
        {
          provide: getRepositoryToken(Pedido),
          useValue: pedidoRepoMock,
        },
        {
          provide: getRepositoryToken(PedidoDetalle),
          useValue: pedidoDetalleRepoMock,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: productRepoMock,
        },
        {
          provide: 'DataSource',
          useValue: dataSourceMock,
        },
      ],
    }).compile();

    service = module.get<PedidosService>(PedidosService);
    pedidoRepo = module.get(getRepositoryToken(Pedido));
    pedidoDetalleRepo = module.get(getRepositoryToken(PedidoDetalle));
    productRepo = module.get(getRepositoryToken(Product));

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear un pedido exitosamente', async () => {
      const createPedidoDto: CreatePedidoDto = {
        metodoPago: MetodoPago.TARJETA,
        detalles: [
          { productoId: 1, cantidad: 2 },
          { productoId: 2, cantidad: 1 },
        ],
      };

      const userId = 1;
      const productos = [
        { id: 1, nombre: 'Café', precio: 50, stock: 10, disponible: true },
        { id: 2, nombre: 'Pastel', precio: 80, stock: 5, disponible: true },
      ] as Product[];

      const pedidoCreado = {
        id: 1,
        userId,
        metodoPago: MetodoPago.TARJETA,
        estado: EstadoPedido.PENDIENTE,
      } as Pedido;

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          id: 1,
          userId,
          total: 180,
          detalles: [],
        }),
      };

      productRepo.find.mockResolvedValue(productos);
      pedidoRepo.create.mockReturnValue(pedidoCreado);
      pedidoRepo.save.mockResolvedValue(pedidoCreado);
      pedidoDetalleRepo.create.mockImplementation((detalle) => detalle as PedidoDetalle);
      pedidoDetalleRepo.save.mockResolvedValue([] as any);
      pedidoRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.create(createPedidoDto, userId);

      expect(productRepo.find).toHaveBeenCalledWith({
        where: [{ id: 1 }, { id: 2 }],
      });
      expect(pedidoRepo.create).toHaveBeenCalledWith({
        userId,
        metodoPago: MetodoPago.TARJETA,
        estado: EstadoPedido.PENDIENTE,
      });
      expect(result).toBeDefined();
    });

    it('debe lanzar BadRequestException si un producto no existe', async () => {
      const createPedidoDto: CreatePedidoDto = {
        detalles: [{ productoId: 999, cantidad: 1 }],
      };

      const userId = 1;
      productRepo.find.mockResolvedValue([]); // No productos encontrados

      await expect(service.create(createPedidoDto, userId)).rejects.toThrow(
        BadRequestException
      );
    });

    it('debe lanzar BadRequestException si el producto no está disponible', async () => {
      const createPedidoDto: CreatePedidoDto = {
        detalles: [{ productoId: 1, cantidad: 1 }],
      };

      const userId = 1;
      const productos = [
        { id: 1, nombre: 'Café', precio: 50, stock: 10, disponible: false },
      ] as Product[];

      productRepo.find.mockResolvedValue(productos);

      await expect(service.create(createPedidoDto, userId)).rejects.toThrow(
        BadRequestException
      );
    });

    it('debe lanzar BadRequestException si no hay suficiente stock', async () => {
      const createPedidoDto: CreatePedidoDto = {
        detalles: [{ productoId: 1, cantidad: 15 }],
      };

      const userId = 1;
      const productos = [
        { id: 1, nombre: 'Café', precio: 50, stock: 10, disponible: true },
      ] as Product[];

      productRepo.find.mockResolvedValue(productos);

      await expect(service.create(createPedidoDto, userId)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('findAll', () => {
    it('debe retornar todos los pedidos para admin', async () => {
      const currentUser = { id: 1, rol: 'admin' };
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      pedidoRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll(currentUser);

      expect(pedidoRepo.createQueryBuilder).toHaveBeenCalledWith('pedido');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('pedido.fecha', 'DESC');
      expect(result).toEqual([]);
    });

    it('debe retornar solo pedidos propios para cliente', async () => {
      const currentUser = { id: 2, rol: 'cliente' };
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      pedidoRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll(currentUser);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'pedido.userId = :userId',
        { userId: currentUser.id }
      );
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('debe retornar un pedido por ID para admin', async () => {
      const currentUser = { id: 1, rol: 'admin' };
      const pedido = {
        id: 1,
        userId: 2,
        fecha: new Date(),
        estado: EstadoPedido.PENDIENTE,
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(pedido),
      };

      pedidoRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findOne(1, currentUser);

      expect(result).toEqual(pedido);
    });

    it('debe lanzar NotFoundException si el pedido no existe', async () => {
      const currentUser = { id: 1, rol: 'admin' };
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      pedidoRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await expect(service.findOne(999, currentUser)).rejects.toThrow(
        NotFoundException
      );
    });

    it('debe lanzar ForbiddenException si cliente intenta acceder a pedido ajeno', async () => {
      const currentUser = { id: 1, rol: 'cliente' };
      const pedido = {
        id: 1,
        userId: 2, // Diferente al usuario actual
        fecha: new Date(),
        estado: EstadoPedido.PENDIENTE,
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(pedido),
      };

      pedidoRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await expect(service.findOne(1, currentUser)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('update', () => {
    it('debe actualizar estado de pedido para admin', async () => {
      const updateDto: UpdatePedidoDto = {
        estado: EstadoPedido.EN_PREPARACION,
      };

      const currentUser = { id: 1, rol: 'admin' };
      const pedido = {
        id: 1,
        userId: 2,
        estado: EstadoPedido.PENDIENTE,
      } as Pedido;

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(pedido),
      };

      pedidoRepo.findOne.mockResolvedValue(pedido);
      pedidoRepo.save.mockResolvedValue({ ...pedido, estado: EstadoPedido.EN_PREPARACION });
      pedidoRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.update(1, updateDto, currentUser);

      expect(pedidoRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('debe lanzar NotFoundException si el pedido no existe', async () => {
      const updateDto: UpdatePedidoDto = { estado: EstadoPedido.CANCELADO };
      const currentUser = { id: 1, rol: 'admin' };

      pedidoRepo.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto, currentUser)).rejects.toThrow(
        NotFoundException
      );
    });

    it('debe lanzar ForbiddenException si cliente intenta actualizar pedido ajeno', async () => {
      const updateDto: UpdatePedidoDto = { estado: EstadoPedido.CANCELADO };
      const currentUser = { id: 1, rol: 'cliente' };
      const pedido = {
        id: 1,
        userId: 2, // Diferente al usuario actual
        estado: EstadoPedido.PENDIENTE,
      } as Pedido;

      pedidoRepo.findOne.mockResolvedValue(pedido);

      await expect(service.update(1, updateDto, currentUser)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('remove', () => {
    it('debe eliminar un pedido para admin', async () => {
      const currentUser = { id: 1, rol: 'admin' };
      const pedido = {
        id: 1,
        userId: 2,
        estado: EstadoPedido.PENDIENTE,
        detalles: [],
      } as any;

      pedidoRepo.findOne.mockResolvedValue(pedido);
      pedidoRepo.remove.mockResolvedValue(pedido);

      await service.remove(1, currentUser);

      expect(pedidoRepo.remove).toHaveBeenCalledWith(pedido);
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const currentUser = { id: 1, rol: 'cliente' };

      await expect(service.remove(1, currentUser)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('getEstadisticas', () => {
    it('debe retornar estadísticas para admin', async () => {
      const currentUser = { id: 1, rol: 'admin' };
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '2500.75' }),
      };

      pedidoRepo.count.mockResolvedValueOnce(100); // totalPedidos
      pedidoRepo.count.mockResolvedValueOnce(10);  // pedidosPendientes
      pedidoRepo.count.mockResolvedValueOnce(80);  // pedidosEntregados
      pedidoRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.getEstadisticas(currentUser);

      expect(result).toEqual({
        totalPedidos: 100,
        pedidosPendientes: 10,
        pedidosEntregados: 80,
        ventasTotales: 2500.75,
      });
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const currentUser = { id: 1, rol: 'cliente' };

      await expect(service.getEstadisticas(currentUser)).rejects.toThrow(
        ForbiddenException
      );
    });
  });
});