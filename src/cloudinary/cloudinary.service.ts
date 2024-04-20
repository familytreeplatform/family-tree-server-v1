import { Injectable, Logger } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  async upload(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        { folder: 'familytree' },
        (error, result) => {
          if (error) {
            this.logger.error(
              `an error occurred while uploading file ` + error,
            );

            reject(
              new Error(
                `ClOUDINARY_ERROR: ${error.message || 'Something went wrong'}`,
              ),
            );
          }
          resolve(result.secure_url);
        },
      );

      toStream(file.buffer).pipe(upload);
    });
  }
}
