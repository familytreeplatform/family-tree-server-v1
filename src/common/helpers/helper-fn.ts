import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IResponse } from 'src/interfaces';

export class HelperFn {
  static signJwtToken(
    sub: any,
    expiry?: string,
  ): { token: string; refreshToken: string } | IResponse {
    const jwtService = new JwtService({
      secret: process.env.JWT_ACCESS_SECRET,
    });

    const refreshService = new JwtService({
      secret: process.env.JWT_REFRESH_SECRET,
    });

    const payload = {
      sub: sub,
    };

    const token = jwtService.sign(payload, {
      expiresIn: expiry ? expiry : '365d',
    });
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

  static verifyTokenExpiration(token: string) {
    let response: IResponse;
    const jwtService = new JwtService({
      secret: process.env.JWT_ACCESS_SECRET,
    });
    try {
      const isValid = jwtService.verify(token);

      return (response = {
        statusCode: 200,
        message: `valid token`,
        data: isValid,
        error: null,
      });
    } catch (error) {
      return (response = {
        statusCode: 400,
        message: `expired otp, request for a new one`,
        data: false,
        error: null,
      });
    }
  }

  static generateRandomNumber(len: number) {
    const randomThreeDigitNumber = Math.floor(Math.random() * 1000) + 1;
    const formattedNumber = String(randomThreeDigitNumber).padStart(len, '0'); // Ensures it is three digits
    return formattedNumber;
  }
}
