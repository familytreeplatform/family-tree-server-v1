import { ObjectId } from "mongoose"

export type ConversationSummaryType = {
  conversationId: ObjectId
  lastMessage: string,
  usernames: string[],
  timestamp: Date
}[]