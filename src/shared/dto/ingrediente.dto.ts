export class IngredienteResponseDto {
  id!: number;
  nombre!: string;
  unidad!: string;
}

export class ProductoIngredienteDto {
  productoId!: number;
  ingredienteId!: number;
  cantidad?: number;
  ingredienteNombre?: string;
  ingredienteUnidad?: string;
}
