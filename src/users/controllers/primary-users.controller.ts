import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PrimaryUserService } from '../services';
import {
  CreatePrimaryUserDto,
  UpdatePrimaryUserDto,
  searchUserDto,
} from '../dto';
import { formatResponse } from 'src/common/utils/response-formatter';
import { JwtGuard } from 'src/common/guards';
import { GetUser } from 'src/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user/primary')
export class PrimaryUserController {
  constructor(private readonly primaryUserService: PrimaryUserService) {}

  @HttpCode(200)
  @Post('verify-username')
  async validateUserName(@Body('userName') usernName: string) {
    if (!usernName)
      throw new HttpException(
        {
          message: 'username field is required for verification',
          data: null,
          statusCode: 400,

          error: {
            code: 'username_field_missing',
            message: `userName field is required for this action`,
          },
        },
        400,
      );
    const userNameVerifyResponse =
      await this.primaryUserService.validateUserName(usernName);

    return formatResponse(userNameVerifyResponse);
  }

  @Post('create')
  @UseInterceptors(FileInterceptor('profilePic'))
  async signup(
    @UploadedFile() profilePic: Express.Multer.File,
    @Body() createPrimaryUserDto: CreatePrimaryUserDto,
  ) {
    const signUpResponse = await this.primaryUserService.signup({
      ...createPrimaryUserDto,
      profilePic,
    });

    return formatResponse(signUpResponse);
  }

  @UseGuards(JwtGuard)
  @Patch('update')
  async updateUser(
    @GetUser('_id') userId: any,
    @Body() updatePrimaryUserDto: UpdatePrimaryUserDto,
  ) {
    const updateUserResponse = await this.primaryUserService.updateUser(
      userId,
      updatePrimaryUserDto,
    );

    return formatResponse(updateUserResponse);
  }

  @UseGuards(JwtGuard)
  @Get('get-by-id')
  async getUserProfile(@GetUser('_id') userId: any) {
    const userProfileResponse =
      await this.primaryUserService.getUserById(userId);

    return formatResponse(userProfileResponse);
  }

  @HttpCode(200)
  @Post('search')
  async searchUser(@Body() searchUserDto: searchUserDto) {
    const userSearchResponse =
      await this.primaryUserService.searchUser(searchUserDto);

    return formatResponse(userSearchResponse);
  }
}
