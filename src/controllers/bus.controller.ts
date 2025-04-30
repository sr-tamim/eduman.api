import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { AdminGuard } from 'src/guards/admin.guard';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { CreateBusDto, UpdateBusDto, AssignManagerDto } from 'src/dto/bus.dto';
import {
  CreateJourneyDto,
  EndJourneyDto,
  CreateCheckInDto,
  UpdateBusOffDaysDto,
  BusFilterDto,
  JourneyFilterDto,
  CheckInFilterDto,
} from 'src/dto/bus_journey.dto';
import { Request } from 'express';
import { getUser } from 'src/utility/misc.utility';
import BusService from 'src/services/bus.service';
import { ApiMyResponse } from 'src/decorators/myResponse.decorator';
import Bus from 'src/models/bus.entity';
import BusManager from 'src/models/bus_manager.entity';
import BusJourney from 'src/models/bus_journey.entity';
import BusJourneyCheckIn from 'src/models/bus_journey_checkin.entity';

@ApiTags('Buses')
@Controller({
  version: '1',
  path: 'buses',
})
@UseInterceptors(TransformInterceptor)
export default class BusController {
  constructor(private readonly busService: BusService) {}

  // Bus CRUD operations with filtering
  @ApiOperation({ summary: 'Get all buses with optional filtering' })
  @ApiMyResponse({
    status: 200,
    description: 'List of buses matching the filter criteria',
    model: Bus,
    isArray: true,
  })
  @UseGuards(AuthGuard)
  @Get('/')
  async getAllBuses(@Query() filter: BusFilterDto) {
    return this.busService.getAllBuses(filter);
  }

  @ApiOperation({ summary: 'Get bus by ID' })
  @ApiParam({ name: 'id', description: 'Bus ID' })
  @ApiMyResponse({
    status: 200,
    description: 'Bus details',
    model: Bus,
  })
  @UseGuards(AuthGuard)
  @Get('/:id')
  async getBusById(@Param('id', ParseIntPipe) id: number) {
    return this.busService.getBusById(id);
  }

  @ApiOperation({ summary: 'Create a new bus' })
  @ApiMyResponse({
    status: 201,
    description: 'The newly created bus',
    model: Bus,
  })
  @UseGuards(AdminGuard)
  @Post('/')
  async createBus(@Body() createBusDto: CreateBusDto) {
    return this.busService.createBus(createBusDto);
  }

