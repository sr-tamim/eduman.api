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

  @ApiProperty({
    description: 'Route associated with the bus stop',
    type: () => BusRoute,
  })
  @ManyToOne(() => BusRoute, (busRoute) => busRoute.stops)
  declare route: Relation<BusRoute>;
}
