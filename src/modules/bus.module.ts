import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import BusRoute from 'src/models/bus_route.entity';
import BusSchedule from 'src/models/bus_schedule.entity';
import BusStop from 'src/models/bus_stop.entity';
import Bus from 'src/models/bus.entity';
import BusManager from 'src/models/bus_manager.entity';
import BusJourney from 'src/models/bus_journey.entity';
import BusJourneyCheckIn from 'src/models/bus_journey_checkin.entity';
import BusService from 'src/services/bus.service';
import BusController from 'src/controllers/bus.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BusRoute,
      BusSchedule,
      BusStop,
      Bus,
      BusManager,
      BusJourney,
      BusJourneyCheckIn,
    ]),
  ],
  providers: [BusService],
  controllers: [BusController],
  exports: [BusService],
})
export default class BusModule {}
