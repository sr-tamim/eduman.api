import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Raw } from 'typeorm';
import BusRoute from 'src/models/bus_route.entity';
import BusStop from 'src/models/bus_stop.entity';
import BusSchedule from 'src/models/bus_schedule.entity';
import Bus from 'src/models/bus.entity';
import {
  CreateBusRouteDto,
  UpdateBusRouteDto,
  CreateBusStopDto,
  UpdateBusStopDto,
  CreateBusScheduleDto,
  UpdateBusScheduleDto,
  BusScheduleFilterDto,
  RouteWithStopsDto,
} from 'src/dto/bus_schedule.dto';

@Injectable()
export default class BusScheduleService {
  constructor(
    @InjectRepository(BusRoute)
    private busRouteRepository: Repository<BusRoute>,
    @InjectRepository(BusStop)
    private busStopRepository: Repository<BusStop>,
    @InjectRepository(BusSchedule)
    private busScheduleRepository: Repository<BusSchedule>,
    @InjectRepository(Bus)
    private busRepository: Repository<Bus>,
  ) {}

  // Route management
  async getAllRoutes() {
    return this.busRouteRepository.find({
      relations: ['stops'],
    });
  }

  async getRouteById(id: number) {
    const route = await this.busRouteRepository.findOne({
      where: { id },
      relations: ['stops', 'schedules'],
    });

    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }

