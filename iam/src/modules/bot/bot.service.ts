import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { AchievementService } from '../qr/services/qr-achievment.service';  // Import the AchievementService

@Injectable()
export class BotService implements OnModuleInit {
  private readonly bot: TelegramBot;
  private readonly logger = new Logger(BotService.name);

  // Inject the AchievementService
  constructor(
    private readonly achievementService: AchievementService,  // Use AchievementService instead of ProductService
  ) {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN_MAGHAZI, { polling: true });
  }

  onModuleInit() {
    // Handle /start command with parameters
    this.bot.onText(/\/start(.*)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const params = match[1]?.trim();
      console.log("Received params:", params); // Add logging here to debug

      if (params) {
        // Parse the parameters passed to the bot
        const decodedParams = decodeURIComponent(params);
        console.log("Decoded Params:", decodedParams); // Log decoded params
        const paramObj = this.parseStartParams(decodedParams);

        console.log("Parsed Params Object:", paramObj); // Log parsed object

        if (paramObj.said) {
          try {
            // Use the AchievementService to find the selected achievement by ID
            const achievementSelected = await this.achievementService.findAchievementSelectedById(paramObj.said);
            
            if (achievementSelected) {
              const achievementId = achievementSelected.achievementId;
              const parentId = achievementSelected.userId;

              // Generate referral link dynamically
              const referralLink = `${process.env.CORS_ORIGIN}/qrApp?a=${achievementId}&p=${parentId}&t=s&chatId=${chatId}`;
              
              this.bot.sendMessage(chatId, 'Launching the app with your referral link:', {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: 'Launch App', web_app: { url: referralLink } }]
                  ]
                }
              });
            } else {
              this.bot.sendMessage(chatId, 'Invalid referral link.');
            }
          } catch (error) {
            this.logger.error('Error fetching achievement selected by ID', error);
            this.bot.sendMessage(chatId, 'An error occurred while processing your request.');
          }
        }
      } else {
        // Generate referral link dynamically
        const referralLink = `${process.env.CORS_ORIGIN}/qrApp?t=s&chatId=${chatId}`;
                      
        this.bot.sendMessage(chatId, 'Launching the app with your referral link:', {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Launch App', web_app: { url: referralLink } }]
            ]
          }
        });
      }
    });
  }

  // Helper method to parse the start parameters
  private parseStartParams(params: string): { said?: string } {
    const paramObj: { said?: string } = {};

    try {
      console.log('Params:', params);
      // Split parameters by `&`
      const paramPairs = params.split('&');
      paramPairs.forEach((pair) => {
        const [key, value] = pair.split('=');
        if (key === 'said') {
          paramObj.said = value;
        }
      });
    } catch (error) {
      console.error('Error parsing params:', error);
    }

    console.log('Parsed Params:', paramObj); // Log parsed params object
    return paramObj;
  }
}
