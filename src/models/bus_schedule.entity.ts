import { Entity, Column, ManyToOne, Relation } from 'typeorm';
import BusRoute from './bus_route.entity';
import Bus from './bus.entity';
import EntityBase from 'src/entity.base';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export default class BusSchedule extends EntityBase {
  @ApiProperty({
    description: 'Route associated with the bus schedule',
    type: () => BusRoute,
  })
  @ManyToOne(() => BusRoute, (busRoute) => busRoute.schedules, {
    onDelete: 'CASCADE',
  })
  declare route: Relation<BusRoute>;

  @ApiProperty({
    description: 'Bus assigned to this schedule',
    type: () => Bus,
    nullable: true,
  })
  @ManyToOne(() => Bus, (bus) => bus.schedules, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  declare bus: Relation<Bus> | null;

  @ApiProperty({ description: 'Departure time of the bus' })
  @Column('time')
  declare departureTime: Date;

  @ApiProperty({ description: 'Arrival time of the bus' })
  @Column('time')
  declare arrivalTime: Date;

  @ApiProperty({
    description: 'Days of week this schedule runs (0-6, 0=Sunday)',
    type: 'array',
    items: { type: 'integer', minimum: 0, maximum: 6 },
  })
  @Column({
    type: 'int',
    array: true,
    default: '{0,1,2,3,4,5,6}',
    name: 'operating_days',
  })
  declare operatingDays: number[];

  @ApiProperty({ description: 'Whether this schedule is active' })
  @Column({ type: 'boolean', default: true })
  declare isActive: boolean;
}
