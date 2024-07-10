import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { ProductService } from '../product/services/product.service'; // Import ProductService

@Injectable()
export class BotService implements OnModuleInit {
  private readonly bot: TelegramBot;
  private readonly logger = new Logger(BotService.name);

  constructor(private readonly productService: ProductService) {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
  }

  onModuleInit() {
    // Handle when the bot is added to a new group
    this.bot.on('message', async (msg) => {
      if (msg.group_chat_created || (msg.new_chat_members && msg.new_chat_members.some(member => member.id === this.bot.id))) {
        const chatId = msg.chat.id;
        this.bot.sendMessage(chatId, 'Hello! I am your helpful bot. How can I assist you today?');
      }

      // Handle when a new user joins the group
      if (msg.new_chat_members) {
        msg.new_chat_members.forEach((newMember) => {
          const chatId = msg.chat.id;
          this.bot.sendMessage(chatId, `Welcome, ${newMember.first_name}! Feel free to ask any questions.`);
        });
      }

      // Handle all messages in the group
      if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
        this.saveMessageToDatabase(msg);
      }
    });

    // Handle /start command
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(chatId, 'If you have missed the cryptocurrency market and feel that it is too late to enter, we will give you another chance. By receiving our token, you will have a new opportunity to invest.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Launch ICO Site', web_app: { url: 'https://4bridges.ch/en/porsche-cayman-token/' } }],
            [{ text: 'Launch Game', web_app: { url: 'https://t.farschain.com' } }]
          ]
        }
      });
    });
  }

  private async saveMessageToDatabase(msg: TelegramBot.Message) {
    try {
      // Implement your logic to save the message to the database using your repository layer
      // Example:
      const savedMessage = await this.productService.saveMessage({
        chatId: msg.chat.id,
        userId: msg.from.id,
        userName: msg.from.username,
        text: msg.text,
        date: msg.date
      });
      this.logger.log(`Message saved to database: ${savedMessage}`);
    } catch (error) {
      this.logger.error('Failed to save message to database', error);
    }
  }
}
