import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DefaultService } from './default.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserGlobalSettings, UploadFileTypeDto } from './dto';
import { Types } from 'mongoose';
import { GetUser } from 'src/common/decorators';
import { JwtGuard } from 'src/common/guards';

@Controller('default')
export class DefaultController {
  constructor(private readonly defaultService: DefaultService) {}

  @Post('file-upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileTypeDto: UploadFileTypeDto,
  ): Promise<string> {
    console.log('FILE', file);
    console.log('FOLDER_NAME', uploadFileTypeDto.folder);

    if (!file) {
      throw new HttpException(
        {
          message: `file field is required`,
          error: 'Bad Request',
          statusCode: 400,
        },
        400,
      );
    }

    return await this.defaultService.uploadFile(file, uploadFileTypeDto.folder);
  }

  @UseGuards(JwtGuard)
  @Patch('update-global-settings')
  @HttpCode(200)
  async updateGlobalSettings(
    @Body() dto: UpdateUserGlobalSettings,
    @GetUser('_id') userId: any,
  ): Promise<object> {
    return await this.defaultService.updateGlobalSettings({
      ...dto,
      userId: new Types.ObjectId(userId),
    });
  }
}