    return route;
  }

  async createRoute(createRouteDto: CreateBusRouteDto) {
    const route = this.busRouteRepository.create(createRouteDto);
    return this.busRouteRepository.save(route);
  }

  async updateRoute(id: number, updateRouteDto: UpdateBusRouteDto) {
    const route = await this.getRouteById(id);
    Object.assign(route, updateRouteDto);
    return this.busRouteRepository.save(route);
  }

  async deleteRoute(id: number) {
    const route = await this.getRouteById(id);

    // Check if there are schedules associated with this route
    const schedulesCount = await this.busScheduleRepository.count({
      where: { route: { id } },
    });

    if (schedulesCount > 0) {
      throw new BadRequestException(
        `Cannot delete route: ${schedulesCount} schedules are associated with this route`,
      );
    }

    return this.busRouteRepository.remove(route);
  }

  // Bus Stop management
  async getAllStops() {
    return this.busStopRepository.find({
      relations: ['route'],
    });
  }

  async getStopById(id: number) {
    const stop = await this.busStopRepository.findOne({
      where: { id },
      relations: ['route'],
    });

    if (!stop) {
      throw new NotFoundException(`Bus stop with ID ${id} not found`);
    }

    return stop;
  }

  async getStopsByRouteId(routeId: number) {
    const route = await this.busRouteRepository.findOneBy({ id: routeId });
    if (!route) {
      throw new NotFoundException(`Route with ID ${routeId} not found`);
    }

    return this.busStopRepository.find({
      where: { route: { id: routeId } },
      order: { sequence: 'ASC' },
    });
  }

  async createStop(createStopDto: CreateBusStopDto) {
    // Check if route exists
    const route = await this.busRouteRepository.findOneBy({
      id: createStopDto.route_id,
    });
    if (!route) {
      throw new BadRequestException(
        `Route with ID ${createStopDto.route_id} not found`,
      );
    }

    const stop = this.busStopRepository.create({
      name: createStopDto.name,
      latitude: createStopDto.latitude,
      longitude: createStopDto.longitude,
      sequence: createStopDto.sequence || 0,
      scheduled_arrival_time: createStopDto.scheduled_arrival_time
        ? this.parseTimeString(createStopDto.scheduled_arrival_time)
        : null,
    });

    stop.route = route;
    return this.busStopRepository.save(stop);
  }

  async updateStop(id: number, updateStopDto: UpdateBusStopDto) {
    const stop = await this.getStopById(id);

    // If route_id is provided, verify and update the route
    if (updateStopDto.route_id !== undefined) {
      const route = await this.busRouteRepository.findOneBy({
        id: updateStopDto.route_id,
      });
      if (!route) {
        throw new BadRequestException(
          `Route with ID ${updateStopDto.route_id} not found`,
        );
      }
      stop.route = route;
      delete updateStopDto.route_id;
    }

    // Handle scheduled arrival time if provided
    if (updateStopDto.scheduled_arrival_time !== undefined) {
      if (updateStopDto.scheduled_arrival_time === null) {
        stop.scheduled_arrival_time = null;
      } else {
        stop.scheduled_arrival_time = this.parseTimeString(
          updateStopDto.scheduled_arrival_time,
        );
      }
      delete updateStopDto.scheduled_arrival_time;
    }

    Object.assign(stop, updateStopDto);
    return this.busStopRepository.save(stop);
  }

  async deleteStop(id: number) {
    const stop = await this.getStopById(id);
    return this.busStopRepository.remove(stop);
  }

  // Schedule management
  async getAllSchedules(filter?: BusScheduleFilterDto) {
    const whereClause: FindOptionsWhere<BusSchedule> = {};

    if (filter) {
      if (filter.route_id) {
        whereClause.route = { id: filter.route_id };
      }
      if (filter.bus_id) {
        whereClause.bus = { id: filter.bus_id };
      }
      if (filter.is_active !== undefined) {
        whereClause.isActive = filter.is_active;
      }
      if (filter.day_of_week !== undefined) {
        whereClause.operatingDays = Raw(
          (alias) => `${filter.day_of_week} = ANY(${alias})`,
        );
      }
    }

    return this.busScheduleRepository.find({
      where: whereClause,
      relations: ['route', 'bus'],
    });
  }

  async getScheduleById(id: number) {
    const schedule = await this.busScheduleRepository.findOne({
      where: { id },
      relations: ['route', 'bus'],
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    return schedule;
  }

  async createSchedule(createScheduleDto: CreateBusScheduleDto) {
    // Check if route exists
    const route = await this.busRouteRepository.findOneBy({
      id: createScheduleDto.route_id,
    });
    if (!route) {
      throw new BadRequestException(
        `Route with ID ${createScheduleDto.route_id} not found`,
      );
    }

    // Create schedule entity
    const schedule = this.busScheduleRepository.create({
      departureTime: this.parseTimeString(createScheduleDto.departure_time),
      arrivalTime: this.parseTimeString(createScheduleDto.arrival_time),
      operatingDays: createScheduleDto.operating_days || [0, 1, 2, 3, 4, 5, 6],
      isActive:
        createScheduleDto.is_active !== undefined
          ? createScheduleDto.is_active
          : true,
    });

    // Set relations
    schedule.route = route;

    // Set bus if provided
    if (createScheduleDto.bus_id) {
      const bus = await this.busRepository.findOneBy({
        id: createScheduleDto.bus_id,
      });
      if (!bus) {
        throw new BadRequestException(
          `Bus with ID ${createScheduleDto.bus_id} not found`,
        );
      }

      // Check if bus is active
      if (bus.status !== 'active') {
        throw new BadRequestException(
          `Cannot assign schedule to bus with ID ${createScheduleDto.bus_id}: Bus is ${bus.status}`,
        );
      }

      schedule.bus = bus;
    }

    return this.busScheduleRepository.save(schedule);
  }

  async updateSchedule(id: number, updateScheduleDto: UpdateBusScheduleDto) {
    const schedule = await this.getScheduleById(id);

    // Handle relations updates if IDs provided
    if (updateScheduleDto.route_id !== undefined) {
      const route = await this.busRouteRepository.findOneBy({
        id: updateScheduleDto.route_id,
      });
      if (!route) {
        throw new BadRequestException(
          `Route with ID ${updateScheduleDto.route_id} not found`,
        );
      }
      schedule.route = route;
      delete updateScheduleDto.route_id;
    }

    if (updateScheduleDto.bus_id !== undefined) {
      if (updateScheduleDto.bus_id === null) {
        schedule.bus = null;
      } else {
        const bus = await this.busRepository.findOneBy({
          id: updateScheduleDto.bus_id,
        });
        if (!bus) {
          throw new BadRequestException(
            `Bus with ID ${updateScheduleDto.bus_id} not found`,
          );
        }

        // Check if bus is active
        if (bus.status !== 'active') {
          throw new BadRequestException(
            `Cannot assign schedule to bus with ID ${updateScheduleDto.bus_id}: Bus is ${bus.status}`,
          );
        }

        schedule.bus = bus;
      }
      delete updateScheduleDto.bus_id;
    }

    // Handle time fields
    if (updateScheduleDto.departure_time) {
      schedule.departureTime = this.parseTimeString(
        updateScheduleDto.departure_time,
      );
      delete updateScheduleDto.departure_time;
    }

    if (updateScheduleDto.arrival_time) {
      schedule.arrivalTime = this.parseTimeString(
        updateScheduleDto.arrival_time,
      );
      delete updateScheduleDto.arrival_time;
    }

    // Handle operating days
    if (updateScheduleDto.operating_days) {
      schedule.operatingDays = updateScheduleDto.operating_days;
      delete updateScheduleDto.operating_days;
    }

    // Handle active status
    if (updateScheduleDto.is_active !== undefined) {
      schedule.isActive = updateScheduleDto.is_active;
      delete updateScheduleDto.is_active;
    }

    return this.busScheduleRepository.save(schedule);
  }

  async deleteSchedule(id: number) {
    const schedule = await this.getScheduleById(id);
    return this.busScheduleRepository.remove(schedule);
  }

  // Helper to parse time string (HH:MM) to Date
  private parseTimeString(timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);

    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      throw new BadRequestException(
        'Invalid time format. Expected HH:MM (24-hour format)',
      );
    }

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  // Create a route with stops in one operation
  async createRouteWithStops(routeWithStopsDto: RouteWithStopsDto) {
    // Create the route first
    const { stops, ...routeData } = routeWithStopsDto;
    const route = await this.createRoute(routeData);

    // Now create all the stops associated with this route
    const createdStops: BusStop[] = [];
    for (const stopDto of stops) {
      const stop = await this.createStop({
        ...stopDto,
        route_id: route.id,
      });
      createdStops.push(stop);
    }

    // Return the route with created stops
    return {
      ...route,
      stops: createdStops,
    };
  }

  // Get schedules for today - a useful helper method
  async getTodaySchedules(busId?: number, routeId?: number) {
    const today = new Date().getDay(); // 0-6 (Sunday-Saturday)

    const whereClause: FindOptionsWhere<BusSchedule> = {
      isActive: true,
      operatingDays: Raw((alias) => `${today} = ANY(${alias})`),
    };

    if (busId) {
      whereClause.bus = { id: busId };
    }

    if (routeId) {
      whereClause.route = { id: routeId };
    }

    return this.busScheduleRepository.find({
      where: whereClause,
      relations: ['route', 'bus', 'route.stops'],
      order: { departureTime: 'ASC' },
    });
  }
}
