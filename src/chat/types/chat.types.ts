import { ObjectId } from 'mongoose';

export type ConversationSummaryType = {
  conversationId: ObjectId;
  lastMessage: string;
  receiverInfo: ReceiverInfo;
  timestamp: Date;
}[];

export type ReceiverInfo = {
  username: string;
  profilePic: string;
};
