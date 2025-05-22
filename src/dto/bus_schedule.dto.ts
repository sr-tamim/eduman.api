import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBusRouteDto {
  @ApiProperty({ description: 'Name of the bus route' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the bus route', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Sequence/order number of the route',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  sequence?: number;
}

export class UpdateBusRouteDto extends PartialType(CreateBusRouteDto) {}

export class CreateBusStopDto {
  @ApiProperty({ description: 'Name of the bus stop' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Latitude of the bus stop' })
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: 'Longitude of the bus stop' })
  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @ApiProperty({ description: 'Route ID this stop belongs to' })
  @IsNotEmpty()
  @IsNumber()
  route_id: number;

  @ApiProperty({
    description: 'Order/sequence of the stop in the route',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  sequence?: number;

  @ApiProperty({
    description: 'Scheduled arrival time at this stop (format: HH:MM)',
    required: false,
  })
  @IsOptional()
  @IsString()
  scheduled_arrival_time?: string;
}

export class UpdateBusStopDto extends PartialType(CreateBusStopDto) {}

export class CreateBusScheduleDto {
  @ApiProperty({ description: 'Route ID for this schedule' })
  @IsNotEmpty()
  @IsNumber()
  route_id: number;

  @ApiProperty({ description: 'Bus ID assigned to this schedule' })
  @IsOptional()
  @IsNumber()
  bus_id?: number;

  @ApiProperty({ description: 'Departure time (format: HH:MM)' })
  @IsNotEmpty()
  @IsString()
  departure_time: string;

  @ApiProperty({ description: 'Arrival time (format: HH:MM)' })
  @IsNotEmpty()
  @IsString()
  arrival_time: string;

  @ApiProperty({
    description: 'Days of week this schedule runs (0-6, 0=Sunday)',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  operating_days?: number[];

  @ApiProperty({
    description: 'Whether this schedule is active',
    required: false,
  })
  @IsOptional()
  is_active?: boolean;
}

export class UpdateBusScheduleDto extends PartialType(CreateBusScheduleDto) {}

export class RouteWithStopsDto extends CreateBusRouteDto {
  @ApiProperty({
    description: 'Stops for this route',
    type: [CreateBusStopDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBusStopDto)
  stops: CreateBusStopDto[];
}

export class BusScheduleFilterDto {
  @ApiProperty({ description: 'Filter by route ID', required: false })
  @IsOptional()
  @IsNumber()
  route_id?: number;

  @ApiProperty({ description: 'Filter by bus ID', required: false })
  @IsOptional()
  @IsNumber()
  bus_id?: number;

  @ApiProperty({ description: 'Filter by active status', required: false })
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({
    description: 'Filter by day of week (0-6, 0=Sunday)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  day_of_week?: number;
}
