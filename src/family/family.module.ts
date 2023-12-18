import { Module } from '@nestjs/common';
import { FamilyService } from './services';
import { FamilyController } from './controllers';
import { PrimaryUserService } from 'src/users/services';
import {
  Family,
  FamilyMember,
  FamilyMemberSchema,
  FamilySchema,
} from './schemas';
import { MongooseModule } from '@nestjs/mongoose';
import { PrimaryUser, PrimaryUserSchema } from 'src/users/schemas';
import { DefaultModule } from 'src/default/default.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Family.name, schema: FamilySchema },
      { name: PrimaryUser.name, schema: PrimaryUserSchema },
      { name: FamilyMember.name, schema: FamilyMemberSchema },
    ]),
    DefaultModule,
  ],
  providers: [FamilyService],
  controllers: [FamilyController],
})
export class FamilyModule {}
