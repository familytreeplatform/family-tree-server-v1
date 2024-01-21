import { Module } from '@nestjs/common';
import { FamilyService } from './services';
import { FamilyController } from './controllers';
import {
  Family,
  FamilyMember,
  FamilyMemberSchema,
  FamilySchema,
  FamilyWiki,
  FamilyWikiSchema,
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
      { name: FamilyWiki.name, schema: FamilyWikiSchema },
    ]),
    DefaultModule,
  ],
  providers: [FamilyService],
  controllers: [FamilyController],
})
export class FamilyModule {}
