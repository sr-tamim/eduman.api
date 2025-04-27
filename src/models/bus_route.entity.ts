import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Relation,
} from 'typeorm';
import BusStop from './bus_stop.entity';
import BusSchedule from './bus_schedule.entity.js';

@Entity()
export default class BusRoute {
  @PrimaryGeneratedColumn({ type: 'int' })
  declare id: number;

  @Column({ type: 'varchar', length: 255 })
  declare name: string;

  @Column({ type: 'text', nullable: true })
  declare description: string;

  @OneToMany(() => BusStop, (busStop) => busStop.route)
  declare stops: Relation<BusStop>[];

  @OneToMany(() => BusSchedule, (busSchedule) => busSchedule.route)
  declare schedules: Relation<BusSchedule>[];

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  declare updatedAt: Date;
}
