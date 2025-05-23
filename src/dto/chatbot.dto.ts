import { ApiProperty } from '@nestjs/swagger';

export class ChatbotPromptDto {
  @ApiProperty({ description: 'Prompt for the chatbot' })
  prompt: string;
}
