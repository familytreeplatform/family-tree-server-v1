import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PrimaryUser } from 'src/users/schemas';

export type FamilyDocument = HydratedDocument<Family>;

@Schema({ timestamps: true })
export class Family {
  @Prop({ required: true, unique: true })
  familyName: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  tribe: string;

  @Prop({ type: 'ObjectId', ref: 'PrimaryUser', required: true }) // Reference to the User collection
  root: PrimaryUser; // Link the root to a User

  @Prop({ required: true })
  familyBio: string;

  @Prop({ required: true })
  familyUsername: string;

  @Prop({ required: true })
  familyJoinLink: string;
}

export const FamilySchema = SchemaFactory.createForClass(Family);
