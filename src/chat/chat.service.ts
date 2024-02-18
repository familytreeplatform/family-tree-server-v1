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
import { ConversationSummaryType, MessageSummaryType, ReceiverInfo } from './types';
import { GetMessagesDto } from './dto';
import { IResponse } from 'src/interfaces';

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
        const lastMessage =
          conversation.messages[conversation.messages.length - 1];

        //Logic to get other participant in conversations username
        let receiverInfo: ReceiverInfo =
          userId === (conversation.initiator as any).id
            ? {
                username: conversation.participant.userName,
                profilePic: conversation.participant.profilePic,
              }
            : {
                username: conversation.initiator.userName,
                profilePic: conversation.initiator.profilePic,
              };

        return {
          conversationId: conversation.id,
          lastMessage: lastMessage ? lastMessage.content : '',
          receiverInfo,
          timestamp: lastMessage ? lastMessage.timestamp : null,
        };
      },
    );

    return conversationSummary;
  }

  async getMessages(dto: GetMessagesDto): Promise<MessageSummaryType> {
    const skip: number = (dto.pageNo - 1) * dto.pageSize;

    let queryConditions = [];
    if (dto.fromId && dto.toId) {
      queryConditions.push({
        $or: [
          { $and: [{ fromId: dto.fromId }, { toId: dto.toId }] },
          { $and: [{ fromId: dto.toId }, { toId: dto.fromId }] },
        ],
      });
    } else {
      queryConditions.push({ conversation: dto.conversationId });
    }

    this.logger.log(
      'MESSAGES_QUERY_CONDITIONS',
      JSON.stringify(queryConditions[0], null, 1),
    );

    const messages = await this.Message.find(queryConditions[0])
      .sort({ timestamp: -1 })
      .populate('fromId toId')
      .skip(skip)
      .limit(dto.pageSize)
      .exec();

    return messages.map((message) => ({
      messageId: message.id,
      content: message.content,
      from: {
        userId: (message.fromId as any).id,
        username: message.fromId.userName,
      },
      to: {
        userId: (message.toId as any).id,
        username: message.toId.userName,
      },
      timestamp: message.timestamp,
    }));
  }

  async getUserFromSocket(socket: Socket) {
    const auth_token: string = socket.handshake.headers.authorization;

    if (!auth_token)
      return <IResponse>{
        statusCode: 401,
        message: 'invalid authorization header, token missing',
        data: null,
        error: {
          code: 'auth_token_missing',
          message: `authorization token not found in Authorization header`,
        },
      };

    const split_auth_token = auth_token.split(' ')[1];

    if (!split_auth_token)
      return <IResponse>{
        statusCode: 403,
        message: 'invalid token, login to request a new one',
        data: null,
        error: {
          code: 'invalid_token',
          message: `invalid authorization token`,
        },
      };

    const payload = HelperFn.verifyJwtToken(split_auth_token);

    return payload.sub;
  }
}
