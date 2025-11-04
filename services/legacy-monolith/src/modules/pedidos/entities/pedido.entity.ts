import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { MetodoPago } from '../../../common/enums/metodo-pago.enum';

export { MetodoPago };

export enum EstadoPedido {
  PENDIENTE = 'pendiente',
  EN_PREPARACION = 'en_preparacion',
  LISTO = 'listo',
  ENTREGADO = 'entregado',
  CANCELADO = 'cancelado',
}

@Entity('pedidos')
export class Pedido {
    @PrimaryGeneratedColumn({ name: 'id_pedido' })
  id!: number;

  @Column({ name: 'id_usuario', nullable: true })
  userId!: number;

  @CreateDateColumn({ name: 'fecha' })
  fecha!: Date;

  @Column({
    name: 'estado',
    type: 'enum',
    enum: EstadoPedido,
    enumName: 'estado_pedido_enum',
    default: EstadoPedido.PENDIENTE,
  })
  estado!: EstadoPedido;

  @Column({
    name: 'metodo_pago',
    type: 'enum',
    enum: MetodoPago,
    enumName: 'metodo_pago_enum',
    default: MetodoPago.EFECTIVO,
  })
  metodoPago!: MetodoPago;

  @Column({ name: 'total', type: 'decimal', precision: 10, scale: 2, nullable: true })
  total?: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario?: User;

  @OneToMany('PedidoDetalle', 'pedido', { cascade: true })
  detalles?: any[];
}