import {
  Controller,
  Post,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Query,
  Req,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { WebSocketServer, WebSocketGateway, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    const chatId = socket.handshake.query.chatId;
    if (chatId) {
      socket.join(`chat:${chatId}`);
    }
  }

  constructor(private readonly chatService: ChatService) {}

  @Post()
  async createChat(@Req() req, @Body() dto: CreateChatDto) {
    return this.chatService.createChat(req.user?.primarykey, dto);
  }

  @Post('message')
  async sendMessage(@Req() req, @Body() dto: SendMessageDto) {
    if (!req.user?.primarykey) {
      throw new BadRequestException('User ID not found in request');
    }
    console.log('Sending message from user:', req.user?.primarykey);
    return this.chatService.sendMessage({
      userId: req.user?.primarykey,
      ...dto,
    });
  }

  @Post('upload/:chatId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Param('chatId') chatId: string,
  ) {
    return this.chatService.uploadChatFile(req.user?.primarykey, file, chatId);
  }

  @Get('messages/:chatId')
  async getMessages(
    @Param('chatId') chatId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.chatService.getChatMessages(chatId, page, limit);
  }

  @Get('my')
  async getUserChats(@Req() req) {
    return this.chatService.getUserChats(req.user?.primarykey);
  }

  @Post('private/:recipientId')
  async createOrGetPrivateChat(
    @Req() req,
    @Param('recipientId') recipientId: string,
  ) {
    const userId = req.user?.primarykey;

    if (!userId || !recipientId) {
      throw new BadRequestException('Invalid user IDs');
    }

    try {
      const chat = await this.chatService.getOrCreatePrivateChat(
        userId,
        recipientId,
      );
      if (!chat) {
        throw new NotFoundException('Failed to create or find chat');
      }
      return { chatId: chat.primarykey };
    } catch (error) {
      throw new InternalServerErrorException('Failed to process chat request');
    }
  }
}
