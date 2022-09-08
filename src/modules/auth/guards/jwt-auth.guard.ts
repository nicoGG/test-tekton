import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const { user } = context.switchToHttp().getRequest();
    return user;
  }

  handleRequest(err: Error, user: any) {
    if (err || !user)
      throw err || new UnauthorizedException('Unezathorized user');
    return user;
  }
}
