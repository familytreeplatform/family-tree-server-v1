import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';
import { Family } from 'src/family/schemas';

export type PrimaryUserDocument = HydratedDocument<PrimaryUser>;

@Schema({ strict: false, timestamps: true })
export class PrimaryUser {
  @Prop({ type: 'ObjectId', ref: 'Family' }) // Reference to the Family collection
  familyRootedTo: Family; // If user is being made root link the User to the Family

  @Prop({ unique: true, sparse: true })
  email: string;

  @Prop({ unique: true })
  phone: string;

  @Prop({ unique: true })
  userName: string;

  @Prop()
  fullName: string;

  @Prop()
  password: string;

  @Prop()
  secretToken: string;

  @Prop()
  secretTokenExpiration: string;

  @Prop({ default: '' })
  profilePic: string;

  @Prop({ default: 'primaryuser' })
  role: string;

  @Prop({ type: 'ObjectId', ref: 'Family' })
  families: Family[];

  @Prop({ type: 'ObjectId', ref: 'PrimaryUser' })
  creator?: PrimaryUser;

  @Prop({ default: false })
  deleted: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const PrimaryUserSchema = SchemaFactory.createForClass(PrimaryUser);
