import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PrimaryUser } from 'src/users/schemas';
import { FamilyMember } from './family-member.schema';

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
  familyBio: string;

  @Prop({ required: true })
  familyUsername: string;

  @Prop({ default: '' })
  familyCoverImage: string;

  @Prop({ required: true })
  familyJoinLink: string;

  @Prop({ ref: Family.name })
  branches: Family[];

  @Prop({ ref: 'FamilyMember' })
  members: FamilyMember[];
}

export const FamilySchema = SchemaFactory.createForClass(Family);
