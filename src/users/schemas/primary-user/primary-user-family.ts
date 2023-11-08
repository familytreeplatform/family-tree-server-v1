import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PlaceInFamily, RelationshipToRoot } from 'src/users/enums/enums';
import { PrimaryUser } from './primary-user.schema';

export type PrimaryUserFamilyDocument = HydratedDocument<PrimaryUserFamily>;

@Schema({ strict: false, timestamps: true })
export class PrimaryUserFamily {
  //   @Prop({ type: [{ type: Types.ObjectId, ref: 'Family' }] })
  //   familyId: Family;

  @Prop()
  familyName: string;

  @Prop({ enum: PlaceInFamily, default: 'member' })
  placeInFamily: string;

  @Prop({ enum: RelationshipToRoot, required: true })
  relationshipToRoot: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'PrimaryUser' }] })
  directRelations: PrimaryUser[];
}

export const PrimaryUserFamilySchema =
  SchemaFactory.createForClass(PrimaryUserFamily);
