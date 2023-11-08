import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PrimaryUserService } from '../services';
import { CreatePrimaryUserDto } from '../dto';
import { formatResponse } from 'src/common/utils/response-formatter';
import { JwtGuard } from 'src/common/guards';
import { GetUser } from 'src/common/decorators';

@Controller('user/primary')
export class PrimaryUserController {
  constructor(private readonly primaryUserService: PrimaryUserService) {}

  @Post('verify-username')
  async validateUserName(@Body('userName') usernName: string) {
    return await this.primaryUserService.validateUserName(usernName);
  }

  @Post('create')
  async signup(@Body() createPrimaryUserDto: CreatePrimaryUserDto) {
    const signUpResponse =
      await this.primaryUserService.signup(createPrimaryUserDto);

    return formatResponse(signUpResponse);
  }

  @UseGuards(JwtGuard)
  @Get('get-by-id')
  async getUserProfile(@GetUser('_id') userId: any) {
    const userProfileResponse =
      await this.primaryUserService.getUserById(userId);

    return formatResponse(userProfileResponse);
  }
}
