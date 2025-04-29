import User from 'src/models/user.entity';

export class LoginDto {
  email: string;
  password: string;
}

export class ChangePassDto {
  old_password: string;
  new_password: string;
}

export class CreateUserDto extends User {
  password: string;
}
