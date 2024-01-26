import { ObjectId } from 'mongoose';

export type ConversationSummaryType = {
  conversationId: ObjectId;
  lastMessage: string;
  receiverInfo: ReceiverInfo;
  timestamp: Date;
}[];

export type MessageSummaryType = {
  messageId: Object;
  content: string;
  from: UserInfo;
  to: UserInfo;
  timestamp: Date;
}[];

export type ReceiverInfo = {
  username: string;
  profilePic: string;
};

export type UserInfo = {
  userId: ObjectId
  username: string;
}
