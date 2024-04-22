/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Family } from 'src/family/schemas';
import { PrimaryUserWiki } from '..';
import { GlobalSettings } from 'src/default/schemas';

export type PrimaryUserDocument = HydratedDocument<PrimaryUser>;

@Schema({ strict: false, timestamps: true })
export class PrimaryUser {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Family' }) // Reference to the Family collection
  familyRootedTo: MongooseSchema.Types.ObjectId; // If user is being made root link the User to the Family

  @Prop({ unique: true, sparse: true })
  email: string;

  @Prop({ unique: true, sparse: true })
  phone: string;

  @Prop({ unique: true, sparse: true })
  userName: string;

  @Prop()
  fullName: string;

  @Prop()
  password: string;

  @Prop()
  secretToken: string;

  @Prop()
  secretTokenExpiration: string;

  @Prop()
  profilePic: string;

  @Prop({ default: 'primaryuser' })
  role: string;

  @Prop({ ref: 'Family' })
  families: Family[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PrimaryUser' })
  creator?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PrimaryUserWiki' })
  wiki: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'PrimaryUseGlobalSettings',
  })
  globalSettings: MongooseSchema.Types.ObjectId;

  @Prop({ default: false })
  deleted: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const PrimaryUserSchema = SchemaFactory.createForClass(PrimaryUser);

// PrimaryUserSchema.virtual('membersCount').get(function () {
//   return this.families.map(function (family) {
//     return family.members.length;
//   });
// });
