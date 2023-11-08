import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export class HelperFn {
  static signJwtToken(sub: any): { token: string; refreshToken: string } {
    const jwtService = new JwtService({
      secret: process.env.JWT_ACCESS_SECRET,
    });

    const refreshService = new JwtService({
      secret: process.env.JWT_REFRESH_SECRET,
    });

    const payload = {
      sub: sub,
    };

    const token = jwtService.sign(payload, { expiresIn: '365d' });
    const refreshToken = refreshService.sign(payload, { expiresIn: '7d' });

    return {
      token,
      refreshToken,
    };
  }

  static verifyJwtToken(token: string) {
    const jwtService = new JwtService({
      secret: process.env.JWT_ACCESS_SECRET,
    });
    try {
      jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException(
        `This OTP is inavlid or expired, request for another one ${error}`,
      );
    }
  }
}
