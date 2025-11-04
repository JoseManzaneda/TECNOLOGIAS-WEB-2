import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { Pago, EstadoPago, MetodoPago } from './entities/pago.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';

describe('PagosService', () => {
  let service: PagosService;
  let pagoRepo: jest.Mocked<Repository<Pago>>;
  let pedidoRepo: jest.Mocked<Repository<Pedido>>;

  beforeEach(async () => {
    const pagoRepoMock = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const pedidoRepoMock = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagosService,
        {
          provide: getRepositoryToken(Pago),
          useValue: pagoRepoMock,
        },
        {
          provide: getRepositoryToken(Pedido),
          useValue: pedidoRepoMock,
        },
      ],
    }).compile();

    service = module.get<PagosService>(PagosService);
    pagoRepo = module.get(getRepositoryToken(Pago));
    pedidoRepo = module.get(getRepositoryToken(Pedido));

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear un pago exitosamente', async () => {
      const createPagoDto: CreatePagoDto = {
        pedidoId: 1,
        monto: 150.75,
        metodo: MetodoPago.TARJETA,
      };

      const currentUser = { id: 1, rol: 'cliente' };
      const pedido = {
        id: 1,
        userId: 1,
        total: 200.00,
      } as Pedido;

      const pagoCreado = {
        id: 1,
        pedidoId: 1,
        monto: 150.75,
        metodo: MetodoPago.TARJETA,
        estado: EstadoPago.PENDIENTE,
      } as Pago;

      pedidoRepo.findOne.mockResolvedValue(pedido);
      pagoRepo.findOne.mockResolvedValue(null); // No existe pago completado
      pagoRepo.create.mockReturnValue(pagoCreado);
      pagoRepo.save.mockResolvedValue(pagoCreado);

      const result = await service.create(createPagoDto, currentUser);

      expect(pedidoRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(pagoRepo.create).toHaveBeenCalledWith({
        pedidoId: 1,
        monto: 150.75,
        metodo: MetodoPago.TARJETA,
        estado: EstadoPago.PENDIENTE,
      });
      expect(result).toEqual(pagoCreado);
    });

    it('debe lanzar NotFoundException si el pedido no existe', async () => {
      const createPagoDto: CreatePagoDto = {
        pedidoId: 999,
        monto: 100.00,
        metodo: MetodoPago.EFECTIVO,
      };

      const currentUser = { id: 1, rol: 'cliente' };
      pedidoRepo.findOne.mockResolvedValue(null);

      await expect(service.create(createPagoDto, currentUser)).rejects.toThrow(
        NotFoundException
      );
    });

    it('debe lanzar ForbiddenException si cliente intenta crear pago para pedido ajeno', async () => {
      const createPagoDto: CreatePagoDto = {
        pedidoId: 1,
        monto: 100.00,
        metodo: MetodoPago.EFECTIVO,
      };

      const currentUser = { id: 1, rol: 'cliente' };
      const pedido = {
        id: 1,
        userId: 2, // Diferente al usuario actual
        total: 200.00,
      } as Pedido;

      pedidoRepo.findOne.mockResolvedValue(pedido);

      await expect(service.create(createPagoDto, currentUser)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('debe lanzar BadRequestException si el monto excede el total del pedido', async () => {
      const createPagoDto: CreatePagoDto = {
        pedidoId: 1,
        monto: 300.00,
        metodo: MetodoPago.EFECTIVO,
      };

      const currentUser = { id: 1, rol: 'cliente' };
      const pedido = {
        id: 1,
        userId: 1,
        total: 200.00,
      } as Pedido;

      pedidoRepo.findOne.mockResolvedValue(pedido);
      pagoRepo.findOne.mockResolvedValue(null);

      await expect(service.create(createPagoDto, currentUser)).rejects.toThrow(
        BadRequestException
      );
    });

    it('debe lanzar BadRequestException si ya existe un pago completado', async () => {
      const createPagoDto: CreatePagoDto = {
        pedidoId: 1,
        monto: 150.00,
        metodo: MetodoPago.EFECTIVO,
      };

      const currentUser = { id: 1, rol: 'cliente' };
      const pedido = {
        id: 1,
        userId: 1,
        total: 200.00,
      } as Pedido;

      const pagoExistente = {
        id: 1,
        estado: EstadoPago.COMPLETADO,
      } as Pago;

      pedidoRepo.findOne.mockResolvedValue(pedido);
      pagoRepo.findOne.mockResolvedValue(pagoExistente);

      await expect(service.create(createPagoDto, currentUser)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('findAll', () => {
    it('debe retornar todos los pagos para admin', async () => {
      const currentUser = { id: 1, rol: 'admin' };
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      pagoRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll(currentUser);

      expect(pagoRepo.createQueryBuilder).toHaveBeenCalledWith('pago');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('pago.fecha', 'DESC');
      expect(result).toEqual([]);
    });

    it('debe retornar solo pagos propios para cliente', async () => {
      const currentUser = { id: 2, rol: 'cliente' };
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      pagoRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll(currentUser);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'pedido.userId = :userId',
        { userId: currentUser.id }
      );
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('debe retornar un pago por ID para admin', async () => {
      const currentUser = { id: 1, rol: 'admin' };
      const pago = {
        id: 1,
        pedidoId: 1,
        monto: 150.75,
        estado: EstadoPago.PENDIENTE,
        pedido: { userId: 2 }
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(pago),
      };

      pagoRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findOne(1, currentUser);

      expect(result).toEqual(pago);
    });

    it('debe lanzar NotFoundException si el pago no existe', async () => {
      const currentUser = { id: 1, rol: 'admin' };
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      pagoRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await expect(service.findOne(999, currentUser)).rejects.toThrow(
        NotFoundException
      );
    });

    it('debe lanzar ForbiddenException si cliente intenta acceder a pago ajeno', async () => {
      const currentUser = { id: 1, rol: 'cliente' };
      const pago = {
        id: 1,
        pedidoId: 1,
        monto: 150.75,
        pedido: { userId: 2 } // Diferente al usuario actual
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(pago),
      };

      pagoRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await expect(service.findOne(1, currentUser)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('findByPedido', () => {
    it('debe retornar pagos de un pedido para usuario autorizado', async () => {
      const currentUser = { id: 1, rol: 'cliente' };
      const pedido = {
        id: 1,
        userId: 1,
      } as Pedido;

      const pagos = [
        {
          id: 1,
          pedidoId: 1,
          monto: 150.75,
          estado: EstadoPago.COMPLETADO,
        },
      ] as Pago[];

      pedidoRepo.findOne.mockResolvedValue(pedido);
      pagoRepo.find.mockResolvedValue(pagos);

      const result = await service.findByPedido(1, currentUser);

      expect(pedidoRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(pagoRepo.find).toHaveBeenCalledWith({
        where: { pedidoId: 1 },
        order: { fecha: 'DESC' }
      });
      expect(result).toEqual(pagos);
    });

    it('debe lanzar ForbiddenException si cliente intenta acceder a pagos de pedido ajeno', async () => {
      const currentUser = { id: 1, rol: 'cliente' };
      const pedido = {
        id: 1,
        userId: 2, // Diferente al usuario actual
      } as Pedido;

      pedidoRepo.findOne.mockResolvedValue(pedido);

      await expect(service.findByPedido(1, currentUser)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('update', () => {
    it('debe actualizar pago para admin', async () => {
      const updateDto: UpdatePagoDto = {
        estado: EstadoPago.COMPLETADO,
      };

      const currentUser = { id: 1, rol: 'admin' };
      const pago = {
        id: 1,
        pedidoId: 1,
        monto: 150.75,
        estado: EstadoPago.PENDIENTE,
        pedido: { userId: 2, total: 200.00 }
      } as any;

      pagoRepo.findOne.mockResolvedValue(pago);
      pagoRepo.save.mockResolvedValue({ ...pago, estado: EstadoPago.COMPLETADO });

      const result = await service.update(1, updateDto, currentUser);

      expect(pagoRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('debe lanzar NotFoundException si el pago no existe', async () => {
      const updateDto: UpdatePagoDto = { estado: EstadoPago.COMPLETADO };
      const currentUser = { id: 1, rol: 'admin' };

      pagoRepo.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto, currentUser)).rejects.toThrow(
        NotFoundException
      );
    });

    it('debe lanzar ForbiddenException si cliente intenta cambiar estado', async () => {
      const updateDto: UpdatePagoDto = { estado: EstadoPago.COMPLETADO };
      const currentUser = { id: 1, rol: 'cliente' };
      const pago = {
        id: 1,
        pedidoId: 1,
        estado: EstadoPago.PENDIENTE,
        pedido: { userId: 1 }
      } as any;

      pagoRepo.findOne.mockResolvedValue(pago);

      await expect(service.update(1, updateDto, currentUser)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('remove', () => {
    it('debe eliminar un pago para admin', async () => {
      const currentUser = { id: 1, rol: 'admin' };
      const pago = {
        id: 1,
        estado: EstadoPago.PENDIENTE,
        pedido: { id: 1 }
      } as any;

      pagoRepo.findOne.mockResolvedValue(pago);
      pagoRepo.remove.mockResolvedValue(pago);

      await service.remove(1, currentUser);

      expect(pagoRepo.remove).toHaveBeenCalledWith(pago);
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const currentUser = { id: 1, rol: 'cliente' };

      await expect(service.remove(1, currentUser)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('debe lanzar BadRequestException si se intenta eliminar pago completado', async () => {
      const currentUser = { id: 1, rol: 'admin' };
      const pago = {
        id: 1,
        estado: EstadoPago.COMPLETADO,
        pedido: { id: 1 }
      } as any;

      pagoRepo.findOne.mockResolvedValue(pago);

      await expect(service.remove(1, currentUser)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('getEstadisticas', () => {
    it('debe retornar estadísticas para admin', async () => {
      const currentUser = { id: 1, rol: 'admin' };
      
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '15750.25' }),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { pago_metodo: 'tarjeta', cantidad: '50', total: '8500.00' },
          { pago_metodo: 'efectivo', cantidad: '30', total: '6000.00' }
        ])
      };

      pagoRepo.count.mockResolvedValueOnce(100); // totalPagos
      pagoRepo.count.mockResolvedValueOnce(10);  // pagosPendientes
      pagoRepo.count.mockResolvedValueOnce(85);  // pagosCompletados
      pagoRepo.count.mockResolvedValueOnce(5);   // pagosFallidos
      pagoRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.getEstadisticas(currentUser);

      expect(result).toEqual({
        totalPagos: 100,
        pagosPendientes: 10,
        pagosCompletados: 85,
        pagosFallidos: 5,
        ingresosTotales: 15750.25,
        estadisticasPorMetodo: [
          { metodo: 'tarjeta', cantidad: 50, total: 8500.00 },
          { metodo: 'efectivo', cantidad: 30, total: 6000.00 }
        ]
      });
    });

    it('debe lanzar ForbiddenException si no es admin', async () => {
      const currentUser = { id: 1, rol: 'cliente' };

      await expect(service.getEstadisticas(currentUser)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('procesarPago', () => {
    it('debe procesar un pago pendiente', async () => {
      const currentUser = { id: 1, rol: 'admin' };
      const pago = {
        id: 1,
        monto: 150.75,
        metodo: MetodoPago.EFECTIVO,
        estado: EstadoPago.PENDIENTE,
        pedido: { id: 1 }
      } as any;

      pagoRepo.findOne.mockResolvedValue(pago);
      pagoRepo.save.mockResolvedValue({ ...pago, estado: EstadoPago.COMPLETADO });

      // Mock Math.random para garantizar éxito
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = await service.procesarPago(1, currentUser);

      expect(pagoRepo.save).toHaveBeenCalled();
      expect(result.estado).toBe(EstadoPago.COMPLETADO);

      // Restaurar Math.random
      (Math.random as jest.Mock).mockRestore();
    });

    it('debe lanzar BadRequestException si el pago no está pendiente', async () => {
      const currentUser = { id: 1, rol: 'admin' };
      const pago = {
        id: 1,
        estado: EstadoPago.COMPLETADO,
        pedido: { id: 1 }
      } as any;

      pagoRepo.findOne.mockResolvedValue(pago);

      await expect(service.procesarPago(1, currentUser)).rejects.toThrow(
        BadRequestException
      );
    });
  });
});