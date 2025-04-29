import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import BusRoute from 'src/models/bus_route.entity';
import BusSchedule from 'src/models/bus_schedule.entity';
import BusStop from 'src/models/bus_stop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BusRoute, BusSchedule, BusStop])],
  providers: [],
  controllers: [],
})
export default class BusModule {}
