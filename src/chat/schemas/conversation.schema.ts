import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { PrimaryUser } from 'src/users/schemas';
import { Message } from './message.schema';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ strict: false, timestamps: true })
export class Conversation {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'PrimaryUser' })
  initiator: PrimaryUser;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'PrimaryUser' })
  participant: PrimaryUser;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }] })
  messages: Message[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
