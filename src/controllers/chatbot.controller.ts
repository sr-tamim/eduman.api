import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ChatbotPromptDto } from 'src/dto/chatbot.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import ChatbotService from 'src/services/chatbot.service';
import { getUser } from 'src/utility/misc.utility';

@ApiTags('Chatbot')
@Controller({
  version: '1',
  path: 'chatbot',
})
@UseInterceptors(TransformInterceptor)
export default class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @ApiOperation({ summary: 'Get chat response and history' })
  @ApiBody({
    description: 'Chat prompt',
    type: ChatbotPromptDto,
  })
  @UseGuards(AuthGuard)
  @Post('/chat')
  async getChatResponse(
    @Req() req: Request,
    @Body() chatDto: { prompt: string },
  ) {
    const user = getUser(req);
    const chatId = user!.id?.toString();
    const { prompt } = chatDto;
    if (!prompt) {
      throw new BadRequestException('Prompt is required');
    }
    await this.chatbotService.generateChatResponse(prompt, chatId);
    const history = await this.chatbotService.getChatHistory(chatId);
    return history.slice(1);
  }

  @ApiOperation({ summary: 'Get chat history' })
  @UseGuards(AuthGuard)
  @Get('/history')
  async getChatHistory(@Req() req: Request) {
    const user = getUser(req);
    const chatId = user!.id?.toString();
    const history = await this.chatbotService.getChatHistory(chatId);
    return history.slice(1);
  }

  @ApiOperation({ summary: 'Clear chat history' })
  @UseGuards(AuthGuard)
  @Delete('/history')
  async clearChatHistory(@Req() req: Request) {
    const user = getUser(req);
    const chatId = user!.id?.toString();
    this.chatbotService.clearChatHistory(chatId);
    const history = await this.chatbotService.getChatHistory(chatId);
    return history.slice(1);
  }
}
