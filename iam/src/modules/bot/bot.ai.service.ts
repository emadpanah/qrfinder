import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { OpenAI } from 'openai';
import { ProductService } from '../product/services/product.service';
import { DataRepository } from '../data/database/repositories/data.repository'; // Import DataRepository
import { isEmpty } from 'validator';

@Injectable()
export class BotAIService implements OnModuleInit {
  private readonly bot: TelegramBot;
  private readonly apiKey = process.env.CHATGPT_API_KEY;
  private readonly logger = new Logger(BotAIService.name);
  private openai = new OpenAI({ apiKey: this.apiKey });
  private botUsername: string;

  private conversationHistory: { role: string; content: string }[] = [];

  private prompts = [
    // Existing prompts...
  ];

  constructor(
    private readonly productService: ProductService,
    private readonly fngRepository: DataRepository // Inject DataRepository
  ) {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
  }

  async getChatGptResponse(prompt: string): Promise<string> {
    this.conversationHistory.push({ role: 'user', content: prompt });

    try {
      const stream = await this.openai.chat.completions.create({
        messages: [
          { role: "system", content: "شما به عنوان یک مشاور سرمایه‌گذاری با تخصص در بازارهای فارکس و کریپتو عمل می‌کنید. لطفاً فقط در این دو حوزه به من پیشنهادات و راهنمایی‌های سرمایه‌گذاری ارائه دهید و به سایر حوزه‌ها اشاره نکنید." },
          { role: "user", content: prompt }
        ],
        model: "gpt-4o-mini-2024-07-18"
      });

      const responseMessage = stream.choices[0].message.content.trim();
      this.conversationHistory.push({ role: 'assistant', content: responseMessage });
      this.logger.log(`Response from ChatGPT: ${responseMessage}`);
      return responseMessage;
    } catch (error) {
      console.error('Error fetching response from ChatGPT:', error);
      return 'Error fetching response from ChatGPT.';
    }
  }

  async getFngData(): Promise<string> {
    // Fetch the latest FNG data from the database
    const fngData = await this.fngRepository.findLast15Days();
    if (!fngData.length) {
      return 'اطلاعات جدیدی از شاخص ترس و طمع در دسترس نیست.';
    }

    // Get the latest data
    const latestFngData = fngData[fngData.length - 1];
    return `شاخص ترس و طمع فعلی: ${latestFngData.value} (${latestFngData.value_classification}) در تاریخ ${new Date(latestFngData.timestamp * 1000).toLocaleString('fa-IR')}`;
  }

  async getFngResponseWithChatGpt(): Promise<string> {
    const fngDataSummary = await this.getFngData();
    const prompt = `شاخص ترس و طمع فعلی: ${fngDataSummary}. با توجه به این شاخص، چه توصیه‌ای برای سرمایه‌گذاری دارید؟`;
    
    return this.getChatGptResponse(prompt);
  }

  async onModuleInit() {
    const me = await this.bot.getMe();
    this.botUsername = me.username;
    this.logger.log(`Bot username: @${this.botUsername}`);

    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text?.toLowerCase();

      // Detect "/fng" command or keywords related to FNG
      if (text === '/fng' || text.includes('fear and greed') || text.includes('شاخص ترس و طمع')) {
        const chatGptResponse = await this.getFngResponseWithChatGpt();
        await this.bot.sendMessage(chatId, chatGptResponse);
        return;
      }

      // Handle help command
      if (msg.text === '/help') {
        const inlineKeyboard = this.prompts.map((prompt, index) => [{
          text: prompt.length > 150 
            ? `${prompt.slice(0, 147)}...` 
            : prompt,
          callback_data: `prompt_${index}`
        }]);

        await this.bot.sendMessage(chatId, 'لطفاً یکی از سوالات زیر را انتخاب کنید:', {
          reply_markup: {
            inline_keyboard: inlineKeyboard
          }
        });
        return;
      }

      // General message handling
      if (msg.text) {
        this.logger.log('Received text message:', msg.text);
        let responseText = await this.getChatGptResponse(msg.text);

        this.bot.sendMessage(chatId, responseText).catch((err) => {
          this.logger.error('Failed to send message', err);
        });
      }
    });

    // Callback query handler
    this.bot.on('callback_query', async (callbackQuery) => {
      const chatId = callbackQuery.message.chat.id;
      const data = callbackQuery.data;

      if (data.startsWith('prompt_')) {
        const promptIndex = parseInt(data.split('_')[1], 10);
        const selectedPrompt = this.prompts[promptIndex];

        await this.bot.sendMessage(chatId, `پرسش انتخابی شما: ${selectedPrompt}`);

        const chatGptResponse = await this.getChatGptResponse(selectedPrompt);
        this.bot.sendMessage(chatId, chatGptResponse).catch((err) => {
          this.logger.error('Failed to send message', err);
        });
      }
    });
  }
}
