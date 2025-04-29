import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto, LoginDto } from 'src/dto/user.dto';
import User from 'src/models/user.entity';
import { Repository } from 'typeorm';

const getExpiryTime = () => {
  const webExpiry = Number(process.env.WEB_TOKEN_EXPIRY_TIME_MINUTES);
  const appExpiry = Number(process.env.APP_TOKEN_EXPIRY_TIME_MINUTES);
  const tokenExpiryTime = webExpiry ? webExpiry * 1000 * 60 : 86400000;
  const appTokenExpiryTime = appExpiry
    ? appExpiry * 1000 * 60
    : 1000 * 60 * 60 * 24 * 30;
  return { tokenExpiryTime, appTokenExpiryTime };
};

@Injectable()
export default class UserService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async all(forDropdown = false) {
    return this.usersRepository.find({
      select: forDropdown ? ['id', 'name'] : undefined,
    });
  }

  async get(id: number) {
    return this.usersRepository.findOne({
      where: { id },
    });
  }

  async getByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async create(data: CreateUserDto) {
    if (!data.password) throw new BadRequestException('Password is required');
    else if (data.password.length < 6)
      throw new BadRequestException('Password must be at least 6 characters');
    // check if user already exists
    const user = await this.getByEmail(data.email);
    if (user) {
      throw new BadRequestException('User already exists');
    }
    const newUser = new User();
    Object.assign(newUser, data);
    newUser.id = 0;
    newUser.role = 'student'; // set default role (user)
    newUser.password_hash = await this.hashPassword(data.password);

    return this.usersRepository.save(newUser).catch((e) => {
      throw new InternalServerErrorException(e.message);
    });
  }

  async login(dto: LoginDto) {
    const user = await this.getByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const match = await bcrypt.compare(dto.password, user.password_hash);
    if (!match) {
      throw new UnauthorizedException('Invalid password');
    }
    return this.proceedLogin(user);
  }

  async proceedLogin(user: User) {
    const { tokenExpiryTime } = getExpiryTime();
    const token = await this.jwtService.signAsync(
      { id: user.id },
      {
        expiresIn: tokenExpiryTime,
        secret: process.env.JWT_SECRET,
      },
    );

    user.id = 0;
    return {
      token,
      user,
      expiresIn: tokenExpiryTime,
    };
  }

  async updateProfile(
    userId: number,
    data: CreateUserDto,
    // photo: Express.Multer.File = null,
  ) {
    const existingUser = await this.usersRepository.findOneBy({ id: userId });

    if (!existingUser) {
      throw new BadRequestException('User not found');
    }
    // let s3res: string = '';
    // existingUser.phone =
    //   data.phone === undefined ? existingUser.phone : data.phone;
    existingUser.name = data.name === undefined ? existingUser.name : data.name;
    // delete old photo if new photo is provided
    // if (photo) {
    //   s3res = await this.s3Service.upload(
    //     this.getPhotoFileName(photo),
    //     photo,
    //     'user-photos',
    //   );
    //   if (existingUser.photo_url) {
    //     await this.s3Service.delete(existingUser.photo_url).catch(() => {});
    //   }
    //   existingUser.photo_url = s3res;
    // }

    return this.usersRepository.save(existingUser).catch((e) => {
      // if (s3res) this.s3Service.delete(s3res).catch(() => {});
      throw new InternalServerErrorException(e.message);
    });
  }

  async updatePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const match = await bcrypt.compare(oldPassword, user.password_hash);
    if (!match) {
      throw new BadRequestException('Invalid old password');
    }
    user.password_hash = await this.hashPassword(newPassword);
    await this.usersRepository.save(user);
    return true;
  }

  async resetPassword(email: string) {
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const newPass = Math.random().toString(36).slice(-8); // generate random password (8 characters)
    user.password_hash = await this.hashPassword(newPass);
    await this.usersRepository.save(user);
    return { email: user.email, password: newPass };
  }

  async generateOtp(email: string) {
    const user = await this.getByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const otp = Math.random().toString().slice(-6); // generate 6 digit random number
    user.reset_pass_otp = otp;
    user.otp_issued_at = new Date();
    await this.usersRepository.save(user);
    return otp;
  }

  async updatePasswordWithOtp(email: string, otp: string, newPassword: string) {
    const user = await this.getByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    } else if (!newPassword) {
      throw new BadRequestException('Password is required');
    } else if (user.reset_pass_otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    } else if (
      user.otp_issued_at &&
      new Date().getTime() - user.otp_issued_at.getTime() > 1000 * 60 * 5
    ) {
      throw new BadRequestException('OTP expired');
    }
    user.password_hash = await this.hashPassword(newPassword);
    user.reset_pass_otp = null;
    user.otp_issued_at = null;
    await this.usersRepository.save(user);
    return 'Password updated successfully';
  }

  async changeRole(userEmail: string, role: User['role']) {
    const user = await this.usersRepository.findOneBy({ email: userEmail });
    if (!user) {
      throw new BadRequestException('User not found');
    } else if (user.role === role) {
      throw new BadRequestException('User already has this role');
    }
    user.role = role;
    await this.usersRepository.save(user);
    return true;
  }
}
