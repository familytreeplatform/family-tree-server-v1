import { Module } from '@nestjs/common';
import { PrimaryUserController } from './controllers';
import { PrimaryUserService } from './services';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PrimaryUser,
  PrimaryUserSchema,
  PrimaryUserWiki,
  PrimaryUserWikiSchema,
} from './schemas';
import { GlobalSettings, GlobalSettingsSchema } from 'src/default/schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PrimaryUser.name, schema: PrimaryUserSchema },
      { name: PrimaryUserWiki.name, schema: PrimaryUserWikiSchema },
      {
        name: GlobalSettings.name,
        schema: GlobalSettingsSchema,
      },
    ]),
  ],
  providers: [PrimaryUserService],
  controllers: [PrimaryUserController],
  exports: [UsersModule],
})
export class UsersModule {}