  @ApiOperation({ summary: 'Update a bus' })
  @ApiParam({ name: 'id', description: 'Bus ID' })
  @ApiMyResponse({
    status: 200,
    description: 'The updated bus',
    model: Bus,
  })
  @UseGuards(AdminGuard)
  @Patch('/:id')
  async updateBus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBusDto: UpdateBusDto,
  ) {
    return this.busService.updateBus(id, updateBusDto);
  }

  @ApiOperation({ summary: 'Delete a bus' })
  @ApiParam({ name: 'id', description: 'Bus ID' })
  @ApiMyResponse({
    status: 200,
    description: 'The deleted bus',
    model: Bus,
  })
  @UseGuards(AdminGuard)
  @Delete('/:id')
  async deleteBus(@Param('id', ParseIntPipe) id: number) {
    return this.busService.deleteBus(id);
  }

  // Bus Manager operations
  @ApiOperation({ summary: 'Assign a manager to a bus' })
  @ApiMyResponse({
    status: 201,
    description: 'The newly created manager assignment',
    model: BusManager,
  })
  @UseGuards(AdminGuard)
  @Post('/managers/assign')
  async assignManager(@Body() assignManagerDto: AssignManagerDto) {
    return this.busService.assignManager(assignManagerDto);
  }

  @ApiOperation({ summary: 'Unassign a manager from a bus' })
  @ApiParam({ name: 'id', description: 'Manager ID' })
  @ApiMyResponse({
    status: 200,
    description: 'The updated manager assignment',
    model: BusManager,
  })
  @UseGuards(AdminGuard)
  @Patch('/managers/:id/unassign')
  async unassignManager(@Param('id', ParseIntPipe) id: number) {
    return this.busService.unassignManager(id);
  }

  // Off days management
  @ApiOperation({ summary: 'Update bus off days' })
  @ApiParam({ name: 'id', description: 'Bus ID' })
  @ApiMyResponse({
    status: 200,
    description: 'The updated bus with off days',
    model: Bus,
  })
  @UseGuards(AdminGuard)
  @Patch('/:id/off-days')
  async updateBusOffDays(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOffDaysDto: UpdateBusOffDaysDto,
  ) {
    return this.busService.updateBusOffDays(id, updateOffDaysDto);
  }

  // Journey management
  @ApiOperation({ summary: 'Start a new bus journey' })
  @ApiMyResponse({
    status: 201,
    description: 'The newly created journey',
    model: BusJourney,
  })
  @UseGuards(AuthGuard)
  @Post('/journeys/start')
  async startJourney(
    @Body() createJourneyDto: CreateJourneyDto,
    @Req() req: Request,
  ) {
    const user = getUser(req)!;
    return this.busService.startJourney(createJourneyDto, user.id);
  }

  @ApiOperation({ summary: 'End an active bus journey' })
  @ApiParam({ name: 'id', description: 'Journey ID' })
  @ApiMyResponse({
    status: 200,
    description: 'The updated journey',
    model: BusJourney,
  })
  @UseGuards(AuthGuard)
  @Patch('/journeys/:id/end')
  async endJourney(
    @Param('id', ParseIntPipe) id: number,
    @Body() endJourneyDto: EndJourneyDto,
    @Req() req: Request,
  ) {
    const user = getUser(req)!;
    return this.busService.endJourney(id, endJourneyDto, user.id);
  }

  @ApiOperation({ summary: 'Record a check-in during a journey' })
  @ApiParam({ name: 'id', description: 'Journey ID' })
  @ApiMyResponse({
    status: 201,
    description: 'The newly created check-in',
    model: BusJourneyCheckIn,
  })
  @UseGuards(AuthGuard)
  @Post('/journeys/:id/check-in')
  async createCheckIn(
    @Param('id', ParseIntPipe) id: number,
    @Body() createCheckInDto: CreateCheckInDto,
    @Req() req: Request,
  ) {
    const user = getUser(req)!;
    return this.busService.createCheckIn(id, createCheckInDto, user.id);
  }

  @ApiOperation({ summary: 'Update an existing check-in' })
  @ApiParam({ name: 'id', description: 'Check-in ID' })
  @ApiMyResponse({
    status: 200,
    description: 'The updated check-in',
    model: BusJourneyCheckIn,
  })
  @UseGuards(AuthGuard)
  @Patch('/check-ins/:id')
  async updateCheckIn(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCheckInDto: Partial<CreateCheckInDto>,
    @Req() req: Request,
  ) {
    const user = getUser(req)!;
    return this.busService.updateCheckIn(id, updateCheckInDto, user.id);
  }

  @ApiOperation({
    summary: 'Get all check-ins for a journey with optional filtering',
  })
  @ApiParam({ name: 'id', description: 'Journey ID' })
  @ApiMyResponse({
    status: 200,
    description: 'List of check-ins for the journey',
    model: BusJourneyCheckIn,
    isArray: true,
  })
  @UseGuards(AuthGuard)
  @Get('/journeys/:id/check-ins')
  async getJourneyCheckIns(
    @Param('id', ParseIntPipe) id: number,
    @Query() filter: CheckInFilterDto,
  ) {
    return this.busService.getJourneyCheckIns(id, filter);
  }

  @ApiOperation({
    summary: 'Get all journeys for a bus with optional filtering',
  })
  @ApiParam({ name: 'id', description: 'Bus ID' })
  @ApiMyResponse({
    status: 200,
    description: 'List of journeys for the bus',
    model: BusJourney,
    isArray: true,
  })
  @UseGuards(AuthGuard)
  @Get('/:id/journeys')
  async getBusJourneys(
    @Param('id', ParseIntPipe) id: number,
    @Query() filter: JourneyFilterDto,
  ) {
    return this.busService.getBusJourneys(id, filter);
  }

  @ApiOperation({ summary: 'Get all journeys with optional filtering' })
  @ApiMyResponse({
    status: 200,
    description: 'List of all journeys matching the filter criteria',
    model: BusJourney,
    isArray: true,
  })
  @UseGuards(AuthGuard)
  @Get('/journeys')
  async getAllJourneys(@Query() filter: JourneyFilterDto) {
    return this.busService.getAllJourneys(filter);
  }

  @ApiOperation({ summary: 'Get all active journeys' })
  @ApiMyResponse({
    status: 200,
    description: 'List of all active journeys',
    model: BusJourney,
    isArray: true,
  })
  @UseGuards(AuthGuard)
  @Get('/journeys/active')
  async getActiveJourneys() {
    return this.busService.getActiveJourneys();
  }

  @ApiOperation({ summary: 'Get location of a bus' })
  @ApiParam({ name: 'id', description: 'Journey ID' })
  @ApiMyResponse({
    status: 200,
    description: 'Current location of the bus',
    model: BusJourney,
  })
  @UseGuards(AuthGuard)
  @Get('/journeys/:id/location')
  async getBusLocation(@Param('id', ParseIntPipe) id: number) {
    return this.busService.getBusLocation(id);
  }

  @ApiOperation({ summary: 'Get locations of all active buses' })
  @ApiMyResponse({
    status: 200,
    description: 'Current locations of all active buses',
    model: BusJourney,
    isArray: true,
  })
  @UseGuards(AuthGuard)
  @Get('/active-locations')
  async getAllActiveBusLocations() {
    return this.busService.getAllActiveBusLocations();
  }
}
