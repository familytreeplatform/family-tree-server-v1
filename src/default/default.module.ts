import { Module } from '@nestjs/common';
import { DefaultService } from './default.service';
import { DefaultController } from './default.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalSettings, GlobalSettingsSchema } from './schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: GlobalSettings.name,
        schema: GlobalSettingsSchema,
      },
    ]),
  ],
  providers: [DefaultService],
  controllers: [DefaultController],
  exports: [DefaultService],
})
export class DefaultModule {}
