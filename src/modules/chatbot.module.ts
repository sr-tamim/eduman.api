import { Module } from '@nestjs/common';
import ChatbotController from 'src/controllers/chatbot.controller';
import ChatbotService from 'src/services/chatbot.service';

@Module({
  providers: [ChatbotService],
  controllers: [ChatbotController],
})
export default class ChatbotModule {}
