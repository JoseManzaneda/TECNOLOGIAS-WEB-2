export class ProductResponseDto {
  id!: number;
  nombre!: string;
  descripcion?: string;
  precio!: number;
  stock!: number;
  disponible!: boolean;
  imagenUrl?: string;
  categoryId!: number;
  categoriaNombre?: string;
}

export class ProductBasicDto {
  id!: number;
  nombre!: string;
  precio!: number;
  disponible!: boolean;
}

export class ProductStockDto {
  id!: number;
  nombre!: string;
  stock!: number;
  disponible!: boolean;
}
