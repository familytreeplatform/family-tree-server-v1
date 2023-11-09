import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { JwtStrategy } from './auth/strategies';
import { PrimaryUserService } from './users/services';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PrimaryUser,
  PrimaryUserSchema,
} from './users/schemas';
import { PrimaryUserController } from './users/controllers';
import { FamilyModule } from './family/family.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeature([
      { name: PrimaryUser.name, schema: PrimaryUserSchema },
    ]),
    ThrottlerModule.forRoot(),
    AuthModule,
    DatabaseModule,
    UsersModule,
    FamilyModule,
  ],
  controllers: [AppController, PrimaryUserController],
  providers: [
    JwtStrategy,
    PrimaryUserService,
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
