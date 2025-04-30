import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, ManyToOne, Relation } from 'typeorm';
import EntityBase from 'src/entity.base';
import BusJourney from './bus_journey.entity';
import BusStop from './bus_stop.entity';

@Entity()
export default class BusJourneyCheckIn extends EntityBase {
  @ApiProperty({
    description: 'Journey this check-in is associated with',
    type: () => BusJourney,
  })
  @ManyToOne(() => BusJourney, (journey) => journey.checkIns)
  declare journey: Relation<BusJourney>;

  @ApiProperty({
    description: 'Bus stop if this check-in was at a designated stop',
    type: () => BusStop,
    nullable: true,
  })
  @ManyToOne(() => BusStop, { nullable: true })
  declare bus_stop: Relation<BusStop> | null;

  @ApiProperty({ description: 'Time of check-in' })
  @Column({ type: 'timestamp with time zone' })
  declare check_in_time: Date;

  @ApiProperty({ description: 'Latitude of check-in location' })
  @Column({ type: 'double precision' })
  declare latitude: number;

  @ApiProperty({ description: 'Longitude of check-in location' })
  @Column({ type: 'double precision' })
  declare longitude: number;

  @ApiProperty({ description: 'Optional location name', nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  declare location_name: string | null;

  @ApiProperty({ description: 'Notes about this check-in', nullable: true })
  @Column({ type: 'text', nullable: true })
  declare notes: string | null;
}
