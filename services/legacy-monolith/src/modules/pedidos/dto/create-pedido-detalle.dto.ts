import { IsInt, IsPositive, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePedidoDetalleDto {
  @ApiProperty({
    description: 'ID del producto a pedir',
    example: 1,
    minimum: 1
  })
  @IsInt({ message: 'El ID del producto debe ser un número entero' })
  @IsPositive({ message: 'El ID del producto debe ser positivo' })
  @Type(() => Number)
  idProducto!: number;

  @ApiProperty({
    description: 'Cantidad de unidades del producto',
    example: 2,
    minimum: 1
  })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @IsPositive({ message: 'La cantidad debe ser mayor a 0' })
  @Type(() => Number)
  cantidad!: number;

  @ApiProperty({
    description: 'Precio unitario del producto (opcional, se obtiene automáticamente si no se proporciona)',
    example: 25.50,
    required: false,
    minimum: 0.01
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio unitario debe ser un número con máximo 2 decimales' })
  @IsPositive({ message: 'El precio unitario debe ser mayor a 0' })
  @Type(() => Number)
  precioUnitario?: number;
}