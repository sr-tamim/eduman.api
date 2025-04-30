import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Param,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { ChangePassDto, CreateUserDto, LoginDto } from 'src/dto/user.dto';
import UserService from 'src/services/user.service';
import { getUser } from 'src/utility/misc.utility';
import { Request } from 'express';
import { sendEmail } from 'src/utility/mail.utility';
import { FileInterceptor } from '@nestjs/platform-express';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { AdminGuard } from 'src/guards/admin.guard';
import { AuthGuard } from 'src/guards/auth.guard';
import User from 'src/models/user.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiMyResponse } from 'src/decorators/myResponse.decorator';

const setCookieToken = (res: Response, token: string, expiryTime: number) => {
  // set token in cookie httpOnly and secure
  return res.cookie(process.env.JWT_TOKEN_NAME as string, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: expiryTime,
  });
};

const clearCookieToken = (res: Response) => {
  // clear token cookie
  return res.clearCookie(process.env.JWT_TOKEN_NAME as string, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  });
};

@ApiTags('Users')
@Controller({
  version: '1',
  path: 'users',
})
@UseInterceptors(ClassSerializerInterceptor)
export default class UserController {
  constructor(private readonly usersService: UserService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiMyResponse({
    status: 200,
    description: 'List of all users',
    model: User,
    isArray: true,
  })
  @Get('/')
  @UseGuards(AdminGuard)
  @UseInterceptors(TransformInterceptor)
  async getAllUsers(
    @Query('for_dropdown', new ParseBoolPipe({ optional: true }))
    forDropdown?: boolean,
  ) {
    return this.usersService.all(forDropdown);
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiMyResponse({
    status: 201,
    description: 'User registered successfully',
    model: User,
  })
  @Post('register')
  @UseInterceptors(TransformInterceptor)
  async register(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    const res = await this.usersService.create(createUserDto);
    return res;
  }

  @ApiOperation({ summary: 'User login' })
  @ApiMyResponse({
    status: 200,
    description: 'User logged in successfully',
    model: User,
  })
  @UseInterceptors(TransformInterceptor)
  @Post('login')
  async login(
    @Req() req: Request,
    @Body(new ValidationPipe()) signInDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, expiresIn, user } = await this.usersService.login(signInDto);
    setCookieToken(res, token, expiresIn);
    return user;
  }

  @ApiOperation({ summary: 'Get user profile' })
  @ApiMyResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    model: User,
  })
  @UseGuards(AuthGuard)
  @UseInterceptors(TransformInterceptor)
  @Get('profile')
  async profile(@Req() req: Request) {
    const info = await this.usersService.get(getUser(req)!.id);
    info!.id = 0;
    return info;
  }

  @ApiOperation({ summary: 'Update user profile' })
  @ApiMyResponse({
    status: 200,
    description: 'User profile updated successfully',
    model: User,
  })
  @Patch('profile')
  @UseGuards(AuthGuard)
  @UseInterceptors(TransformInterceptor, FileInterceptor('photo'))
  async updateProfile(
    @Req() req: Request,
    @Body(new ValidationPipe({ transform: true })) editUserDto: CreateUserDto,
    // @UploadedFile(
    //   new ParseFilePipe({
    //     validators: [
    //       new MaxFileSizeValidator({ maxSize: 2048000 }),
    //       new FileTypeValidator({ fileType: 'image' }),
    //     ],
    //     fileIsRequired: false,
    //   }),
    // )
    // photo: Express.Multer.File,
  ) {
    const user = getUser(req)!;
    return this.usersService.updateProfile(user.id, editUserDto);
  }

  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  @UseGuards(AuthGuard)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    clearCookieToken(res);
    return { message: 'Logged out' };
  }

  @ApiOperation({ summary: 'Change user password' })
  @ApiMyResponse({
    status: 200,
    description: 'Password changed successfully',
    model: Boolean,
  })
  @UseGuards(AuthGuard)
  @UseInterceptors(TransformInterceptor)
  @Patch('change-password')
  async changePassword(
    @Req() req: Request,
    @Body(new ValidationPipe()) body: ChangePassDto,
  ) {
    const user = getUser(req)!;
    return this.usersService.updatePassword(
      user.id,
      body.old_password,
      body.new_password,
    );
  }

  @ApiOperation({ summary: 'Request password reset OTP' })
  @ApiMyResponse({
    status: 200,
    description: 'OTP sent to user email',
    model: String,
  })
  @UseInterceptors(TransformInterceptor)
  @Post('reset-password/otp')
  async resetPasswordOtp(@Body('email') email: string) {
    const otp = await this.usersService.generateOtp(email);
    await sendEmail(email, 'Password Reset OTP', {
      text: `Your OTP is ${otp}`,
      html: `<p>Your OTP is <strong>${otp}</strong></p>`,
    });
    return 'OTP sent to your email';
  }

  @ApiOperation({ summary: 'Reset user password' })
  @ApiMyResponse({
    status: 200,
    description: 'Password reset successfully',
    model: String,
  })
  @UseInterceptors(TransformInterceptor)
  @Post('reset-password')
  async resetPassword(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Body('new_password') newPassword: string,
  ) {
    return this.usersService.updatePasswordWithOtp(email, otp, newPassword);
  }

  @ApiOperation({ summary: 'Reset password for a user (Admin only)' })
  @ApiMyResponse({
    status: 200,
    description: 'Password reset successfully by admin',
    model: String,
  })
  @UseGuards(AdminGuard)
  @UseInterceptors(TransformInterceptor)
  @Patch('reset-password/:email')
  async resetPasswordForAdmin(@Param('email') email: string) {
    const { password } = await this.usersService.resetPassword(email);
    await sendEmail(email, 'Password Reset', {
      text: `Your new password is ${password}`,
      html: `<p>Your new password is <strong>${password}</strong></p>`,
    });
    return password;
  }

  @ApiOperation({ summary: 'Update user role (Admin only)' })
  @ApiMyResponse({
    status: 200,
    description: 'User role updated successfully',
    model: Boolean,
  })
  @UseGuards(AdminGuard)
  @UseInterceptors(TransformInterceptor)
  @Patch('role')
  async updateRole(@Body('email') email: string, @Body('role') role: string) {
    return this.usersService.changeRole(email, role as User['role']);
  }
}
