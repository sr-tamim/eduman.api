import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, FindOptionsWhere } from 'typeorm';
import Bus from 'src/models/bus.entity';
import BusRoute from 'src/models/bus_route.entity';
import BusManager from 'src/models/bus_manager.entity';
import BusStop from 'src/models/bus_stop.entity';
import BusJourney from 'src/models/bus_journey.entity';
import BusJourneyCheckIn from 'src/models/bus_journey_checkin.entity';
import { CreateBusDto, UpdateBusDto, AssignManagerDto } from 'src/dto/bus.dto';
import {
  CreateJourneyDto,
  EndJourneyDto,
  CreateCheckInDto,
  UpdateBusOffDaysDto,
  BusLocationDto,
  BusFilterDto,
  JourneyFilterDto,
  CheckInFilterDto,
} from 'src/dto/bus_journey.dto';

@Injectable()
export default class BusService {
  constructor(
    @InjectRepository(Bus)
    private busRepository: Repository<Bus>,
    @InjectRepository(BusRoute)
    private busRouteRepository: Repository<BusRoute>,
    @InjectRepository(BusManager)
    private busManagerRepository: Repository<BusManager>,
    @InjectRepository(BusStop)
    private busStopRepository: Repository<BusStop>,
    @InjectRepository(BusJourney)
    private busJourneyRepository: Repository<BusJourney>,
    @InjectRepository(BusJourneyCheckIn)
    private busJourneyCheckInRepository: Repository<BusJourneyCheckIn>,
  ) {}

  // Bus CRUD operations with filtering
  async getAllBuses(filter?: BusFilterDto) {
    const whereClause: FindOptionsWhere<Bus> = {};

    if (filter) {
      if (filter.registration_number) {
        whereClause.registration_number = Like(
          `%${filter.registration_number}%`,
        );
      }
      if (filter.model) {
        whereClause.model = Like(`%${filter.model}%`);
      }
      if (filter.status) {
        whereClause.status = filter.status;
      }
      // Handle route filtering by relation
      if (filter.route_id) {
        return this.busRepository.find({
          where: {
            ...whereClause,
            assigned_route: { id: filter.route_id },
          },
          relations: ['assigned_route', 'managers', 'managers.user'],
        });
      }
    }

    return this.busRepository.find({
      where: whereClause,
      relations: ['assigned_route', 'managers', 'managers.user'],
    });
  }

  async getBusById(id: number) {
    const bus = await this.busRepository.findOne({
      where: { id },
      relations: ['assigned_route', 'managers', 'managers.user'],
    });

    if (!bus) {
      throw new NotFoundException(`Bus with ID ${id} not found`);
    }

    return bus;
  }

  async createBus(createBusDto: CreateBusDto) {
    const bus = this.busRepository.create(createBusDto);

    // If route_id is provided, find and assign the route
    if (createBusDto.route_id) {
      const route = await this.busRouteRepository.findOneBy({
        id: createBusDto.route_id,
      });
      if (!route) {
        throw new BadRequestException(
          `Route with ID ${createBusDto.route_id} not found`,
        );
      }
      bus.assigned_route = route;
    }

    return this.busRepository.save(bus);
  }

  async updateBus(id: number, updateBusDto: UpdateBusDto) {
    const bus = await this.getBusById(id);

    // Update route if route_id is provided
    if (updateBusDto.route_id !== undefined) {
      if (updateBusDto.route_id === null) {
        bus.assigned_route = null;
      } else {
        const route = await this.busRouteRepository.findOneBy({
          id: updateBusDto.route_id,
        });
        if (!route) {
          throw new BadRequestException(
            `Route with ID ${updateBusDto.route_id} not found`,
          );
        }
        bus.assigned_route = route;
      }
      delete updateBusDto.route_id;
    }

    // Update other bus properties
    Object.assign(bus, updateBusDto);
    return this.busRepository.save(bus);
  }

  async deleteBus(id: number) {
    const bus = await this.getBusById(id);
    return this.busRepository.remove(bus);
  }

  // Bus Manager operations
  async assignManager(assignManagerDto: AssignManagerDto) {
    // Check if bus exists
    const bus = await this.busRepository.findOneBy({
      id: assignManagerDto.bus_id,
    });
    if (!bus) {
      throw new BadRequestException(
        `Bus with ID ${assignManagerDto.bus_id} not found`,
      );
    }

    // Create new bus manager entry
    const busManager = this.busManagerRepository.create({
      role: assignManagerDto.role,
      license_number: assignManagerDto.license_number,
      notes: assignManagerDto.notes,
    });

    // Set relationships
    busManager.bus = bus;

    // Set user with find to validate existence first
    const user = { id: assignManagerDto.user_id } as any;
    busManager.user = user;

    return this.busManagerRepository.save(busManager);
  }

