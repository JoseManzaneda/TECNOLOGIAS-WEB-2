import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('ingredientes')
export class Ingrediente {
    @PrimaryGeneratedColumn({ name: 'id_ingrediente' })
  id!: number;

  @Column({ 
    type: 'varchar',
    length: 100,
    nullable: false
  })
  nombre!: string;

  @Column({ 
    type: 'varchar',
    length: 50,
    nullable: true
  })
  unidad?: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion!: Date;

  // Relación con productos a través de producto_ingredientes
  // Esta relación se manejará desde el módulo de productos
}