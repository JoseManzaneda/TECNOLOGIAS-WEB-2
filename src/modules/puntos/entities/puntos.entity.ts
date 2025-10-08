import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('puntos')
export class Puntos {
  @PrimaryGeneratedColumn({ name: 'id_puntos' })
  id!: number;

  @Column({ name: 'id_usuario' })
  userId!: number;

  @Column({
    name: 'puntos_acumulados',
    type: 'int',
    default: 0,
    comment: 'Puntos acumulados por el usuario'
  })
  puntosAcumulados!: number;

  @Column({
    name: 'ultima_actualizacion',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  ultimaActualizacion!: Date;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion!: Date;

  // Relación con usuario
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  user!: User;
}