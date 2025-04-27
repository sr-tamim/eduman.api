import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import BusRoute from './models/bus_route.entity';
import BusSchedule from './models/bus_schedule.entity';
import BusStop from './models/bus_stop.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([BusRoute, BusSchedule, BusStop]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
