import { Entity, Column, ManyToOne, Relation } from 'typeorm';
import BusRoute from './bus_route.entity';
import EntityBase from 'src/entity.base';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export default class BusStop extends EntityBase {
  @ApiProperty({ description: 'Name of the bus stop', maxLength: 255 })
  @Column({ type: 'varchar', length: '255' })
  declare name: string;

  @ApiProperty({ description: 'Latitude of the bus stop', nullable: true })
  @Column({ type: 'double precision', nullable: true })
  declare latitude: number;

  @ApiProperty({ description: 'Longitude of the bus stop', nullable: true })
  @Column({ type: 'double precision', nullable: true })
  declare longitude: number;

  @ApiProperty({ description: 'Sequence/order of the stop in the route' })
  @Column({ type: 'int', default: 0 })
  declare sequence: number;

  @ApiProperty({
    description: 'Scheduled arrival time at this stop',
    nullable: true,
    required: false,
    example: new Date().toISOString().split('T')[1].slice(0, 5),
  })
  @Column({ type: 'time', nullable: true })
  declare scheduled_arrival_time: Date | null;

  @ApiProperty({
    description: 'Route associated with the bus stop',
    type: () => BusRoute,
    required: false,
  })
  @ManyToOne(() => BusRoute, (busRoute) => busRoute.stops, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  declare route: Relation<BusRoute>;
}
