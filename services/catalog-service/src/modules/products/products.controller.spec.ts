import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: jest.Mocked<ProductsService>;

  beforeEach(async () => {
    const productsServiceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      replace: jest.fn(),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useValue: productsServiceMock },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get<ProductsController>(ProductsController);
    productsService = module.get(ProductsService);
  });

  describe('create', () => {
    it('debe crear un producto exitosamente', async () => {
      const dto: CreateProductDto = {
        nombre: 'Café',
        precio: 10,
        categoryId: 1,
      };
      const expected = { id: 1, ...dto, stock: 10, disponible: true };
      productsService.create.mockResolvedValue(expected);
      const result = await controller.create(dto);
      expect(productsService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('debe retornar lista de productos', async () => {
      const expected = [{ id: 1, nombre: 'Café', precio: 10, stock: 10, disponible: true }];
      productsService.findAll.mockResolvedValue(expected);
      const result = await controller.findAll();
      expect(productsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('debe retornar un producto por id', async () => {
      const expected = { id: 1, nombre: 'Café', precio: 10, stock: 10, disponible: true };
      productsService.findOne.mockResolvedValue(expected);
      const result = await controller.findOne(1);
      expect(productsService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expected);
    });
    it('debe lanzar NotFoundException si no existe', async () => {
      productsService.findOne.mockRejectedValue(new NotFoundException('Producto 999 no encontrado'));
      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar un producto exitosamente', async () => {
      const dto: UpdateProductDto = { nombre: 'Café Premium' };
      const expected = { id: 1, nombre: 'Café Premium', precio: 12, stock: 10, disponible: true };
      productsService.update.mockResolvedValue(expected);
      const result = await controller.update(1, dto);
      expect(productsService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('replace', () => {
    it('debe reemplazar un producto exitosamente', async () => {
      const dto: CreateProductDto = { nombre: 'Café Premium', precio: 12 };
      const expected = { id: 1, ...dto, stock: 10, disponible: true };
      productsService.replace.mockResolvedValue(expected);
      const result = await controller.replace(1, dto);
      expect(productsService.replace).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('debe eliminar un producto exitosamente', async () => {
      const expected = { message: 'Producto 1 eliminado exitosamente' };
      productsService.remove.mockResolvedValue(expected);
      const result = await controller.remove(1);
      expect(productsService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(expected);
    });
    it('debe lanzar NotFoundException si el producto no existe', async () => {
      productsService.remove.mockRejectedValue(new NotFoundException('Producto 999 no encontrado'));
      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
