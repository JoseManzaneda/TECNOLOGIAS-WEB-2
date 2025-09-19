import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
// Relaciones futuras: pedidos, direcciones, puntos, reservas.

export type UserRole = 'cliente' | 'admin';

@Entity({ name: 'usuarios' })
export class User {
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono?: string | null;

  @Column({ name: 'contraseña', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'enum', enum: ['cliente', 'admin'], default: 'cliente' })
  rol!: UserRole;

  @Column({ name: 'fecha_registro', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaRegistro!: Date;

  // Placeholder: para ilustrar cómo un usuario podría tener productos (si fuera creador). No se usará ahora.
  @OneToMany(() => Product, () => undefined, { nullable: true })
  productosCreados?: Product[];
}