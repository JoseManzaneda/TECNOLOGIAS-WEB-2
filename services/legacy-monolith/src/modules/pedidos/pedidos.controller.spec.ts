import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { EstadoPedido, MetodoPago } from './entities/pedido.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

describe('PedidosController', () => {
  let controller: PedidosController;
  let pedidosService: jest.Mocked<PedidosService>;

  beforeEach(async () => {
    const pedidosServiceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByUser: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getEstadisticas: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PedidosController],
      providers: [
        {
          provide: PedidosService,
          useValue: pedidosServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PedidosController>(PedidosController);
    pedidosService = module.get(PedidosService);
  });

  describe('create', () => {
    it('debe crear un pedido exitosamente', async () => {
      const createPedidoDto: CreatePedidoDto = {
        metodoPago: MetodoPago.TARJETA,
        detalles: [
          { productoId: 1, cantidad: 2 },
          { productoId: 3, cantidad: 1 },
        ],
      };

      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' },
      };

      const expectedResult = {
        id: 1,
        userId: 1,
        fecha: new Date(),
        estado: EstadoPedido.PENDIENTE,
        metodoPago: MetodoPago.TARJETA,
        total: 150.50,
        detalles: [
          {
            id: 1,
            productoId: 1,
            cantidad: 2,
            precioUnitario: 50.00,
            producto: { id: 1, nombre: 'Café Americano' }
          }
        ]
      };

      pedidosService.create.mockResolvedValue(expectedResult as any);

      const result = await controller.create(createPedidoDto, mockRequest);

      expect(pedidosService.create).toHaveBeenCalledWith(createPedidoDto, 1);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar BadRequestException si un producto no existe', async () => {
      const createPedidoDto: CreatePedidoDto = {
        detalles: [{ productoId: 999, cantidad: 1 }],
      };

      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' },
      };

      pedidosService.create.mockRejectedValue(
        new BadRequestException('Uno o más productos no existen')
      );

      await expect(controller.create(createPedidoDto, mockRequest)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('findAll', () => {
    it('debe retornar pedidos del usuario autenticado (cliente)', async () => {
      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' },
      };

      const expectedResult = [
        {
          id: 1,
          fecha: new Date(),
          estado: EstadoPedido.PENDIENTE,
          metodoPago: MetodoPago.EFECTIVO,
          total: 100.00,
        },
      ];

      pedidosService.findAll.mockResolvedValue(expectedResult as any);

      const result = await controller.findAll(mockRequest);

      expect(pedidosService.findAll).toHaveBeenCalledWith(mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe retornar todos los pedidos (admin)', async () => {
      const mockRequest = {
        user: { id: 2, email: 'admin@example.com', rol: 'admin' },
      };

      const expectedResult = [
        {
          id: 1,
          fecha: new Date(),
          estado: EstadoPedido.PENDIENTE,
          total: 100.00,
          usuario: { id: 1, nombre: 'Juan', email: 'juan@example.com' },
        },
        {
          id: 2,
          fecha: new Date(),
          estado: EstadoPedido.ENTREGADO,
          total: 150.00,
          usuario: { id: 3, nombre: 'María', email: 'maria@example.com' },
        },
      ];

      pedidosService.findAll.mockResolvedValue(expectedResult as any);

      const result = await controller.findAll(mockRequest);

      expect(pedidosService.findAll).toHaveBeenCalledWith(mockRequest.user);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getEstadisticas', () => {
    it('debe retornar estadísticas para admin', async () => {
      const mockRequest = {
        user: { id: 1, email: 'admin@example.com', rol: 'admin' },
      };

      const expectedResult = {
        totalPedidos: 50,
        pedidosPendientes: 5,
        pedidosEntregados: 40,
        ventasTotales: 2500.75,
      };

      pedidosService.getEstadisticas.mockResolvedValue(expectedResult);

      const result = await controller.getEstadisticas(mockRequest);

      expect(pedidosService.getEstadisticas).toHaveBeenCalledWith(mockRequest.user);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('debe retornar un pedido por ID', async () => {
      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' },
      };

      const expectedResult = {
        id: 1,
        fecha: new Date(),
        estado: EstadoPedido.PENDIENTE,
        metodoPago: MetodoPago.EFECTIVO,
        total: 100.00,
        userId: 1,
        detalles: []
      };

      pedidosService.findOne.mockResolvedValue(expectedResult as any);

      const result = await controller.findOne(1, mockRequest);

      expect(pedidosService.findOne).toHaveBeenCalledWith(1, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar NotFoundException si el pedido no existe', async () => {
      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' },
      };

      pedidosService.findOne.mockRejectedValue(
        new NotFoundException('Pedido no encontrado')
      );

      await expect(controller.findOne(999, mockRequest)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('findByUser', () => {
    it('debe retornar pedidos de un usuario específico', async () => {
      const mockRequest = {
        user: { id: 1, email: 'admin@example.com', rol: 'admin' },
      };

      const expectedResult = [
        {
          id: 1,
          fecha: new Date(),
          estado: EstadoPedido.PENDIENTE,
          total: 100.00,
        },
      ];

      pedidosService.findByUser.mockResolvedValue(expectedResult as any);

      const result = await controller.findByUser(2, mockRequest);

      expect(pedidosService.findByUser).toHaveBeenCalledWith(2, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar ForbiddenException si cliente intenta acceder a pedidos ajenos', async () => {
      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' },
      };

      pedidosService.findByUser.mockRejectedValue(
        new ForbiddenException('No tienes permisos para acceder a estos pedidos')
      );

      await expect(controller.findByUser(2, mockRequest)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('update', () => {
    it('debe actualizar estado de pedido exitosamente', async () => {
      const updatePedidoDto: UpdatePedidoDto = {
        estado: EstadoPedido.EN_PREPARACION,
      };

      const mockRequest = {
        user: { id: 1, email: 'admin@example.com', rol: 'admin' },
      };

      const expectedResult = {
        id: 1,
        fecha: new Date(),
        estado: EstadoPedido.EN_PREPARACION,
        metodoPago: MetodoPago.EFECTIVO,
        total: 100.00,
      };

      pedidosService.update.mockResolvedValue(expectedResult as any);

      const result = await controller.update(1, updatePedidoDto, mockRequest);

      expect(pedidosService.update).toHaveBeenCalledWith(
        1,
        updatePedidoDto,
        mockRequest.user
      );
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar ForbiddenException si usuario no tiene permisos', async () => {
      const updatePedidoDto: UpdatePedidoDto = {
        estado: EstadoPedido.EN_PREPARACION,
      };

      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' },
      };

      pedidosService.update.mockRejectedValue(
        new ForbiddenException('Solo puedes cancelar tu pedido')
      );

      await expect(controller.update(2, updatePedidoDto, mockRequest)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('remove', () => {
    it('debe eliminar un pedido exitosamente', async () => {
      const mockRequest = {
        user: { id: 1, email: 'admin@example.com', rol: 'admin' },
      };

      pedidosService.remove.mockResolvedValue(undefined);

      await controller.remove(1, mockRequest);

      expect(pedidosService.remove).toHaveBeenCalledWith(1, mockRequest.user);
    });

    it('debe lanzar NotFoundException si el pedido no existe', async () => {
      const mockRequest = {
        user: { id: 1, email: 'admin@example.com', rol: 'admin' },
      };

      pedidosService.remove.mockRejectedValue(
        new NotFoundException('Pedido no encontrado')
      );

      await expect(controller.remove(999, mockRequest)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});