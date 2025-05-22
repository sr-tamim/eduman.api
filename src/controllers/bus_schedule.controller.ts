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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { AdminGuard } from 'src/guards/admin.guard';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import BusScheduleService from 'src/services/bus_schedule.service';
import { ApiMyResponse } from 'src/decorators/myResponse.decorator';
import BusRoute from 'src/models/bus_route.entity';
import BusStop from 'src/models/bus_stop.entity';
import BusSchedule from 'src/models/bus_schedule.entity';
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

@ApiTags('Bus Schedules')
@Controller({
  version: '1',
  path: 'bus-schedules',
})
@UseInterceptors(TransformInterceptor)
export default class BusScheduleController {
  constructor(private readonly busScheduleService: BusScheduleService) {}

  // Route management
  @ApiOperation({ summary: 'Get all bus routes' })
  @ApiMyResponse({
    status: 200,
    description: 'List of all bus routes',
    model: BusRoute,
    isArray: true,
  })
  @UseGuards(AuthGuard)
  @Get('/routes')
  async getAllRoutes() {
    return this.busScheduleService.getAllRoutes();
  }

  @ApiOperation({ summary: 'Get bus route by ID' })
  @ApiParam({ name: 'id', description: 'Route ID' })
  @ApiMyResponse({
    status: 200,
    description: 'Route details',
    model: BusRoute,
  })
  @UseGuards(AuthGuard)
  @Get('/routes/:id')
  async getRouteById(@Param('id', ParseIntPipe) id: number) {
    return this.busScheduleService.getRouteById(id);
  }

  @ApiOperation({ summary: 'Create a new bus route' })
  @ApiMyResponse({
    status: 201,
    description: 'The newly created bus route',
    model: BusRoute,
  })
  @UseGuards(AdminGuard)
  @Post('/routes')
  async createRoute(@Body() createRouteDto: CreateBusRouteDto) {
    return this.busScheduleService.createRoute(createRouteDto);
  }

  @ApiOperation({ summary: 'Create a new bus route with stops' })
  @ApiMyResponse({
    status: 201,
    description: 'The newly created bus route with stops',
    model: BusRoute,
  })
  @UseGuards(AdminGuard)
  @Post('/routes/with-stops')
  async createRouteWithStops(@Body() routeWithStopsDto: RouteWithStopsDto) {
    return this.busScheduleService.createRouteWithStops(routeWithStopsDto);
  }

  @ApiOperation({ summary: 'Update a bus route' })
  @ApiParam({ name: 'id', description: 'Route ID' })
  @ApiMyResponse({
    status: 200,
    description: 'The updated bus route',
    model: BusRoute,
  })
  @UseGuards(AdminGuard)
  @Patch('/routes/:id')
  async updateRoute(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRouteDto: UpdateBusRouteDto,
  ) {
    return this.busScheduleService.updateRoute(id, updateRouteDto);
  }

  @ApiOperation({ summary: 'Delete a bus route' })
  @ApiParam({ name: 'id', description: 'Route ID' })
  @ApiMyResponse({
    status: 200,
    description: 'The deleted bus route',
    model: BusRoute,
  })
  @UseGuards(AdminGuard)
  @Delete('/routes/:id')
  async deleteRoute(@Param('id', ParseIntPipe) id: number) {
    return this.busScheduleService.deleteRoute(id);
  }

  // Bus Stop management
  @ApiOperation({ summary: 'Get all bus stops' })
  @ApiMyResponse({
    status: 200,
    description: 'List of all bus stops',
    model: BusStop,
    isArray: true,
  })
  @UseGuards(AuthGuard)
  @Get('/stops')
  async getAllStops() {
    return this.busScheduleService.getAllStops();
  }

  @ApiOperation({ summary: 'Get bus stops by route ID' })
  @ApiParam({ name: 'id', description: 'Route ID' })
  @ApiMyResponse({
    status: 200,
    description: 'List of bus stops for the route',
    model: BusStop,
    isArray: true,
  })
  @UseGuards(AuthGuard)
  @Get('/routes/:id/stops')
  async getStopsByRouteId(@Param('id', ParseIntPipe) id: number) {
    return this.busScheduleService.getStopsByRouteId(id);
  }

  @ApiOperation({ summary: 'Get bus stop by ID' })
  @ApiParam({ name: 'id', description: 'Stop ID' })
  @ApiMyResponse({
    status: 200,
    description: 'Stop details',
    model: BusStop,
  })
  @UseGuards(AuthGuard)
  @Get('/stops/:id')
  async getStopById(@Param('id', ParseIntPipe) id: number) {
    return this.busScheduleService.getStopById(id);
  }

  @ApiOperation({ summary: 'Create a new bus stop' })
  @ApiMyResponse({
    status: 201,
    description: 'The newly created bus stop',
    model: BusStop,
  })
  @UseGuards(AdminGuard)
  @Post('/stops')
  async createStop(@Body() createStopDto: CreateBusStopDto) {
    return this.busScheduleService.createStop(createStopDto);
  }

