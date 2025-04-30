import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, ManyToOne, Relation, OneToMany } from 'typeorm';
import BusRoute from './bus_route.entity';
import EntityBase from 'src/entity.base';
import BusManager from './bus_manager.entity';

@Entity()
export default class Bus extends EntityBase {
  @ApiProperty({ description: 'Registration number of the bus', maxLength: 50 })
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    name: 'registration_number',
  })
  declare registration_number: string;

  @ApiProperty({ description: 'Model of the bus', maxLength: 100 })
  @Column({ type: 'varchar', length: 100 })
  declare model: string;

  @ApiProperty({ description: 'Capacity of the bus (number of seats)' })
  @Column({ type: 'int' })
  declare capacity: number;

  @ApiProperty({ description: 'Year of manufacture' })
  @Column({ type: 'int', nullable: true, name: 'year_of_manufacture' })
  declare year_of_manufacture: number;

  @ApiProperty({ description: 'Current status of the bus', default: 'active' })
  @Column({
    type: 'enum',
    enum: ['active', 'maintenance', 'inactive'],
    default: 'active',
  })
  declare status: 'active' | 'maintenance' | 'inactive';

  @ApiProperty({ description: 'Notes about the bus', nullable: true })
  @Column({ type: 'text', nullable: true })
  declare notes: string;

  @ApiProperty({
    description: 'Route associated with the bus',
    type: () => BusRoute,
    nullable: true,
  })
  @ManyToOne(() => BusRoute, (busRoute) => busRoute.buses, { nullable: true })
  declare assigned_route: Relation<BusRoute>;

  @ApiProperty({
    description: 'Managers of this bus',
    type: () => [BusManager],
  })
  @OneToMany(() => BusManager, (busManager) => busManager.bus)
  declare managers: Relation<BusManager>[];
}
