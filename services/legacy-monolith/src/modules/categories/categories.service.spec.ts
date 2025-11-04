import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: jest.Mocked<Repository<Category>>;

  beforeEach(async () => {
    const repositoryMock = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get(getRepositoryToken(Category));

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear una categoría exitosamente', async () => {
      const createCategoryDto: CreateCategoryDto = {
        nombre: 'Bebidas Calientes',
        descripcion: 'Cafés, tés y otras bebidas calientes',
      };

      const createdCategory = {
        id: 1,
        ...createCategoryDto,
        productos: [],
      } as Category;

      repository.create.mockReturnValue(createdCategory);
      repository.save.mockResolvedValue(createdCategory);

      const result = await service.create(createCategoryDto);

      expect(repository.create).toHaveBeenCalledWith(createCategoryDto);
      expect(repository.save).toHaveBeenCalledWith(createdCategory);
      expect(result).toEqual(createdCategory);
    });
  });

  describe('findAll', () => {
    it('debe retornar lista de categorías con productos', async () => {
      const categories = [
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
      ] as Category[];

      repository.find.mockResolvedValue(categories);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({ relations: ['productos'] });
      expect(result).toEqual(categories);
    });
  });

  describe('findOne', () => {
    it('debe retornar una categoría por ID con productos', async () => {
      const category = {
        id: 1,
        nombre: 'Bebidas Calientes',
        descripcion: 'Cafés, tés y otras bebidas calientes',
        productos: [],
      } as Category;

      repository.findOne.mockResolvedValue(category);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({ 
        where: { id: 1 }, 
        relations: ['productos'] 
      });
      expect(result).toEqual(category);
    });

    it('debe lanzar NotFoundException si la categoría no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Categoría 999 no encontrada')
      );
    });
  });

  describe('update', () => {
    it('debe actualizar una categoría exitosamente', async () => {
      const updateCategoryDto: UpdateCategoryDto = {
        descripcion: 'Nueva descripción actualizada',
      };

      const existingCategory = {
        id: 1,
        nombre: 'Bebidas Calientes',
        descripcion: 'Descripción antigua',
        productos: [],
      } as Category;

      const updatedCategory = {
        ...existingCategory,
        descripcion: updateCategoryDto.descripcion,
      } as Category;

      // Mock findOne para el método update
      jest.spyOn(service, 'findOne').mockResolvedValue(existingCategory);
      repository.save.mockResolvedValue(updatedCategory);

      const result = await service.update(1, updateCategoryDto);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(repository.save).toHaveBeenCalledWith(updatedCategory);
      expect(result).toEqual(updatedCategory);
    });

    it('debe actualizar solo los campos proporcionados', async () => {
      const updateCategoryDto: UpdateCategoryDto = {
        nombre: 'Nuevo nombre',
      };

      const existingCategory = {
        id: 1,
        nombre: 'Nombre anterior',
        descripcion: 'Descripción que no debe cambiar',
        productos: [],
      } as Category;

      const updatedCategory = {
        ...existingCategory,
        nombre: updateCategoryDto.nombre,
      } as Category;

      jest.spyOn(service, 'findOne').mockResolvedValue(existingCategory);
      repository.save.mockResolvedValue(updatedCategory);

      const result = await service.update(1, updateCategoryDto);

      expect(result.nombre).toBe(updateCategoryDto.nombre);
      expect(result.descripcion).toBe(existingCategory.descripcion);
    });
  });

  describe('replace', () => {
    it('debe reemplazar una categoría completamente', async () => {
      const replaceCategoryDto: CreateCategoryDto = {
        nombre: 'Bebidas Frías',
        descripcion: 'Jugos, refrescos y bebidas frías',
      };

      const existingCategory = {
        id: 1,
        nombre: 'Nombre anterior',
        descripcion: 'Descripción anterior',
        productos: [],
      } as Category;

      const replacedCategory = {
        ...existingCategory,
        ...replaceCategoryDto,
      } as Category;

      repository.findOne.mockResolvedValue(existingCategory);
      repository.save.mockResolvedValue(replacedCategory);

      const result = await service.replace(1, replaceCategoryDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.save).toHaveBeenCalledWith(replacedCategory);
      expect(result).toEqual(replacedCategory);
    });

    it('debe lanzar NotFoundException si la categoría no existe', async () => {
      const replaceCategoryDto: CreateCategoryDto = {
        nombre: 'Bebidas Frías',
        descripcion: 'Jugos, refrescos y bebidas frías',
      };

      repository.findOne.mockResolvedValue(null);

      await expect(service.replace(999, replaceCategoryDto)).rejects.toThrow(
        new NotFoundException('Categoría 999 no encontrada')
      );
    });
  });

  describe('remove', () => {
    it('debe eliminar una categoría exitosamente', async () => {
      const category = {
        id: 1,
        nombre: 'Bebidas Calientes',
        descripcion: 'Descripción',
        productos: [],
      } as Category;

      jest.spyOn(service, 'findOne').mockResolvedValue(category);
      repository.remove.mockResolvedValue(category);

      const result = await service.remove(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(repository.remove).toHaveBeenCalledWith(category);
      expect(result).toEqual({ message: 'Categoría 1 eliminada exitosamente' });
    });

    it('debe lanzar NotFoundException si la categoría no existe', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(
        new NotFoundException('Categoría 999 no encontrada')
      );

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});