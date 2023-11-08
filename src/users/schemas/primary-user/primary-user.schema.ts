import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PrimaryUserProfile } from './profile';

export type PrimaryUserDocument = HydratedDocument<PrimaryUser>;

@Schema({ strict: false, timestamps: true })
export class PrimaryUser {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ unique: true, required: true })
  phone: string;

  @Prop({ unique: true, required: true })
  userName: string;

  @Prop()
  fullName: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: { type: Types.ObjectId, ref: 'PrimaryUserProfile' } })
  profile: PrimaryUserProfile;

  @Prop()
  secretToken: string;

  @Prop({ default: 'primaryuser' })
  role: string;

  @Prop({ default: false })
  deleted: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const PrimaryUserSchema = SchemaFactory.createForClass(PrimaryUser);
