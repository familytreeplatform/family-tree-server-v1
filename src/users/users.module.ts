import { Module } from '@nestjs/common';
import { PrimaryUserController } from './controllers';
import { PrimaryUserService } from './services';
import { MongooseModule } from '@nestjs/mongoose';
import { PrimaryUser, PrimaryUserSchema } from './schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PrimaryUser.name, schema: PrimaryUserSchema },
    ]),
  ],
  providers: [PrimaryUserService],
  controllers: [PrimaryUserController],
  exports: [UsersModule],
})
export class UsersModule {}
