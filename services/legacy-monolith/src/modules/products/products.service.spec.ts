import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepo: jest.Mocked<Repository<Product>>;
  let categoryRepo: jest.Mocked<Repository<Category>>;

  beforeEach(async () => {
    const productRepoMock = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };
    const categoryRepoMock = {
      findOne: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: productRepoMock },
        { provide: getRepositoryToken(Category), useValue: categoryRepoMock },
      ],
    }).compile();
    service = module.get<ProductsService>(ProductsService);
    productRepo = module.get(getRepositoryToken(Product));
    categoryRepo = module.get(getRepositoryToken(Category));
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear un producto con categoría', async () => {
      const dto: CreateProductDto = {
        nombre: 'Café',
        precio: 10,
        categoryId: 1,
      };
      const category = { id: 1, nombre: 'Bebidas', productos: [] } as Category;
      categoryRepo.findOne.mockResolvedValue(category);
      const product = { ...dto, categoria: category } as Product;
      productRepo.create.mockReturnValue(product);
      productRepo.save.mockResolvedValue(product);
      const result = await service.create(dto);
      expect(categoryRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(productRepo.create).toHaveBeenCalled();
      expect(productRepo.save).toHaveBeenCalledWith(product);
      expect(result.categoria).toEqual(category);
    });
    it('debe crear un producto sin categoría', async () => {
      const dto: CreateProductDto = {
        nombre: 'Torta',
        precio: 15,
      };
      categoryRepo.findOne.mockResolvedValue(null);
      const product = { ...dto } as Product;
      productRepo.create.mockReturnValue(product);
      productRepo.save.mockResolvedValue(product);
      const result = await service.create(dto);
      expect(result.categoria).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('debe retornar todos los productos con categoría', async () => {
      const products = [
        { id: 1, nombre: 'Café', categoria: { id: 1, nombre: 'Bebidas' } } as Product,
      ];
      productRepo.find.mockResolvedValue(products);
      const result = await service.findAll();
      expect(productRepo.find).toHaveBeenCalledWith({ relations: ['categoria'] });
      expect(result).toEqual(products);
    });
  });

  describe('findOne', () => {
    it('debe retornar un producto por id', async () => {
      const product = { id: 1, nombre: 'Café', categoria: { id: 1, nombre: 'Bebidas' } } as Product;
      productRepo.findOne.mockResolvedValue(product);
      const result = await service.findOne(1);
      expect(productRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['categoria'] });
      expect(result).toEqual(product);
    });
    it('debe lanzar NotFoundException si no existe', async () => {
      productRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar producto y categoría', async () => {
      const product = { id: 1, nombre: 'Café', categoria: null } as Product;
      const dto: UpdateProductDto = { nombre: 'Café Premium', categoryId: 2 };
      const category = { id: 2, nombre: 'Especiales' } as Category;
      jest.spyOn(service, 'findOne').mockResolvedValue(product);
      categoryRepo.findOne.mockResolvedValue(category);
      productRepo.save.mockResolvedValue({ ...product, nombre: dto.nombre! , categoria: category });
      const result = await service.update(1, dto);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(categoryRepo.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(result.nombre).toBe('Café Premium');
      expect(result.categoria).toEqual(category);
    });
    it('debe lanzar NotFoundException si la categoría no existe', async () => {
      const product = { id: 1, nombre: 'Café', categoria: null } as Product;
      const dto: UpdateProductDto = { categoryId: 99 };
      jest.spyOn(service, 'findOne').mockResolvedValue(product);
      categoryRepo.findOne.mockResolvedValue(null);
      await expect(service.update(1, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('replace', () => {
    it('debe reemplazar producto completamente', async () => {
      const product = { id: 1, nombre: 'Café', categoria: null } as Product;
      const dto: CreateProductDto = { nombre: 'Café Premium', precio: 12, categoryId: 2 };
      const category = { id: 2, nombre: 'Especiales' } as Category;
      productRepo.findOne.mockResolvedValue(product);
      categoryRepo.findOne.mockResolvedValue(category);
      productRepo.save.mockResolvedValue({ ...product, ...dto, categoria: category });
      const result = await service.replace(1, dto);
      expect(productRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(categoryRepo.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(result.nombre).toBe('Café Premium');
      expect(result.categoria).toEqual(category);
    });
    it('debe lanzar NotFoundException si el producto no existe', async () => {
      productRepo.findOne.mockResolvedValue(null);
      const dto: CreateProductDto = { nombre: 'Café Premium', precio: 12 };
      await expect(service.replace(99, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debe eliminar producto exitosamente', async () => {
      const product = { id: 1, nombre: 'Café' } as Product;
      jest.spyOn(service, 'findOne').mockResolvedValue(product);
      productRepo.remove.mockResolvedValue(product);
      const result = await service.remove(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(productRepo.remove).toHaveBeenCalledWith(product);
      expect(result).toEqual({ message: 'Producto 1 eliminado exitosamente' });
    });
    it('debe lanzar NotFoundException si el producto no existe', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Producto 999 no encontrado'));
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
