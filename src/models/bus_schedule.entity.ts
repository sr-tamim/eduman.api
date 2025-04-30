import { Entity, Column, ManyToOne, Relation } from 'typeorm';
import BusRoute from './bus_route.entity';
import EntityBase from 'src/entity.base';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export default class BusSchedule extends EntityBase {
  @ApiProperty({
    description: 'Route associated with the bus schedule',
    type: () => BusRoute,
  })
  @ManyToOne(() => BusRoute, (busRoute) => busRoute.schedules)
  declare route: Relation<BusRoute>;

  @ApiProperty({ description: 'Departure time of the bus' })
  @Column('time')
  declare departureTime: Date;

  @ApiProperty({ description: 'Arrival time of the bus' })
  @Column('time')
  declare arrivalTime: Date;
}
