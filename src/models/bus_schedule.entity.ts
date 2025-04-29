import { Entity, Column, ManyToOne, Relation } from 'typeorm';
import BusRoute from './bus_route.entity';
import EntityBase from 'src/entity.base';

@Entity()
export default class BusSchedule extends EntityBase {
  @ManyToOne(() => BusRoute, (busRoute) => busRoute.schedules)
  declare route: Relation<BusRoute>;

  @Column('time')
  declare departureTime: Date;

  @Column('time')
  declare arrivalTime: Date;
}
