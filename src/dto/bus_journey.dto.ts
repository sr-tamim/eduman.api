import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsNumber,
  IsString,
  IsDateString,
  IsArray,
  Min,
  Max,
  ArrayMinSize,
  ArrayMaxSize,
  IsInt,
  IsNotEmpty,
  IsLatitude,
  IsLongitude,
} from 'class-validator';

export class BusFilterDto {
  @ApiProperty({
    required: false,
    description: 'Filter by registration number',
  })
  @IsOptional()
  @IsString()
  registration_number?: string;

  @ApiProperty({ required: false, description: 'Filter by bus model' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by bus status',
    enum: ['active', 'maintenance', 'inactive'],
  })
  @IsOptional()
  @IsEnum(['active', 'maintenance', 'inactive'])
  status?: 'active' | 'maintenance' | 'inactive';
}

export class JourneyFilterDto {
  @ApiProperty({ required: false, description: 'Filter by bus ID' })
  @IsOptional()
  @IsNumber()
  bus_id?: number;

  @ApiProperty({ required: false, description: 'Filter by route ID' })
  @IsOptional()
  @IsNumber()
  route_id?: number;

  @ApiProperty({ required: false, description: 'Filter by manager ID' })
  @IsOptional()
  @IsNumber()
  manager_id?: number;

  @ApiProperty({
    required: false,
    description: 'Filter by journey status',
    enum: ['in_progress', 'completed', 'cancelled'],
  })
  @IsOptional()
  @IsEnum(['in_progress', 'completed', 'cancelled'])
  status?: 'in_progress' | 'completed' | 'cancelled';

  @ApiProperty({ required: false, description: 'Filter by start date (from)' })
  @IsOptional()
  @IsDateString()
  start_date_from?: string;

  @ApiProperty({ required: false, description: 'Filter by start date (to)' })
  @IsOptional()
  @IsDateString()
  start_date_to?: string;
}

export class CheckInFilterDto {
  @ApiProperty({ required: false, description: 'Filter by bus stop ID' })
  @IsOptional()
  @IsNumber()
  bus_stop_id?: number;

  @ApiProperty({ required: false, description: 'Filter by date (from)' })
  @IsOptional()
  @IsDateString()
  date_from?: string;

  @ApiProperty({ required: false, description: 'Filter by date (to)' })
  @IsOptional()
  @IsDateString()
  date_to?: string;

  @ApiProperty({ required: false, description: 'Filter by location name' })
  @IsOptional()
  @IsString()
  location_name?: string;
}

export class UpdateBusOffDaysDto {
  @ApiProperty({
    description:
      'Array of days of the week when the bus is off (0 = Sunday, 1 = Monday, etc.)',
    type: 'array',
    items: { type: 'integer', minimum: 0, maximum: 6 },
    example: [0, 6],
  })
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  off_days: number[];
}

export class CreateJourneyDto {
  @ApiProperty({ description: 'ID of the bus' })
  @IsNotEmpty()
  @IsNumber()
  bus_id: number;

  @ApiProperty({ description: 'ID of the route for this journey' })
  @IsNotEmpty()
  @IsNumber()
  route_id: number;

  @ApiProperty({ description: 'ID of the manager starting the journey' })
  @IsNotEmpty()
  @IsNumber()
  manager_id: number;

  @ApiProperty({ description: 'Latitude of the starting location' })
  @IsNotEmpty()
  @IsLatitude()
  latitude: number;

  @ApiProperty({ description: 'Longitude of the starting location' })
  @IsNotEmpty()
  @IsLongitude()
  longitude: number;

  @ApiProperty({
    description: 'Additional notes for the journey',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class EndJourneyDto {
  @ApiProperty({ description: 'Latitude of the ending location' })
  @IsNotEmpty()
  @IsLatitude()
  latitude: number;

  @ApiProperty({ description: 'Longitude of the ending location' })
  @IsNotEmpty()
  @IsLongitude()
  longitude: number;

  @ApiProperty({
    description: 'Status to set the journey to',
    enum: ['completed', 'cancelled'],
    default: 'completed',
  })
  @IsNotEmpty()
  @IsEnum(['completed', 'cancelled'])
  status: 'completed' | 'cancelled';

  @ApiProperty({
    description: 'Additional notes for ending the journey',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateCheckInDto {
  @ApiProperty({
    description: 'ID of the bus stop if this check-in is at a scheduled stop',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  bus_stop_id?: number;

  @ApiProperty({ description: 'Latitude of the check-in location' })
  @IsNotEmpty()
  @IsLatitude()
  latitude: number;

  @ApiProperty({ description: 'Longitude of the check-in location' })
  @IsNotEmpty()
  @IsLongitude()
  longitude: number;

  @ApiProperty({
    description: 'Name of the location (if not at a scheduled stop)',
    required: false,
  })
  @IsOptional()
  @IsString()
  location_name?: string;

  @ApiProperty({
    description: 'Additional notes for the check-in',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BusLocationDto {
  @ApiProperty({ description: 'ID of the journey' })
  journey_id: number;

  @ApiProperty({ description: 'Registration number of the bus' })
  registration_number: string;

  @ApiProperty({ description: 'Current latitude of the bus' })
  latitude: number;

  @ApiProperty({ description: 'Current longitude of the bus' })
  longitude: number;

  @ApiProperty({ description: 'Last check-in time' })
  last_checkin_time: Date;

  @ApiProperty({ description: 'Status of the journey' })
  journey_status: string;

  @ApiProperty({ description: 'Location name if available', nullable: true })
  location_name: string | null;
}
