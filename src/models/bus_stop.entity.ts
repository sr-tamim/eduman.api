import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Relation,
} from 'typeorm';
import BusRoute from './bus_route.entity';

@Entity()
export default class BusStop {
  @PrimaryGeneratedColumn()
  declare id: number;

  @Column()
  declare name: string;

  @Column()
  declare location: string;

  @ManyToOne(() => BusRoute, (busRoute) => busRoute.stops)
  declare route: Relation<BusRoute>;

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn()
  declare updatedAt: Date;
}
