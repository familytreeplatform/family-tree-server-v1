import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PrimaryUser } from 'src/users/schemas';

export type PrimaryuserWikiDocument = HydratedDocument<PrimaryUserWiki>;

@Schema({ timestamps: true })
export class PrimaryUserWiki {
  @Prop({ type: 'ObjectId', ref: 'PrimaryUser', required: true })
  user: PrimaryUser;

  @Prop()
  wiki: string;
}

export const PrimaryUserWikiSchema =
  SchemaFactory.createForClass(PrimaryUserWiki);
