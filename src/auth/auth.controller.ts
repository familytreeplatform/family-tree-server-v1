import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  Patch,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { DefaultSignInDto, ForgotPasswordDto, PasswordResetDto } from './dto';
import { formatResponse } from 'src/common/utils/response-formatter';
import { Throttle } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Throttle({ default: { limit: 3, ttl: 60000 } })
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @HttpCode(200)
  async signin(@Body() dto: DefaultSignInDto) {
    if (!dto.email && !dto.phone && !dto.userName)
      throw new HttpException(
        {
          message: 'email, phone or username required for login',
          data: null,
          statusCode: 400,

          error: {
            code: 'partial_login_credential',
            message: `one of either email, phone or username is required for login`,
          },
        },
        400,
      );

    const signInResponse = await this.authService.signin(dto);
    return formatResponse(signInResponse);
  }

  @Patch('forgot-password')
  @HttpCode(200)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<object> {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  @Patch('reset-password')
  @HttpCode(200)
  async resetPassword(
    @Body() passwordResetDto: PasswordResetDto,
  ): Promise<object> {
    return await this.authService.resetPassword(passwordResetDto);
  }

  @Post('resend-otp')
  @HttpCode(200)
  async resendOtp(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.resendOtp(forgotPasswordDto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('validate-otp')
  @HttpCode(200)
  async validateOtp(@Body('otp') otp: string) {
    if (!otp)
      throw new HttpException(
        {
          message: 'otp field is required',
          data: null,
          statusCode: 400,

          error: {
            code: 'otp_field_missing',
            message: `otp field is required for this action`,
          },
        },
        400,
      );
    const otpValidateResponse = await this.authService.validateOtp(otp);
    return formatResponse(otpValidateResponse);
  }
}
