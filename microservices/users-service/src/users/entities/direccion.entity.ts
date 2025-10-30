import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'direcciones' })
export class Direccion {
  @PrimaryGeneratedColumn({ name: 'id_direccion' })
  id!: number;

  @Column({ name: 'direccion', type: 'varchar', length: 255 })
  direccion!: string;

  @Column({ name: 'ciudad', type: 'varchar', length: 100, nullable: true })
  ciudad?: string | null;

  @Column({ name: 'referencia', type: 'text', nullable: true })
  referencia?: string | null;

  @ManyToOne(() => User, (u) => u.direcciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: User;
}
