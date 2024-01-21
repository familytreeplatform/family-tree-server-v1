import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PrimaryUser,
  PrimaryUserSchema,
  PrimaryUserWiki,
  PrimaryUserWikiSchema,
} from 'src/users/schemas';
import { PrimaryUserService } from 'src/users/services';
import { JwtStrategy } from './strategies';

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: PrimaryUser.name, schema: PrimaryUserSchema },
      { name: PrimaryUserWiki.name, schema: PrimaryUserWikiSchema },
    ]),
  ],
  providers: [AuthService, PrimaryUserService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
