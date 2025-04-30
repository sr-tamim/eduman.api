import { ApiProperty, PartialType } from '@nestjs/swagger';
import Bus from 'src/models/bus.entity';

export class CreateBusDto extends Bus {
  @ApiProperty({
    description: 'ID of the route to assign the bus to',
    required: false,
  })
  route_id?: number;
}

export class UpdateBusDto extends PartialType(CreateBusDto) {}

export class AssignManagerDto {
  @ApiProperty({ description: 'ID of the user to assign as manager' })
  user_id: number;

  @ApiProperty({ description: 'ID of the bus to assign the manager to' })
  bus_id: number;

  @ApiProperty({
    description: 'Role of the manager for this bus',
    enum: ['driver', 'conductor', 'supervisor', 'maintenance'],
    default: 'driver',
  })
  role: 'driver' | 'conductor' | 'supervisor' | 'maintenance';

  @ApiProperty({ description: 'License number (for drivers)', required: false })
  license_number?: string;

  @ApiProperty({ description: 'Notes about the manager', required: false })
  notes?: string;
}
