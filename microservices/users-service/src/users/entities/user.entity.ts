import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Direccion } from './direccion.entity';

export type UserRole = 'cliente' | 'admin';

@Entity({ name: 'usuarios' })
export class User {
  @PrimaryColumn({ name: 'id_usuario', type: 'int' })
  id!: number; // Igual al ID del auth-service

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono?: string | null;

  @Column({ type: 'enum', enum: ['cliente', 'admin'], default: 'cliente' })
  rol!: UserRole;

  @Column({ name: 'fecha_registro', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaRegistro!: Date;

  @OneToMany(() => Direccion, (d) => d.usuario)
  direcciones?: Direccion[];
}
