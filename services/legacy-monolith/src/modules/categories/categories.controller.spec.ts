import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let categoriesService: jest.Mocked<CategoriesService>;

  beforeEach(async () => {
    const categoriesServiceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      replace: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: categoriesServiceMock,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<CategoriesController>(CategoriesController);
    categoriesService = module.get(CategoriesService);
  });

  describe('create', () => {
    it('debe crear una categoría exitosamente', async () => {
      const createCategoryDto: CreateCategoryDto = {
        nombre: 'Bebidas Calientes',
        descripcion: 'Cafés, tés y otras bebidas calientes',
      };

      const expectedResult = {
        id: 1,
        nombre: 'Bebidas Calientes',
        descripcion: 'Cafés, tés y otras bebidas calientes',
        productos: [],
      };

      categoriesService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createCategoryDto);

      expect(categoriesService.create).toHaveBeenCalledWith(createCategoryDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('debe retornar lista de categorías', async () => {
      const expectedResult = [
        {
          id: 1,
          nombre: 'Bebidas Calientes',
          descripcion: 'Cafés, tés y otras bebidas calientes',
          productos: [],
        },
        {
          id: 2,
          nombre: 'Postres',
          descripcion: 'Dulces y postres varios',
          productos: [],
        },
      ];

      categoriesService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(categoriesService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('debe retornar una categoría por ID', async () => {
      const expectedResult = {
        id: 1,
        nombre: 'Bebidas Calientes',
        descripcion: 'Cafés, tés y otras bebidas calientes',
        productos: [],
      };

      categoriesService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(1);

      expect(categoriesService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar NotFoundException si la categoría no existe', async () => {
      categoriesService.findOne.mockRejectedValue(
        new NotFoundException('Categoría 999 no encontrada')
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar una categoría exitosamente', async () => {
      const updateCategoryDto: UpdateCategoryDto = {
        descripcion: 'Nueva descripción actualizada',
      };

      const expectedResult = {
        id: 1,
        nombre: 'Bebidas Calientes',
        descripcion: 'Nueva descripción actualizada',
        productos: [],
      };

      categoriesService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(1, updateCategoryDto);

      expect(categoriesService.update).toHaveBeenCalledWith(1, updateCategoryDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('replace', () => {
    it('debe reemplazar una categoría exitosamente', async () => {
      const replaceCategoryDto: CreateCategoryDto = {
        nombre: 'Bebidas Frías',
        descripcion: 'Jugos, refrescos y bebidas frías',
      };

      const expectedResult = {
        id: 1,
        nombre: 'Bebidas Frías',
        descripcion: 'Jugos, refrescos y bebidas frías',
        productos: [],
      };

      categoriesService.replace.mockResolvedValue(expectedResult);

      const result = await controller.replace(1, replaceCategoryDto);

      expect(categoriesService.replace).toHaveBeenCalledWith(1, replaceCategoryDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('debe eliminar una categoría exitosamente', async () => {
      const expectedResult = { message: 'Categoría 1 eliminada exitosamente' };

      categoriesService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(1);

      expect(categoriesService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });

    it('debe lanzar NotFoundException si la categoría no existe', async () => {
      categoriesService.remove.mockRejectedValue(
        new NotFoundException('Categoría 999 no encontrada')
      );

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});