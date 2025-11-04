import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity({ name: 'categorias' })
export class Category {
  @PrimaryGeneratedColumn({ name: 'id_categoria' })
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string | null;

  @OneToMany(() => Product, (product) => product.categoria)
  productos!: Product[];
}