  async unassignManager(managerId: number) {
    const manager = await this.busManagerRepository.findOne({
      where: { id: managerId },
      relations: ['user', 'bus'],
    });

    if (!manager) {
      throw new NotFoundException(`Manager with ID ${managerId} not found`);
    }

    // Mark as inactive rather than removing
    manager.is_active = false;
    return this.busManagerRepository.save(manager);
  }

  // Off days management
  async updateBusOffDays(busId: number, updateOffDaysDto: UpdateBusOffDaysDto) {
    const bus = await this.getBusById(busId);

    // Validate off days (each day must be between 0-6)
    if (!updateOffDaysDto.off_days.every((day) => day >= 0 && day <= 6)) {
      throw new BadRequestException(
        'Off days must be between 0 and 6 (Sunday to Saturday)',
      );
    }

    // Remove duplicates
    bus.off_days = [...new Set(updateOffDaysDto.off_days)];

    return this.busRepository.save(bus);
  }

  // Check if user is a bus manager for the given bus
  async isBusManager(userId: number, busId: number): Promise<boolean> {
    const manager = await this.busManagerRepository.findOne({
      where: {
        user: { id: userId },
        bus: { id: busId },
        is_active: true,
      },
    });

    return !!manager;
  }

  // Get bus manager by user ID and bus ID
  async getBusManagerByUserAndBus(
    userId: number,
    busId: number,
  ): Promise<BusManager> {
    const manager = await this.busManagerRepository.findOne({
      where: {
        user: { id: userId },
        bus: { id: busId },
        is_active: true,
      },
      relations: ['user', 'bus'],
    });

    if (!manager) {
      throw new UnauthorizedException(
        `User is not an active manager for bus with ID ${busId}`,
      );
    }

    return manager;
  }

  // Journey management with enhanced authorization
  async startJourney(createJourneyDto: CreateJourneyDto, userId: number) {
    // Check if bus exists
    const bus = await this.busRepository.findOne({
      where: { id: createJourneyDto.bus_id },
      relations: ['assigned_route'],
    });
    if (!bus) {
      throw new BadRequestException(
        `Bus with ID ${createJourneyDto.bus_id} not found`,
      );
    }

    // Check if route exists
    const route = await this.busRouteRepository.findOneBy({
      id: createJourneyDto.route_id,
    });
    if (!route) {
      throw new BadRequestException(
        `Route with ID ${createJourneyDto.route_id} not found`,
      );
    }

    // Check if bus is on off day
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    if (bus.off_days.includes(today)) {
      throw new BadRequestException(
        `Cannot start journey: Bus is on its off day`,
      );
    }

    // Get the manager and validate authorization
    const manager = await this.getBusManagerByUserAndBus(
      userId,
      createJourneyDto.bus_id,
    );

    // Check if manager ID matches the provided one
    if (manager.id !== createJourneyDto.manager_id) {
      throw new BadRequestException(
        `Manager ID mismatch. The provided manager ID does not match your assigned manager role.`,
      );
    }

    // Check if there's already an active journey for this bus
    const activeJourney = await this.busJourneyRepository.findOne({
      where: {
        bus: { id: bus.id },
        status: 'in_progress',
      },
    });

    if (activeJourney) {
      throw new BadRequestException(
        `Bus already has an active journey (ID: ${activeJourney.id})`,
      );
    }

    // Create and save the new journey
    const journey = this.busJourneyRepository.create({
      start_time: new Date(),
      start_latitude: createJourneyDto.latitude,
      start_longitude: createJourneyDto.longitude,
      notes: createJourneyDto.notes,
      status: 'in_progress',
    });

    journey.bus = bus;
    journey.route = route;
    journey.manager = manager;

    return this.busJourneyRepository.save(journey);
  }

  async endJourney(
    journeyId: number,
    endJourneyDto: EndJourneyDto,
    userId: number,
  ) {
    // Find the journey with related entities
    const journey = await this.busJourneyRepository.findOne({
      where: { id: journeyId },
      relations: ['bus', 'manager', 'manager.user'],
    });

    if (!journey) {
      throw new NotFoundException(`Journey with ID ${journeyId} not found`);
    }

    // Check if the journey is already completed
    if (journey.status !== 'in_progress') {
      throw new BadRequestException(`Journey is already ${journey.status}`);
    }

    // Verify the user is the assigned manager for this journey
    if (journey.manager.user.id !== userId) {
      throw new ForbiddenException(
        'Only the manager who started this journey can end it',
      );
    }

    // Update journey with end details
    journey.end_time = new Date();
    journey.end_latitude = endJourneyDto.latitude;
    journey.end_longitude = endJourneyDto.longitude;
    journey.status = endJourneyDto.status;

    if (endJourneyDto.notes) {
      journey.notes =
        (journey.notes || '') + '\nEnd notes: ' + endJourneyDto.notes;
    }

    return this.busJourneyRepository.save(journey);
  }

