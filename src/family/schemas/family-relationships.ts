import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PrimaryUser } from 'src/users/schemas';
import { Family } from './create-family.schema';
import { FamilyRelationshipType } from '../types';

export type FamilyRelationshipDocument = HydratedDocument<FamilyRelationship>;

@Schema({ timestamps: true })
export class FamilyRelationship {
  @Prop({ type: 'ObjectId' })
  _id?: any;

  @Prop({ type: 'ObjectId', ref: 'Family', required: true })
  family1: Family;

  @Prop({ type: 'ObjectId', ref: 'Family', required: true })
  family2: Family;

  @Prop({
    type: String,
    enum: FamilyRelationshipType,
    default: FamilyRelationshipType.OTHER,
  })
  relationshipType: FamilyRelationshipType;

  @Prop({ type: 'ObjectId', ref: 'Individual' })
  member1?: PrimaryUser;

  @Prop({ type: 'ObjectId', ref: 'Individual' })
  member2?: PrimaryUser;

  @Prop({ type: String })
  description: string;
}

export const FamilyRelationshipSchema =
  SchemaFactory.createForClass(FamilyRelationship);
