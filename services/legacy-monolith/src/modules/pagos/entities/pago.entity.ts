import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { MetodoPago } from '../../../common/enums/metodo-pago.enum';

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
    enumName: 'metodo_pago_enum',
    nullable: true,
  })
  metodo!: MetodoPago;

  @CreateDateColumn({ name: 'fecha' })
  fecha!: Date;

  @Column({
    name: 'estado',
    type: 'enum',
    enum: EstadoPago,
    enumName: 'estado_pago_enum',
    default: EstadoPago.PENDIENTE,
  })
  estado!: EstadoPago;

  @ManyToOne('Pedido', 'pagos', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_pedido' })
  pedido?: any;
}