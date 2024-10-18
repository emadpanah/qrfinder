import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { ProductService } from '../product/services/product.service'; // Import ProductService

@Injectable()
export class BotService implements OnModuleInit {
  private readonly bot: TelegramBot;
  private readonly logger = new Logger(BotService.name);

  constructor(private readonly productService: ProductService) {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN_MAGHAZI, { polling: true });
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

    // Handle /start command with parameters (like referral)
    this.bot.onText(/\/start(.*)/, (msg, match) => {
      const chatId = msg.chat.id;
      const params = match[1]?.trim();
    
      if (params) {
        // Parse the parameters passed to the bot
        const decodedParams = decodeURIComponent(params);
        const paramObj = this.parseStartParams(decodedParams);
    
        if (paramObj.achievementId && paramObj.parentId) {
          // Include chatId in the referral link
          const referralLink = `${process.env.TELEGRAM_BOT_URL_MAGHAZI}/qrApp?a=${paramObj.achievementId}&p=${paramObj.parentId}&t=a&chatId=${chatId}`;
          
          this.bot.sendMessage(chatId, 'Launching the app with your referral link:', {
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Launch App', web_app: { url: referralLink } }]
              ]
            }
          });
        } else {
          // Default /start behavior without parameters
          this.bot.sendMessage(chatId, 'Welcome! Use the app to earn rewards.');
        }
      } else {
        // Default /start behavior without parameters
        this.bot.sendMessage(chatId, 'Welcome! Use the app to earn rewards.');
      }
    });
  }

  // Helper method to parse the start parameters
  private parseStartParams(params: string): { achievementId?: string; parentId?: string } {
    const paramObj: { achievementId?: string; parentId?: string } = {};

    // Split parameters and parse each key-value pair
    const paramPairs = params.split('&');
    paramPairs.forEach((pair) => {
      const [key, value] = pair.split('=');
      if (key === 'achievementId') {
        paramObj.achievementId = value;
      }
      if (key === 'parentId') {
        paramObj.parentId = value;
      }
    });

    return paramObj;
  }

  private async saveMessageToDatabase(msg: TelegramBot.Message) {
    try {
      // Implement your logic to save the message to the database using your repository layer
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
