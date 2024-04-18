/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { PrimaryUser } from 'src/users/schemas';
import { Family } from './create-family.schema';

export type FamilyWikiDocument = HydratedDocument<FamilyWiki>;

@Schema({ timestamps: true })
export class FamilyWiki {
  @Prop({ type: 'ObjectId' })
  _id: any;

  @Prop({ type: 'ObjectId', ref: 'Family', required: true })
  family: Family;

  @Prop()
  wiki: string;

  @Prop({ ref: 'PrimaryUser' })
  editors: PrimaryUser[];
}

export const FamilyWikiSchema = SchemaFactory.createForClass(FamilyWiki);
