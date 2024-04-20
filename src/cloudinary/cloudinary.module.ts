import { Module, Global } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { cloudinaryProvider } from './cloudinary.config';

@Global()
@Module({
  providers: [CloudinaryService, cloudinaryProvider],
  exports: [cloudinaryProvider, CloudinaryService],
})
export class CloudinaryModule {}
