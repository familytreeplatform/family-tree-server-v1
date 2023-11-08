import { Body, Controller, HttpCode, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DefaultSignInDto, ForgotPasswordDto, PasswordResetDto } from './dto';
import { formatResponse } from 'src/common/utils/response-formatter';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @HttpCode(200)
  async signin(@Body() dto: DefaultSignInDto) {
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
}
