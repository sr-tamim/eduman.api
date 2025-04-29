import { Entity, Column, OneToMany, Relation } from 'typeorm';
import BusStop from './bus_stop.entity';
import BusSchedule from './bus_schedule.entity.js';
import EntityBase from 'src/entity.base';

@Entity()
export default class BusRoute extends EntityBase {
  @Column({ type: 'varchar', length: 255 })
  declare name: string;

  @Column({ type: 'text', nullable: true })
  declare description: string;

  @OneToMany(() => BusStop, (busStop) => busStop.route)
  declare stops: Relation<BusStop>[];

  @OneToMany(() => BusSchedule, (busSchedule) => busSchedule.route)
  declare schedules: Relation<BusSchedule>[];
}
