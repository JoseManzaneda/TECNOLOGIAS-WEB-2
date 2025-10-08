import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('pedido_detalle')
export class PedidoDetalle {
  @PrimaryGeneratedColumn({ name: 'id_detalle' })
  id!: number;

  @Column({ name: 'id_pedido', nullable: true })
  pedidoId!: number;

  @Column({ name: 'id_producto', nullable: true })
  productoId!: number;

  @Column({ name: 'cantidad', type: 'int' })
  cantidad!: number;

  @Column({ name: 'precio_unitario', type: 'decimal', precision: 10, scale: 2 })
  precioUnitario!: number;

  @ManyToOne('Pedido', 'detalles', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_pedido' })
  pedido?: any;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_producto' })
  producto?: Product;
}