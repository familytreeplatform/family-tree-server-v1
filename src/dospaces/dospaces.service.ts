import { Inject, Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { DoSpacesServiceLib } from './dospaces.config';

@Injectable()
export class DospacesService {
  private readonly logger = new Logger(DospacesService.name);

  constructor(@Inject(DoSpacesServiceLib) private readonly s3: AWS.S3) {}

  async uploadFile(file: Express.Multer.File, path?: string): Promise<string> {
    const fileName = path
      ? `${path}/${Date.now()}-${file.originalname}`
      : `${Date.now()}-${file.originalname}`;

    return new Promise((resolve, reject) => {
      this.logger.log(`uploading file to cloud bucket...`);
      this.s3.putObject(
        {
          Bucket: process.env.DO_BUCKET_NAME,
          Key: fileName,
          Body: file.buffer,
          ACL: 'public-read',
        },
        (error: AWS.AWSError) => {
          if (!error) {
            resolve(
              `${process.env.DO_SPACE_RESOLVE_BASE_URL}.${process.env.DO_SPACE_ENDPOINT}/${fileName}`,
            );
          } else {
            this.logger.error(
              `an error occurred while uploading file ` + error,
            );

            reject(
              new Error(
                `DoSpacesService_ERROR: ${
                  error.message || 'Something went wrong'
                }`,
              ),
            );
          }
        },
      );
    });
  }

  async uploadFileWithBuffer(buffer: string, name: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.s3.putObject(
        {
          Bucket: process.env.DO_BUCKET_NAME,
          Key: `${name}.pdf`,
          Body: Buffer.from(buffer, 'base64'),
          ContentEncoding: 'base64',
          ContentType: 'application/pdf',
          ACL: 'public-read',
        },
        (error: AWS.AWSError) => {
          if (!error) {
            resolve(
              `${process.env.DO_SPACE_RESOLVE_BASE_URL}.${process.env.DO_SPACE_ENDPOINT}/${name}.pdf`,
            );
          } else {
            reject(
              new Error(
                `DoSpacesService_ERROR: ${
                  error.message || 'Something went wrong'
                }`,
              ),
            );
          }
        },
      );
    });
  }

  async deleteFile(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.s3.deleteObject(
        {
          Bucket: process.env.DO_BUCKET_NAME,
          Key: key,
        },
        (error: AWS.AWSError) => {
          if (!error) {
            resolve();
          } else {
            reject(
              new Error(
                `DoSpacesService_ERROR: ${
                  error.message || 'Something went wrong'
                }`,
              ),
            );
          }
        },
      );
    });
  }
}
