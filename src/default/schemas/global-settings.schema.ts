import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PrimaryUser } from 'src/users/schemas';

export type GlobalSettingsDocument = HydratedDocument<GlobalSettings>;

@Schema({ strict: false, timestamps: true })
export class GlobalSettings {
  @Prop({ type: 'ObjectId', ref: 'PrimaryUser', required: true })
  user: PrimaryUser;

  @Prop({ type: Boolean, default: true })
  isOPenToChat: boolean;

  @Prop({ type: Boolean, default: false })
  isOPenToVisit: boolean;

  @Prop({ type: Boolean, default: true })
  isOPenToCall: boolean;

  @Prop({ type: Boolean, default: true })
  isOPenToEmail: boolean;
}

export const GlobalSettingsSchema =
  SchemaFactory.createForClass(GlobalSettings);
