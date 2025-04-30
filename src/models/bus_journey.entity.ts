import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, ManyToOne, Relation, OneToMany } from 'typeorm';
import EntityBase from 'src/entity.base';
import Bus from './bus.entity';
import BusManager from './bus_manager.entity';
import BusRoute from './bus_route.entity';
import BusJourneyCheckIn from './bus_journey_checkin.entity';

@Entity()
export default class BusJourney extends EntityBase {
  @ApiProperty({
    description: 'Bus associated with this journey',
    type: () => Bus,
  })
  @ManyToOne(() => Bus, (bus) => bus.journeys)
  declare bus: Relation<Bus>;

  @ApiProperty({
    description: 'Route followed in this journey',
    type: () => BusRoute,
  })
  @ManyToOne(() => BusRoute)
  declare route: Relation<BusRoute>;

  @ApiProperty({
    description: 'Manager who started/operated the journey',
    type: () => BusManager,
  })
  @ManyToOne(() => BusManager)
  declare manager: Relation<BusManager>;

  @ApiProperty({ description: 'Date and time when journey started' })
  @Column({ type: 'timestamp with time zone' })
  declare start_time: Date;

  @ApiProperty({
    description: 'Date and time when journey ended',
    nullable: true,
  })
  @Column({ type: 'timestamp with time zone', nullable: true })
  declare end_time: Date | null;

  @ApiProperty({ description: 'Starting latitude coordinate' })
  @Column({ type: 'double precision' })
  declare start_latitude: number;

  @ApiProperty({ description: 'Starting longitude coordinate' })
  @Column({ type: 'double precision' })
  declare start_longitude: number;

  @ApiProperty({
    description: 'Ending latitude coordinate',
    nullable: true,
  })
  @Column({ type: 'double precision', nullable: true })
  declare end_latitude: number | null;

  @ApiProperty({
    description: 'Ending longitude coordinate',
    nullable: true,
  })
  @Column({ type: 'double precision', nullable: true })
  declare end_longitude: number | null;

  @ApiProperty({
    description: 'Current status of the journey',
    enum: ['in_progress', 'completed', 'cancelled'],
    default: 'in_progress',
  })
  @Column({
    type: 'enum',
    enum: ['in_progress', 'completed', 'cancelled'],
    default: 'in_progress',
  })
  declare status: 'in_progress' | 'completed' | 'cancelled';

  @ApiProperty({
    description: 'Additional notes about the journey',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  declare notes: string | null;

  @ApiProperty({
    description: 'Check-ins recorded during this journey',
    type: () => [BusJourneyCheckIn],
  })
  @OneToMany(() => BusJourneyCheckIn, (checkIn) => checkIn.journey)
  declare checkIns: Relation<BusJourneyCheckIn>[];
}
