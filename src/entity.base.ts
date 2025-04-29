import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export default class EntityBase {
  @PrimaryGeneratedColumn({ type: 'int' })
  declare id: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  declare created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', nullable: true })
  declare updated_at: Date;
}
