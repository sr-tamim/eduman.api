import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, OneToMany, Relation } from 'typeorm';
import BusStop from './bus_stop.entity';
import BusSchedule from './bus_schedule.entity.js';
import EntityBase from 'src/entity.base';

@Entity()
export default class BusRoute extends EntityBase {
  @ApiProperty({ description: 'Name of the bus route', maxLength: 255 })
  @Column({ type: 'varchar', length: 255 })
  declare name: string;

  @ApiProperty({ description: 'Description of the bus route', nullable: true })
  @Column({ type: 'text', nullable: true })
  declare description: string;

  @ApiProperty({
    description: 'List of bus stops associated with the route',
    type: () => [BusStop],
  })
  @OneToMany(() => BusStop, (busStop) => busStop.route)
  declare stops: Relation<BusStop>[];

  @ApiProperty({
    description: 'List of bus schedules associated with the route',
    type: () => [BusSchedule],
  })
  @OneToMany(() => BusSchedule, (busSchedule) => busSchedule.route)
  declare schedules: Relation<BusSchedule>[];
}
