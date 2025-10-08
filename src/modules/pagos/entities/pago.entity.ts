import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';

export enum MetodoPago {
  TARJETA = 'tarjeta',
  QR = 'qr',
  EFECTIVO = 'efectivo',
}

export enum EstadoPago {
  PENDIENTE = 'pendiente',
  COMPLETADO = 'completado',
  FALLIDO = 'fallido',
}

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn({ name: 'id_pago' })
  id!: number;

  @Column({ name: 'id_pedido', nullable: true })
  pedidoId!: number;

  @Column({ name: 'monto', type: 'decimal', precision: 10, scale: 2 })
  monto!: number;

  @Column({
    name: 'metodo',
    type: 'enum',
    enum: MetodoPago,
    nullable: true,
  })
  metodo!: MetodoPago;

  @CreateDateColumn({ name: 'fecha' })
  fecha!: Date;

  @Column({
    name: 'estado',
    type: 'enum',
    enum: EstadoPago,
    default: EstadoPago.PENDIENTE,
  })
  estado!: EstadoPago;

  @ManyToOne('Pedido', 'pagos', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_pedido' })
  pedido?: any;
}