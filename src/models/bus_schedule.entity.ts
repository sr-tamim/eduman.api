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
export default class BusSchedule {
  @PrimaryGeneratedColumn()
  declare id: number;

  @ManyToOne(() => BusRoute, (busRoute) => busRoute.schedules)
  declare route: Relation<BusRoute>;

  @Column('time')
  declare departureTime: Date;

  @Column('time')
  declare arrivalTime: Date;

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn()
  declare updatedAt: Date;
}
