import { ApiProperty } from '@nestjs/swagger';

export default class DataListDto<T = unknown> {
  @ApiProperty({ description: 'List of items' })
  items: T[];

  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({
    description: 'Indicates if this is a DataListDto',
    default: true,
  })
  is_datalist_dto?: boolean = true;
}
