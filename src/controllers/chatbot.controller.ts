import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ApiMyResponse } from 'src/decorators/myResponse.decorator';
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
  @ApiMyResponse({
    status: 201,
    description: 'Chat response and history',
    model: String,
  })
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
    await this.chatbotService.generateChatResponse(prompt, chatId);
    const history = await this.chatbotService.getChatHistory(chatId);
    return history.slice(2);
  }
}
