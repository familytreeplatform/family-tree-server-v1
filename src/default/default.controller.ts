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
  @UseInterceptors(FileInterceptor('fieldName'))
  async uploadFile(
    @UploadedFile() fieldName: Express.Multer.File,
    @Body() uploadFileTypeDto: UploadFileTypeDto,
  ): Promise<string> {
    if (!fieldName) {
      throw new HttpException(
        {
          message: `a valid file type is required`,
          error: 'Bad Request',
          statusCode: 400,
        },
        400,
      );
    }

    return await this.defaultService.uploadFile(
      fieldName,
      uploadFileTypeDto.folder,
    );
  }
}
