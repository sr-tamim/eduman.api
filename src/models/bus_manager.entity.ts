import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, ManyToOne, Relation } from 'typeorm';
import EntityBase from 'src/entity.base';
import User from './user.entity';
import Bus from './bus.entity';

@Entity()
export default class BusManager extends EntityBase {
  @ApiProperty({
    description: 'User who manages the bus',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.managed_buses)
  declare user: Relation<User>;

  @ApiProperty({
    description: 'Bus being managed',
    type: () => Bus,
  })
  @ManyToOne(() => Bus, (bus) => bus.managers)
  declare bus: Relation<Bus>;

  @ApiProperty({
    description: 'Role of the manager for this bus',
    enum: ['driver', 'conductor', 'supervisor', 'maintenance'],
    default: 'driver',
  })
  @Column({
    type: 'enum',
    enum: ['driver', 'conductor', 'supervisor', 'maintenance'],
    default: 'driver',
  })
  declare role: 'driver' | 'conductor' | 'supervisor' | 'maintenance';

  @ApiProperty({ description: 'License number (for drivers)', nullable: true })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'license_number',
  })
  declare license_number: string | null;

  @ApiProperty({ description: 'Date when manager was assigned to this bus' })
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'assigned_at',
  })
  declare assigned_at: Date;

  @ApiProperty({
    description: 'Whether the manager is currently active',
    default: true,
  })
  @Column({ type: 'boolean', default: true, name: 'is_active' })
  declare is_active: boolean;

  @ApiProperty({ description: 'Notes about the manager', nullable: true })
  @Column({ type: 'text', nullable: true })
  declare notes: string | null;
}
