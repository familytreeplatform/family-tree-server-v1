import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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

  @Prop()
  secretToken: string;

  @Prop()
  secretTokenExpiration: string;

  @Prop()
  profilePic: string;

  @Prop({ default: 'primaryuser' })
  role: string;

  @Prop({ default: false })
  deleted: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const PrimaryUserSchema = SchemaFactory.createForClass(PrimaryUser);
