import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { EstadoPago, MetodoPago } from './entities/pago.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

describe('PagosController', () => {
  let controller: PagosController;
  let pagosService: jest.Mocked<PagosService>;

  beforeEach(async () => {
    const pagosServiceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByPedido: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getEstadisticas: jest.fn(),
      procesarPago: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagosController],
      providers: [
        {
          provide: PagosService,
          useValue: pagosServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PagosController>(PagosController);
    pagosService = module.get(PagosService);
  });

  describe('create', () => {
    it('debe crear un pago exitosamente', async () => {
      const createPagoDto: CreatePagoDto = {
        pedidoId: 1,
        monto: 150.75,
        metodo: MetodoPago.TARJETA,
      };

      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' },
      };

      const expectedResult = {
        id: 1,
        pedidoId: 1,
        monto: 150.75,
        metodo: MetodoPago.TARJETA,
        fecha: new Date(),
        estado: EstadoPago.PENDIENTE,
      };

      pagosService.create.mockResolvedValue(expectedResult as any);

      const result = await controller.create(createPagoDto, mockRequest);

      expect(pagosService.create).toHaveBeenCalledWith(createPagoDto, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar NotFoundException si el pedido no existe', async () => {
      const createPagoDto: CreatePagoDto = {
        pedidoId: 999,
        monto: 100.00,
        metodo: MetodoPago.EFECTIVO,
      };

      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' },
      };

      pagosService.create.mockRejectedValue(
        new NotFoundException('Pedido no encontrado')
      );

      await expect(controller.create(createPagoDto, mockRequest)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('findAll', () => {
    it('debe retornar pagos del usuario autenticado (cliente)', async () => {
      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' },
      };

      const expectedResult = [
        {
          id: 1,
          monto: 100.00,
          metodo: MetodoPago.EFECTIVO,
          fecha: new Date(),
          estado: EstadoPago.COMPLETADO,
          pedido: { id: 1, total: 100.00 }
        },
      ];

      pagosService.findAll.mockResolvedValue(expectedResult as any);

      const result = await controller.findAll(mockRequest);

      expect(pagosService.findAll).toHaveBeenCalledWith(mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe retornar todos los pagos (admin)', async () => {
      const mockRequest = {
        user: { id: 2, email: 'admin@example.com', rol: 'admin' },
      };

      const expectedResult = [
        {
          id: 1,
          monto: 100.00,
          metodo: MetodoPago.TARJETA,
          estado: EstadoPago.COMPLETADO,
          pedido: {
            id: 1,
            usuario: { id: 1, nombre: 'Juan', email: 'juan@example.com' }
          }
        },
        {
          id: 2,
          monto: 200.00,
          metodo: MetodoPago.QR,
          estado: EstadoPago.PENDIENTE,
          pedido: {
            id: 2,
            usuario: { id: 3, nombre: 'María', email: 'maria@example.com' }
          }
        },
      ];

      pagosService.findAll.mockResolvedValue(expectedResult as any);

      const result = await controller.findAll(mockRequest);

      expect(pagosService.findAll).toHaveBeenCalledWith(mockRequest.user);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getEstadisticas', () => {
    it('debe retornar estadísticas para admin', async () => {
      const mockRequest = {
        user: { id: 1, email: 'admin@example.com', rol: 'admin' },
      };

      const expectedResult = {
        totalPagos: 100,
        pagosPendientes: 10,
        pagosCompletados: 85,
        pagosFallidos: 5,
        ingresosTotales: 15750.25,
        estadisticasPorMetodo: [
          { metodo: 'tarjeta', cantidad: 50, total: 8500.00 },
          { metodo: 'efectivo', cantidad: 30, total: 6000.00 },
          { metodo: 'qr', cantidad: 20, total: 3500.00 }
        ]
      };

      pagosService.getEstadisticas.mockResolvedValue(expectedResult);

      const result = await controller.getEstadisticas(mockRequest);

      expect(pagosService.getEstadisticas).toHaveBeenCalledWith(mockRequest.user);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('debe retornar un pago por ID', async () => {
      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' },
      };

      const expectedResult = {
        id: 1,
        pedidoId: 1,
        monto: 150.75,
        metodo: MetodoPago.TARJETA,
        fecha: new Date(),
        estado: EstadoPago.COMPLETADO,
        pedido: { id: 1, total: 150.75, userId: 1 }
      };

      pagosService.findOne.mockResolvedValue(expectedResult as any);

      const result = await controller.findOne(1, mockRequest);

      expect(pagosService.findOne).toHaveBeenCalledWith(1, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar NotFoundException si el pago no existe', async () => {
      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' },
      };

      pagosService.findOne.mockRejectedValue(
        new NotFoundException('Pago no encontrado')
      );

      await expect(controller.findOne(999, mockRequest)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('findByPedido', () => {
    it('debe retornar pagos de un pedido específico', async () => {
      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' },
      };

      const expectedResult = [
        {
          id: 1,
          pedidoId: 1,
          monto: 150.75,
          metodo: MetodoPago.TARJETA,
          estado: EstadoPago.COMPLETADO,
        },
      ];

      pagosService.findByPedido.mockResolvedValue(expectedResult as any);

      const result = await controller.findByPedido(1, mockRequest);

      expect(pagosService.findByPedido).toHaveBeenCalledWith(1, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar ForbiddenException si cliente intenta acceder a pagos de pedido ajeno', async () => {
      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' },
      };

      pagosService.findByPedido.mockRejectedValue(
        new ForbiddenException('No tienes permisos para acceder a los pagos de este pedido')
      );

      await expect(controller.findByPedido(2, mockRequest)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('update', () => {
    it('debe actualizar un pago exitosamente', async () => {
      const updatePagoDto: UpdatePagoDto = {
        monto: 200.00,
        estado: EstadoPago.COMPLETADO,
      };

      const mockRequest = {
        user: { id: 1, email: 'admin@example.com', rol: 'admin' },
      };

      const expectedResult = {
        id: 1,
        pedidoId: 1,
        monto: 200.00,
        metodo: MetodoPago.TARJETA,
        fecha: new Date(),
        estado: EstadoPago.COMPLETADO,
      };

      pagosService.update.mockResolvedValue(expectedResult as any);

      const result = await controller.update(1, updatePagoDto, mockRequest);

      expect(pagosService.update).toHaveBeenCalledWith(
        1,
        updatePagoDto,
        mockRequest.user
      );
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar ForbiddenException si cliente intenta cambiar estado', async () => {
      const updatePagoDto: UpdatePagoDto = {
        estado: EstadoPago.COMPLETADO,
      };

      const mockRequest = {
        user: { id: 1, email: 'juan@example.com', rol: 'cliente' },
      };

      pagosService.update.mockRejectedValue(
        new ForbiddenException('Solo los administradores pueden cambiar el estado del pago')
      );

      await expect(controller.update(1, updatePagoDto, mockRequest)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('procesarPago', () => {
    it('debe procesar un pago exitosamente', async () => {
      const mockRequest = {
        user: { id: 1, email: 'admin@example.com', rol: 'admin' },
      };

      const expectedResult = {
        id: 1,
        pedidoId: 1,
        monto: 150.75,
        metodo: MetodoPago.TARJETA,
        estado: EstadoPago.COMPLETADO,
      };

      pagosService.procesarPago.mockResolvedValue(expectedResult as any);

      const result = await controller.procesarPago(1, mockRequest);

      expect(pagosService.procesarPago).toHaveBeenCalledWith(1, mockRequest.user);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar BadRequestException si el pago no está pendiente', async () => {
      const mockRequest = {
        user: { id: 1, email: 'admin@example.com', rol: 'admin' },
      };

      pagosService.procesarPago.mockRejectedValue(
        new BadRequestException('Solo se pueden procesar pagos pendientes')
      );

      await expect(controller.procesarPago(1, mockRequest)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('remove', () => {
    it('debe eliminar un pago exitosamente', async () => {
      const mockRequest = {
        user: { id: 1, email: 'admin@example.com', rol: 'admin' },
      };

      pagosService.remove.mockResolvedValue(undefined);

      await controller.remove(1, mockRequest);

      expect(pagosService.remove).toHaveBeenCalledWith(1, mockRequest.user);
    });

    it('debe lanzar BadRequestException si se intenta eliminar pago completado', async () => {
      const mockRequest = {
        user: { id: 1, email: 'admin@example.com', rol: 'admin' },
      };

      pagosService.remove.mockRejectedValue(
        new BadRequestException('No se puede eliminar un pago completado')
      );

      await expect(controller.remove(1, mockRequest)).rejects.toThrow(
        BadRequestException
      );
    });
  });
});