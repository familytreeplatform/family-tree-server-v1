import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { PrimaryUser } from 'src/users/schemas';
import { FamilyMember, FamilyWiki } from '.';

export type FamilyDocument = HydratedDocument<Family>;

@Schema({ timestamps: true })
export class Family {
  @Prop({ type: 'ObjectId', ref: 'PrimaryUser', required: true }) // Reference to the User collection
  creator: PrimaryUser; // Link the family creator to a User

  @Prop({ type: 'ObjectId', ref: 'PrimaryUser', required: true }) // Reference to the User collection
  root: PrimaryUser; // Link the root to a User

  @Prop({ required: true })
  familyName: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  tribe: string;

  @Prop({ required: true })
  familyUsername: string;

  @Prop({
    default:
      'https://familytreeapp-bucket.nyc3.cdn.digitaloceanspaces.com/defaults/family-avatar.png',
  })
  familyCoverImage: string;

  @Prop({ required: true })
  familyJoinLink: string;

  @Prop({ ref: Family.name })
  branches: Family[];

  @Prop({ ref: 'FamilyMember' })
  members: FamilyMember[];

  @Prop({ type: Number })
  membersCount: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'FamilyWiki' })
  wiki: FamilyWiki;
}

export const FamilySchema = SchemaFactory.createForClass(Family);

// FamilySchema.virtual('membersCount').get(function () {
//   return this.members.length;
// });
