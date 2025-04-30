import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import EntityBase from 'src/entity.base';
import { Entity, Column, OneToMany, Relation } from 'typeorm';
import BusManager from './bus_manager.entity';

@Entity()
export default class User extends EntityBase {
  @ApiProperty({ description: 'Name of the user', maxLength: 255 })
  @Column({ type: 'varchar', length: 255 })
  declare name: string;

  @ApiProperty({
    description: 'Email of the user',
    maxLength: 255,
    uniqueItems: true,
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  declare email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 500 })
  declare password_hash: string;

  @ApiProperty({
    description: 'Role of the user',
    enum: ['student', 'teacher', 'admin', 'moderator'],
    default: 'student',
  })
  @Column({
    type: 'enum',
    enum: ['student', 'teacher', 'admin', 'moderator'],
    default: 'student',
  })
  declare role: 'student' | 'teacher' | 'admin' | 'moderator';

  @Column({ type: 'varchar', length: 10, nullable: true })
  declare reset_pass_otp: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  declare otp_issued_at: Date | null;

  @ApiProperty({
    description: 'Buses managed by this user',
    type: () => [BusManager],
  })
  @OneToMany(() => BusManager, (busManager) => busManager.user)
  declare managed_buses: Relation<BusManager>[];
}
