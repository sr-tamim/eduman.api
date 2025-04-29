import { Entity, Column, ManyToOne, Relation } from 'typeorm';
import BusRoute from './bus_route.entity';
import EntityBase from 'src/entity.base';

@Entity()
export default class BusStop extends EntityBase {
  @Column({ type: 'varchar', length: '255' })
  declare name: string;

  @Column({ type: 'double precision', nullable: true })
  declare latitude: number;

  @Column({ type: 'double precision', nullable: true })
  declare longitude: number;

  @ManyToOne(() => BusRoute, (busRoute) => busRoute.stops)
  declare route: Relation<BusRoute>;
}
