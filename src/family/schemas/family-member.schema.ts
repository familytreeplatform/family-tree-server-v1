import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
// import { PrimaryUser } from 'src/users/schemas';
import { FamilyRelationshipsEnum } from '../types';

export type FamilyMemberDocument = HydratedDocument<FamilyMember>;

@Schema({ timestamps: true })
export class FamilyMember {
  @Prop({ type: String, enum: FamilyRelationshipsEnum })
  relationshipToRoot: FamilyRelationshipsEnum;

  @Prop()
  familyUsername: string;

  @Prop()
  familyType: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Family' })
  family: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'PrimaryUser',
    required: true,
  }) // Reference to the User collection
  user: MongooseSchema.Types.ObjectId; // Id of the family member

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PrimaryUser' }) // Reference to the User collection
  parent: MongooseSchema.Types.ObjectId; // Id of the family member
}

export const FamilyMemberSchema = SchemaFactory.createForClass(FamilyMember);
