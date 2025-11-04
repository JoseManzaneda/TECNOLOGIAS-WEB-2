import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('direcciones')
export class Direccion {
  @PrimaryGeneratedColumn({ name: 'id_direccion' })
  id!: number;

  @Column({ name: 'id_usuario', nullable: true })
  userId!: number;

  @Column({ name: 'direccion', type: 'varchar', length: 255 })
  direccion!: string;

  @Column({ name: 'ciudad', type: 'varchar', length: 100, nullable: true })
  ciudad?: string;

  @Column({ name: 'referencia', type: 'text', nullable: true })
  referencia?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario?: User;
}