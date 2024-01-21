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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PrimaryUser.name, schema: PrimaryUserSchema },
      { name: PrimaryUserWiki.name, schema: PrimaryUserWikiSchema },
    ]),
  ],
  providers: [PrimaryUserService],
  controllers: [PrimaryUserController],
  exports: [UsersModule],
})
export class UsersModule {}
