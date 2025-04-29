import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import UserService from 'src/services/user.service';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UserService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies[process.env.JWT_TOKEN_NAME as string];
    if (token) {
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET,
        });
        if (payload?.id) {
          const user = await this.usersService.get(payload.id);
          request['user'] = user;
          request['token'] = token;
        }
      } catch {
        console.log('Error in optional auth guard');
      }
    }
    return true;
  }
}
