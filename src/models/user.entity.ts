import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export default class User {
  @PrimaryGeneratedColumn({ type: 'int' })
  declare id: number;

  @Column({ type: 'varchar', length: 255 })
  declare name: string;

  @Column({ type: 'varchar', length: 255 })
  declare email: string;

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

  @CreateDateColumn({ type: 'timestamp with time zone' })
  declare createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', nullable: true })
  declare updatedAt: Date;
}
