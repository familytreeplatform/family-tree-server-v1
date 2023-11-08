import { Module } from '@nestjs/common';
import { PrimaryUserController } from './controllers';
import { PrimaryUserService } from './services';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PrimaryUser,
  PrimaryUserProfile,
  PrimaryUserProfileSchema,
  PrimaryUserSchema,
} from './schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PrimaryUser.name, schema: PrimaryUserSchema },
      { name: PrimaryUserProfile.name, schema: PrimaryUserProfileSchema },
    ]),
  ],
  providers: [PrimaryUserService],
  controllers: [PrimaryUserController],
})
export class UsersModule {}
