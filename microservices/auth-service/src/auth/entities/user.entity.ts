import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type UserRole = 'cliente' | 'admin';

/**
 * Entidad de Usuario para Auth Service
 * Solo contiene datos necesarios para autenticación
 * Los datos completos del perfil están en Users Service
 */
@Entity({ name: 'usuarios' })
export class User {
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email!: string;

  @Column({ name: 'contraseña', type: 'varchar', length: 255 })
  contraseña!: string;

  @Column({ type: 'enum', enum: ['cliente', 'admin'], default: 'cliente' })
  rol!: UserRole;

  @Column({ 
    name: 'fecha_registro', 
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP' 
  })
  fechaRegistro!: Date;
}
