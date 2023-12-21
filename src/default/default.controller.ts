import {
  Body,
  Controller,
  HttpException,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { DefaultService } from './default.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileTypeDto } from './dto';

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
}
