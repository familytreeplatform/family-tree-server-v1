import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { HelperFn } from 'src/common/helpers/helper-fn';
import {
  Conversation,
  ConversationDocument,
  Message,
  MessageDocument,
} from './schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { ConversationSummaryType } from './types';
import { GetMessagesDto } from './dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name)
    private Message: Model<MessageDocument>,
    @InjectModel(Conversation.name)
    private Conversation: Model<ConversationDocument>,
  ) {}

  private logger = new Logger(ChatService.name);

  async saveMessage(fromId: ObjectId, toId: ObjectId, content: string) {
    try {
      const conversationUpsert = await this.Conversation.findOneAndUpdate(
        {
          $or: [
            { initiator: fromId, participant: toId },
            { initiator: toId, participant: fromId },
          ],
        },
        {
          $set: {
            initiator: fromId,
            participant: toId,
          },
        },
        {
          upsert: true,
          new: true,
        },
      ).exec();

      const savedMessage = await this.Message.create({
        fromId,
        toId,
        content,
        conversation: conversationUpsert.id,
      });

      conversationUpsert.messages.push(savedMessage.id);
      await conversationUpsert.save();

      return savedMessage;
    } catch (error) {
      this.logger.error(
        `Error creating chat ${JSON.stringify(error, null, 2)}`,
      );
    }
  }

  async getConversations(userId: ObjectId) {
    const conversations = await this.Conversation.find({
      $or: [{ initiator: userId }, { participant: userId }],
    })
      .sort({ 'messages.timestamp': -1 })
      .populate('initiator participant messages')
      .exec();

    const conversationSummary: ConversationSummaryType = conversations.map(
      (conversation) => {
        const lastMessage = conversation.messages[conversation.messages.length - 1];

        return {
          conversationId: conversation.id,
          lastMessage: lastMessage ? lastMessage.content : '',
          usernames: [
            conversation.initiator.userName,
            conversation.participant.userName,
          ],
          timestamp: lastMessage ? lastMessage.timestamp : null,
        };
      },
    );

    return conversationSummary;
  }

  async getMessages(dto: GetMessagesDto) {
    const skip: number = (dto.pageNo - 1) * dto.pageSize

    const messages = await this.Message
    .find({conversation: dto.id})
    .sort({timestamp: -1})
    .skip(skip)
    .limit(dto.pageSize)
    .exec()

    return messages.map((message) => (
      {
      messageId: message.id,
      content: message.content,
      from: message.fromId,
      to: message.toId,
      timestamp: message.timestamp
    }))
  }

  async getUserFromSocket(socket: Socket) {
    let payload: { sub: any };
    let auth_token: string = socket.handshake.headers.authorization;

    if (!auth_token)
      throw new WsException('Please provide an authorization token');

    auth_token = auth_token.split(' ')[1];

    if (auth_token) payload = HelperFn.verifyJwtToken(auth_token);

    return payload.sub;
  }
}
