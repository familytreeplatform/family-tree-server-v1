import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
// import { PrimaryUser } from 'src/users/schemas';
// import { Family } from './create-family.schema';
import { FamilyRelationshipType } from '../types';

export type FamilyRelationshipDocument = HydratedDocument<FamilyRelationship>;

@Schema({ timestamps: true })
export class FamilyRelationship {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Family', required: true })
  family1: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Family', required: true })
  family2: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    enum: FamilyRelationshipType,
    default: FamilyRelationshipType.OTHER,
  })
  relationshipType: FamilyRelationshipType;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Individual' })
  member1?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Individual' })
  member2?: MongooseSchema.Types.ObjectId;

  @Prop({ type: String })
  description: string;
}

export const FamilyRelationshipSchema =
  SchemaFactory.createForClass(FamilyRelationship);
