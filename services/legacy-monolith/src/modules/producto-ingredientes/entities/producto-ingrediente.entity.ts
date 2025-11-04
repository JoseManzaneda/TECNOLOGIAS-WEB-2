import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Ingrediente } from '../../ingredientes/entities/ingrediente.entity';

@Entity('producto_ingredientes')
export class ProductoIngrediente {
  @PrimaryColumn({ name: 'id_producto' })
  productoId!: number;

  @PrimaryColumn({ name: 'id_ingrediente' })
  ingredienteId!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Cantidad del ingrediente necesaria para el producto'
  })
  cantidad?: number;

  // Notas: la tabla 'producto_ingredientes' en Postgres no tiene columnas de auditoría
  // como fecha_creacion o fecha_actualizacion. Se omiten para alinear con el esquema.

  // Relaciones
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_producto' })
  producto!: Product;

  @ManyToOne(() => Ingrediente, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_ingrediente' })
  ingrediente!: Ingrediente;
}