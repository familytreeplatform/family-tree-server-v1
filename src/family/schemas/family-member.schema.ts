import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PrimaryUser } from 'src/users/schemas';
import { Family } from './create-family.schema';
import { FamilyRelationshipsEnum } from '../types';

export type FamilyMemberDocument = HydratedDocument<FamilyMember>;

@Schema({ timestamps: true })
export class FamilyMember {
  @Prop({ type: 'ObjectId' })
  _id: any;

  @Prop({ type: String, enum: FamilyRelationshipsEnum })
  relationshipToRoot: FamilyRelationshipsEnum;

  @Prop()
  familyUsername: string;

  @Prop()
  familyType: string;

  @Prop({ type: 'ObjectId', ref: 'Family' })
  family: Family;

  @Prop({ type: 'ObjectId', ref: 'PrimaryUser', required: true }) // Reference to the User collection
  user: PrimaryUser; // Id of the family member

  @Prop({ type: 'ObjectId', ref: 'PrimaryUser' }) // Reference to the User collection
  parent: PrimaryUser; // Id of the family member
}

export const FamilyMemberSchema = SchemaFactory.createForClass(FamilyMember);
