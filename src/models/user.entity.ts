import { Exclude } from 'class-transformer';
import EntityBase from 'src/entity.base';
import { Entity, Column } from 'typeorm';

@Entity()
export default class User extends EntityBase {
  @Column({ type: 'varchar', length: 255 })
  declare name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  declare email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 500 })
  declare password_hash: string;

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
}
