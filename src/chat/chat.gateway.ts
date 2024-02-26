import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ObjectId } from 'mongoose';
import { MessageDto } from './dto';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
})
export class ChatGateway implements OnGatewayConnection {
  private logger = new Logger(ChatGateway.name);
  private store = new Map<ObjectId, string>();

  constructor(private chat: ChatService) {}

  async handleConnection(socket: Socket) {
    const userId = await this.chat.getUserFromSocket(socket);
    this.logger.log(
      `chat socket connection detected from user ID: [${userId}] with new socketId [${socket.id}]:::::::::`,
    );

    this.store.set(userId, socket.id);
    console.log('STORE', this.store);

    this.logger.log(`<io: ${socket.id}># a user connected`);

    socket.on('disconnect', () => {
      this.store.delete(userId);
      this.logger.log(`<io># user with ID ${userId} disconnected`);
    });
  }

  @SubscribeMessage('send_message')
  async handleEvent(
    @MessageBody() dto: MessageDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const senderId = (await this.chat.getUserFromSocket(socket)) as ObjectId;

    if (this.store.has(dto.toId)) {
      const receiverSocketId = this.store.get(dto.toId as ObjectId);

      console.log('SENDER_ID', senderId);
      console.log('RECEIVER_SOCKET_ID', receiverSocketId);

      this.logger.log(
        `emitting message ${
          (JSON.stringify(dto.message), null, 2)
        } to receiver via socket ID: ${receiverSocketId}`,
      );
      socket.to(receiverSocketId).emit('send_message', dto.message);
    } else this.logger.log(`user with id [${dto.toId}] not found in store`);

    //store message in DB
    this.logger.log(`persisting message in DB...`);
    await this.chat.saveMessage(senderId, dto.toId as ObjectId, dto.message);
  }
}
