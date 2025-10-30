import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity({ name: 'productos' })
export class Product {
  @PrimaryGeneratedColumn({ name: 'id_producto' })
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio!: string; // TypeORM devuelve decimal como string

  @ManyToOne(() => Category, (c) => c.productos, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_categoria' })
  categoria?: Category | null;

  @Column({ name: 'imagen_url', type: 'varchar', length: 255, nullable: true })
  imagenUrl?: string | null;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ type: 'tinyint', width: 1, default: 1 })
  disponible!: boolean;
}