  async createCheckIn(
    journeyId: number,
    createCheckInDto: CreateCheckInDto,
    userId: number,
  ) {
    // Find the journey with related entities
    const journey = await this.busJourneyRepository.findOne({
      where: { id: journeyId },
      relations: ['manager', 'manager.user', 'bus'],
    });

    if (!journey) {
      throw new NotFoundException(`Journey with ID ${journeyId} not found`);
    }

    // Check if the journey is in progress
    if (journey.status !== 'in_progress') {
      throw new BadRequestException(
        `Cannot check in: Journey is ${journey.status}`,
      );
    }

    // Verify the user is the assigned manager for this journey or a manager for this bus
    if (journey.manager.user.id !== userId) {
      const isManager = await this.isBusManager(userId, journey.bus.id);
      if (!isManager) {
        throw new ForbiddenException(
          'Only assigned bus managers can add check-ins to this journey',
        );
      }
    }

    // Create the check-in
    const checkIn = this.busJourneyCheckInRepository.create({
      check_in_time: new Date(),
      latitude: createCheckInDto.latitude,
      longitude: createCheckInDto.longitude,
      location_name: createCheckInDto.location_name,
      notes: createCheckInDto.notes,
    });

    // Set relationships
    checkIn.journey = journey;

    // If bus_stop_id is provided, set the relationship
    if (createCheckInDto.bus_stop_id) {
      const busStop = await this.busStopRepository.findOneBy({
        id: createCheckInDto.bus_stop_id,
      });
      if (!busStop) {
        throw new BadRequestException(
          `Bus stop with ID ${createCheckInDto.bus_stop_id} not found`,
        );
      }
      checkIn.bus_stop = busStop;
    }

    return this.busJourneyCheckInRepository.save(checkIn);
  }

  async getJourneyCheckIns(journeyId: number, filter?: CheckInFilterDto) {
    // Verify the journey exists
    const journey = await this.busJourneyRepository.findOneBy({
      id: journeyId,
    });
    if (!journey) {
      throw new NotFoundException(`Journey with ID ${journeyId} not found`);
    }

    // Build query with filters
    const whereClause: FindOptionsWhere<BusJourneyCheckIn> = {
      journey: { id: journeyId },
    };

    if (filter) {
      if (filter.bus_stop_id) {
        whereClause.bus_stop = { id: filter.bus_stop_id };
      }

      if (filter.location_name) {
        whereClause.location_name = Like(`%${filter.location_name}%`);
      }

      if (filter.date_from && filter.date_to) {
        whereClause.check_in_time = Between(
          new Date(filter.date_from),
          new Date(filter.date_to),
        );
      } else if (filter.date_from) {
        whereClause.check_in_time = Between(
          new Date(filter.date_from),
          new Date(Date.now() + 86400000), // +1 day
        );
      } else if (filter.date_to) {
        whereClause.check_in_time = Between(
          new Date(0), // start of time
          new Date(filter.date_to),
        );
      }
    }

    // Get check-ins sorted by time
    return this.busJourneyCheckInRepository.find({
      where: whereClause,
      relations: ['bus_stop'],
      order: { check_in_time: 'ASC' },
    });
  }

  async updateCheckIn(
    checkInId: number,
    updateCheckInDto: Partial<CreateCheckInDto>,
    userId: number,
  ) {
    // Find the check-in
    const checkIn = await this.busJourneyCheckInRepository.findOne({
      where: { id: checkInId },
      relations: [
        'journey',
        'journey.manager',
        'journey.manager.user',
        'journey.bus',
      ],
    });

    if (!checkIn) {
      throw new NotFoundException(`Check-in with ID ${checkInId} not found`);
    }

    // Check if the user is authorized to update the check-in
    if (checkIn.journey.manager.user.id !== userId) {
      const isManager = await this.isBusManager(userId, checkIn.journey.bus.id);
      if (!isManager) {
        throw new ForbiddenException(
          'Only assigned bus managers can update check-ins for this journey',
        );
      }
    }

    // Update check-in properties
    if (updateCheckInDto.latitude !== undefined) {
      checkIn.latitude = updateCheckInDto.latitude;
    }
    if (updateCheckInDto.longitude !== undefined) {
      checkIn.longitude = updateCheckInDto.longitude;
    }
    if (updateCheckInDto.location_name !== undefined) {
      checkIn.location_name = updateCheckInDto.location_name;
    }
    if (updateCheckInDto.notes !== undefined) {
      checkIn.notes = updateCheckInDto.notes;
    }

    // Update bus stop if provided
    if (updateCheckInDto.bus_stop_id !== undefined) {
      if (updateCheckInDto.bus_stop_id === null) {
        checkIn.bus_stop = null;
      } else {
        const busStop = await this.busStopRepository.findOneBy({
          id: updateCheckInDto.bus_stop_id,
        });
        if (!busStop) {
          throw new BadRequestException(
            `Bus stop with ID ${updateCheckInDto.bus_stop_id} not found`,
          );
        }
        checkIn.bus_stop = busStop;
      }
    }

    return this.busJourneyCheckInRepository.save(checkIn);
  }

