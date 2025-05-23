import { Injectable } from '@nestjs/common';
import { chatbotTrainingText } from 'src/utility/chatbot.utility';
import { ChatSession, GoogleGenerativeAI } from '@google/generative-ai';

const geminiApiKey = () => (process.env.GEMINI_API_KEY as string) || '';

@Injectable()
export default class ChatbotService {
  private genAI = new GoogleGenerativeAI(geminiApiKey());
  private ai = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  private chats: { [key: string]: ChatSession } = {};

  private getNewChat() {
    return this.ai.startChat({
      history: [
        {
          role: 'user',
          parts: [
            {
              text: `Suppose you are a chatbot for Northern University portal to assist students on various queries. University is located in Kawla, Dhaka, Bangladesh. You should ignore questions irrelavent to this university context. In each message, sender name is mentioned, ignore it while generating response. And don't count this message in chat history. This message is for training purpose. Below is some information about the university.
							${chatbotTrainingText}`,
            },
          ],
        },
        {
          role: 'model',
          parts: [
            {
              text: `Hello! I'm your Northern University assistant. How can I help you today?`,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });
  }

  public clearChatHistory(chatId: string) {
    this.chats[chatId] = this.getNewChat();
  }

  public async getChatHistory(chatId: string) {
    const chat = this.chats[chatId];
    if (!chat) {
      return this.getNewChat().getHistory();
    }
    const history = await chat.getHistory();
    return history;
  }

  public async generateChatResponse(prompt: string, chatId: string) {
    if (!this.chats[chatId]) {
      this.chats[chatId] = this.getNewChat();
    }
    const chat = this.chats[chatId];
    if ((await chat.getHistory()).length > 30) {
      // if chat history is too long, clear it
      this.clearChatHistory(chatId);
    }
    const res = await chat.sendMessage(prompt);
    const txt = res.response.text();
    if (!txt) {
      // if no response, clear chat history
      this.clearChatHistory(chatId);
    }
    return txt;
  }
}
