import { ApiProperty } from '@nestjs/swagger';
import User from 'src/models/user.entity';

export class LoginDto {
  @ApiProperty({ description: 'Email of the user' })
  email: string;

  @ApiProperty({ description: 'Password of the user' })
  password: string;
}

export class ChangePassDto {
  @ApiProperty({ description: 'Old password of the user' })
  old_password: string;

  @ApiProperty({ description: 'New password of the user' })
  new_password: string;
}

export class CreateUserDto extends User {
  @ApiProperty({ description: 'Password for the new user' })
  password: string;
}
