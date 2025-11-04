import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Direccion } from '../../direcciones/entities/direccion.entity';
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

  @Column({ name: 'contrasena', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'enum', enum: ['cliente', 'admin'], enumName: 'rol_usuario_enum', default: 'cliente' })
  rol!: UserRole;

  @Column({ name: 'fecha_registro', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaRegistro!: Date;

  // Relación con direcciones del usuario
  @OneToMany(() => Direccion, (direccion) => direccion.usuario)
  direcciones?: Direccion[];
}