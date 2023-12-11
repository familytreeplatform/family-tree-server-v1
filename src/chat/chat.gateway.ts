import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ObjectId } from 'mongoose';
import { ChatService } from './chat.service';
import { MessageDto } from './dto';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection {
  private store = new Map<ObjectId, string>();

  constructor(private chat: ChatService){}

  private logger = new Logger(ChatGateway.name);

  async handleConnection(socket: Socket) {
    const userId = await this.chat.getUserFromSocket(socket)

    this.store.set(userId, socket.id);

    this.logger.log(`<io: ${socket.id}># a user connected`);


    socket.on('disconnect', () => {
      this.store.delete(userId)
      this.logger.log(`<io># user with ID ${userId} disconnected`);
    });
  }

  @SubscribeMessage('send_message')
  async handleEvent(@MessageBody() dto: MessageDto, @ConnectedSocket() socket: Socket) {
    const senderId = await this.chat.getUserFromSocket(socket) as ObjectId
    const receiverSocketId = this.store.get(dto.toId as ObjectId)

    //store message in DB
    await this.chat.saveMessage(senderId, dto.toId as ObjectId, dto.message)

   socket.to(receiverSocketId).emit('send_message', dto.message)
  }
}
