import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { JwtStrategy } from './auth/strategies';
import { PrimaryUserService } from './users/services';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PrimaryUser,
  PrimaryUserSchema,
  PrimaryUserWiki,
  PrimaryUserWikiSchema,
} from './users/schemas';
import { PrimaryUserController } from './users/controllers';
import { FamilyModule } from './family/family.module';
import { ChatModule } from './chat/chat.module';
import { DospacesModule } from './dospaces/dospaces.module';
import { SentryInterceptor } from './common/interceptors/sentry.interceptor';
import { DefaultModule } from './default/default.module';
import { GlobalSettings, GlobalSettingsSchema } from './default/schemas';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeature([
      { name: PrimaryUser.name, schema: PrimaryUserSchema },
      { name: PrimaryUserWiki.name, schema: PrimaryUserWikiSchema },
      {
        name: GlobalSettings.name,
        schema: GlobalSettingsSchema,
      },
    ]),
    ThrottlerModule.forRoot(),
    AuthModule,
    DatabaseModule,
    UsersModule,
    FamilyModule,
    ChatModule,
    DospacesModule,
    DefaultModule,
    CloudinaryModule,
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
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor,
    },
  ],
})
export class AppModule {}
