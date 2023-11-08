import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class JwtGuard extends AuthGuard('jwt') {
  public handleRequest(err: unknown, user): any {
    if (!user)
      throw new UnauthorizedException(
        'token invalid or expired: login to access this resource',
      );
    return user.data;
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const { user } = context.switchToHttp().getRequest();

    return user ? true : false;
  }
}