  async getBusJourneys(busId: number, filter?: JourneyFilterDto) {
    const bus = await this.busRepository.findOneBy({ id: busId });
    if (!bus) {
      throw new NotFoundException(`Bus with ID ${busId} not found`);
    }

    // Build query with filters
    const whereClause: FindOptionsWhere<BusJourney> = {
      bus: { id: busId },
    };

    if (filter) {
      if (filter.route_id) {
        whereClause.route = { id: filter.route_id };
      }

      if (filter.status) {
        whereClause.status = filter.status;
      }

      if (filter.manager_id) {
        whereClause.manager = { id: filter.manager_id };
      }

      if (filter.start_date_from && filter.start_date_to) {
        whereClause.start_time = Between(
          new Date(filter.start_date_from),
          new Date(filter.start_date_to),
        );
      } else if (filter.start_date_from) {
        whereClause.start_time = Between(
          new Date(filter.start_date_from),
          new Date(Date.now() + 86400000), // +1 day
        );
      } else if (filter.start_date_to) {
        whereClause.start_time = Between(
          new Date(0), // start of time
          new Date(filter.start_date_to),
        );
      }
    }

    return this.busJourneyRepository.find({
      where: whereClause,
      relations: ['route', 'manager', 'manager.user'],
      order: { start_time: 'DESC' },
    });
  }

  async getAllJourneys(filter?: JourneyFilterDto) {
    // Build query with filters
    const whereClause: FindOptionsWhere<BusJourney> = {};

    if (filter) {
      if (filter.bus_id) {
        whereClause.bus = { id: filter.bus_id };
      }

      if (filter.route_id) {
        whereClause.route = { id: filter.route_id };
      }

      if (filter.status) {
        whereClause.status = filter.status;
      }

      if (filter.manager_id) {
        whereClause.manager = { id: filter.manager_id };
      }

      if (filter.start_date_from && filter.start_date_to) {
        whereClause.start_time = Between(
          new Date(filter.start_date_from),
          new Date(filter.start_date_to),
        );
      } else if (filter.start_date_from) {
        whereClause.start_time = Between(
          new Date(filter.start_date_from),
          new Date(Date.now() + 86400000), // +1 day
        );
      } else if (filter.start_date_to) {
        whereClause.start_time = Between(
          new Date(0), // start of time
          new Date(filter.start_date_to),
        );
      }
    }

    return this.busJourneyRepository.find({
      where: whereClause,
      relations: ['bus', 'route', 'manager', 'manager.user'],
      order: { start_time: 'DESC' },
    });
  }

  async getActiveJourneys() {
    return this.busJourneyRepository.find({
      where: { status: 'in_progress' },
      relations: ['bus', 'route', 'manager', 'manager.user'],
    });
  }

  async getBusLocation(journeyId: number): Promise<BusLocationDto> {
    // Find journey with bus details
    const journey = await this.busJourneyRepository.findOne({
      where: { id: journeyId },
      relations: ['bus', 'checkIns'],
    });

    if (!journey) {
      throw new NotFoundException(`Journey with ID ${journeyId} not found`);
    }

    // Get the most recent check-in
    let lastCheckIn: BusJourneyCheckIn | null = null;
    if (journey.checkIns && journey.checkIns.length > 0) {
      lastCheckIn = journey.checkIns.reduce((latest, current) => {
        return latest.check_in_time > current.check_in_time ? latest : current;
      });
    }

    // If no check-ins, use journey start location
    const latitude = lastCheckIn
      ? lastCheckIn.latitude
      : journey.start_latitude;
    const longitude = lastCheckIn
      ? lastCheckIn.longitude
      : journey.start_longitude;
    const last_checkin_time = lastCheckIn
      ? lastCheckIn.check_in_time
      : journey.start_time;
    const location_name = lastCheckIn ? lastCheckIn.location_name : null;

    return {
      journey_id: journey.id,
      registration_number: journey.bus.registration_number,
      latitude,
      longitude,
      last_checkin_time,
      journey_status: journey.status,
      location_name,
    };
  }

  async getAllActiveBusLocations() {
    // Get all active journeys
    const activeJourneys = await this.busJourneyRepository.find({
      where: { status: 'in_progress' },
      relations: ['bus'],
    });

    // For each journey, get the latest location
    const locations = await Promise.all(
      activeJourneys.map((journey) => this.getBusLocation(journey.id)),
    );

    return locations;
  }
}
