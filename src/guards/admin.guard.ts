import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import UserService from 'src/services/user.service';
import { userIsAdmin } from 'src/utility/misc.utility';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UserService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies[process.env.JWT_TOKEN_NAME as string];
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      if (!payload || !payload.id) {
        throw new UnauthorizedException('Invalid Token');
      }
      const user = await this.usersService.get(payload.id);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      if (!userIsAdmin(user.role)) {
        throw new UnauthorizedException('You are not admin');
      }
      request['user'] = user;
      request['token'] = token;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new UnauthorizedException('Token verification failed');
    }
    return true;
  }
}
