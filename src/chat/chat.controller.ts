import { Controller, Post, Get, UseGuards, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtGuard } from 'src/common/guards';
import { GetUser } from 'src/common/decorators';
import { ObjectId } from 'mongoose';
import { GetMessagesDto } from './dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Chat')
@UseGuards(JwtGuard)
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversation')
  createMessage(@GetUser('id') userId: ObjectId) {
    return this.chatService.getConversations(userId);
  }

  @Get('messages')
  getMessages(@Query() dto: GetMessagesDto) {
    return this.chatService.getMessages(dto);
  }
}
