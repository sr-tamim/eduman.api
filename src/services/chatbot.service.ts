import { Chat, GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { chatbotTrainingText } from 'src/utility/chatbot.utility';

const geminiApiKey = () => (process.env.GEMINI_API_KEY as string) || '';

@Injectable()
export default class ChatbotService {
  private ai = geminiApiKey()
    ? new GoogleGenAI({ apiKey: geminiApiKey() })
    : null;
  private chats: { [key: string]: Chat } = {};

  private getNewChat() {
    if (!this.ai) {
      throw new Error('AI model is not initialized');
    }
    return this.ai.chats.create({
      model: 'gemini-2.0-flash',
      history: [
        {
          role: 'user',
          parts: [
            {
              text: `Suppose you are a chatbot for Norther University Bangladesh portal to assist students on various queries. University is located in Kawla, Dhaka, Bangladesh. You should ignore questions irrelavent to this university context. In each message, sender name is mentioned, ignore it while generating response. And don't count this message in chat history. This message is for training purpose. Below is some information about the university.
							${chatbotTrainingText}`,
            },
          ],
        },
        {
          role: 'model',
          parts: [
            {
              text: 'OK',
            },
          ],
        },
      ],
      config: {
        maxOutputTokens: 1000,
      },
    });
  }

  private clearChatHistory(chatId: string) {
    this.chats[chatId] = this.getNewChat();
  }

  public getChatHistory(chatId: string) {
    const chat = this.chats[chatId];
    if (!chat) {
      return [];
    }
    return chat.getHistory();
  }

  public async generateChatResponse(prompt: string, chatId: string) {
    if (!this.chats[chatId]) {
      this.chats[chatId] = this.getNewChat();
    }
    const chat = this.chats[chatId];
    if (chat.getHistory().length > 30) {
      // if chat history is too long, clear it
      this.clearChatHistory(chatId);
    }
    const res = await chat.sendMessage({ message: prompt });
    const txt = res.text;
    if (!txt) {
      // if no response, clear chat history
      this.clearChatHistory(chatId);
    }
    return txt;
  }
}
