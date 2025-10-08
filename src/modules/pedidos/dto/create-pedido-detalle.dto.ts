import { IsInt, IsPositive, IsNotEmpty } from 'class-validator';

export class CreatePedidoDetalleDto {
  @IsInt({ message: 'El ID del producto debe ser un número entero' })
  @IsPositive({ message: 'El ID del producto debe ser positivo' })
  productoId!: number;

  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @IsPositive({ message: 'La cantidad debe ser mayor a 0' })
  cantidad!: number;
}