  @ApiOperation({ summary: 'Update a bus stop' })
  @ApiParam({ name: 'id', description: 'Stop ID' })
  @ApiMyResponse({
    status: 200,
    description: 'The updated bus stop',
    model: BusStop,
  })
  @UseGuards(AdminGuard)
  @Patch('/stops/:id')
  async updateStop(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStopDto: UpdateBusStopDto,
  ) {
    return this.busScheduleService.updateStop(id, updateStopDto);
  }

  @ApiOperation({ summary: 'Delete a bus stop' })
  @ApiParam({ name: 'id', description: 'Stop ID' })
  @ApiMyResponse({
    status: 200,
    description: 'The deleted bus stop',
    model: BusStop,
  })
  @UseGuards(AdminGuard)
  @Delete('/stops/:id')
  async deleteStop(@Param('id', ParseIntPipe) id: number) {
    return this.busScheduleService.deleteStop(id);
  }

  // Schedule management
  @ApiOperation({ summary: 'Get all bus schedules with optional filtering' })
  @ApiMyResponse({
    status: 200,
    description: 'List of bus schedules matching the filter criteria',
    model: BusSchedule,
    isArray: true,
  })
  @UseGuards(AuthGuard)
  @Get('/schedules')
  async getAllSchedules(@Query() filter: BusScheduleFilterDto) {
    return this.busScheduleService.getAllSchedules(filter);
  }

  @ApiOperation({ summary: 'Get bus schedules by bus ID' })
  @ApiParam({ name: 'id', description: 'Bus ID' })
  @ApiMyResponse({
    status: 200,
    description: 'List of schedules for the bus',
    model: BusSchedule,
    isArray: true,
  })
  @UseGuards(AuthGuard)
  @Get('/buses/:id/schedules')
  async getSchedulesByBusId(
    @Param('id', ParseIntPipe) id: number,
    @Query() filter: BusScheduleFilterDto,
  ) {
    const busFilter = { ...filter, bus_id: id };
    return this.busScheduleService.getAllSchedules(busFilter);
  }

  @ApiOperation({ summary: 'Get bus schedules by route ID' })
  @ApiParam({ name: 'id', description: 'Route ID' })
  @ApiMyResponse({
    status: 200,
    description: 'List of schedules for the route',
    model: BusSchedule,
    isArray: true,
  })
  @UseGuards(AuthGuard)
  @Get('/routes/:id/schedules')
  async getSchedulesByRouteId(
    @Param('id', ParseIntPipe) id: number,
    @Query() filter: BusScheduleFilterDto,
  ) {
    const routeFilter = { ...filter, route_id: id };
    return this.busScheduleService.getAllSchedules(routeFilter);
  }

  @ApiOperation({ summary: 'Get bus schedule by ID' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiMyResponse({
    status: 200,
    description: 'Schedule details',
    model: BusSchedule,
  })
  @UseGuards(AuthGuard)
  @Get('/schedules/:id')
  async getScheduleById(@Param('id', ParseIntPipe) id: number) {
    return this.busScheduleService.getScheduleById(id);
  }

  @ApiOperation({ summary: 'Create a new bus schedule' })
  @ApiMyResponse({
    status: 201,
    description: 'The newly created bus schedule',
    model: BusSchedule,
  })
  @UseGuards(AdminGuard)
  @Post('/schedules')
  async createSchedule(@Body() createScheduleDto: CreateBusScheduleDto) {
    return this.busScheduleService.createSchedule(createScheduleDto);
  }

  @ApiOperation({ summary: 'Update a bus schedule' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiMyResponse({
    status: 200,
    description: 'The updated bus schedule',
    model: BusSchedule,
  })
  @UseGuards(AdminGuard)
  @Patch('/schedules/:id')
  async updateSchedule(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScheduleDto: UpdateBusScheduleDto,
  ) {
    return this.busScheduleService.updateSchedule(id, updateScheduleDto);
  }

  @ApiOperation({ summary: 'Delete a bus schedule' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiMyResponse({
    status: 200,
    description: 'The deleted bus schedule',
    model: BusSchedule,
  })
  @UseGuards(AdminGuard)
  @Delete('/schedules/:id')
  async deleteSchedule(@Param('id', ParseIntPipe) id: number) {
    return this.busScheduleService.deleteSchedule(id);
  }

  @ApiOperation({ summary: "Get today's schedules" })
  @ApiMyResponse({
    status: 200,
    description: 'List of schedules for today',
    model: BusSchedule,
    isArray: true,
  })
  @UseGuards(AuthGuard)
  @Get('/schedules/today')
  async getTodaySchedules(
    @Query('bus_id') busId?: number,
    @Query('route_id') routeId?: number,
  ) {
    return this.busScheduleService.getTodaySchedules(busId, routeId);
  }
}
