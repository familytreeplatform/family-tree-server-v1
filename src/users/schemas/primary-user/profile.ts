import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PrimaryUserProfileDocument = HydratedDocument<PrimaryUserProfile>;

@Schema({ strict: false, timestamps: true })
export class PrimaryUserProfile {
  @Prop({ required: true })
  gender: string;

  @Prop({ required: true })
  dob: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  state: string;

  @Prop()
  address: string;

  @Prop()
  bio: string;

  @Prop()
  socials: string[];
}

export const PrimaryUserProfileSchema =
  SchemaFactory.createForClass(PrimaryUserProfile);
