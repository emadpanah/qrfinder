import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { OpenAI } from 'openai';
import { ProductService } from '../product/services/product.service'; // Import ProductService
import { ProductDto } from '../product/dto/product.dto'; // Import ProductDto
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
    "سلام! آیا می‌تونید به من کمک کنید تا با توجه به هدف‌ها و سطح ریسک‌پذیری‌ام، یک گزینه مناسب برای سرمایه‌گذاری پیدا کنم؟ بازارهای فارکس و کریپتو چطور هستند و کدام یک بیشتر با شرایط من سازگاره؟",
    "می‌خواهم در یکی از بازارهای مالی فارکس یا کریپتو سرمایه‌گذاری کنم. با توجه به سطح ریسک و میزان زمانی که برای نظارت بر سرمایه‌گذاری دارم، شما کدام یک رو پیشنهاد می‌کنید؟ مزایا و معایب هر کدام چیه؟",
    "چطور می‌تونم در هر دو بازار فارکس و کریپتو سرمایه‌گذاری کنم تا یک پرتفوی متعادل داشته باشم؟ چه مقدار از سرمایه‌ام را به هر بازار اختصاص بدم و استراتژی شما برای مدیریت این نوع سرمایه‌گذاری چیه؟",
    "من علاقه دارم به بازار کریپتو وارد بشم اما نگران نوسانات شدیدش هستم. چه نوع استراتژی و ارزهایی را برای کاهش ریسک پیشنهاد می‌کنید؟",
    "چه ارزهای دیجیتالی در حال حاضر پتانسیل رشد خوبی دارند و می‌تونند انتخاب مناسبی برای سرمایه‌گذاری در سال جاری باشند؟ لطفاً دلایل اصلی این انتخاب‌ها رو هم توضیح بدید.",
    "به دنبال یک گزینه کم‌ریسک برای سرمایه‌گذاری هستم که بتونم در درازمدت یک درآمد پایدار داشته باشم. چه پیشنهادهایی دارید؟"
  ];

  constructor(private readonly productService: ProductService) {
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

  async onModuleInit() {
    const me = await this.bot.getMe();
    this.botUsername = me.username;
    this.logger.log(`Bot username: @${this.botUsername}`);

    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;

      if (msg.text === '/help') {
        const inlineKeyboard = this.prompts.map((prompt, index) => [{
          text: prompt.length > 150 
            ? `${prompt.slice(0, 147)}...` // Show in two lines if the text is long
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

      if (msg.text) {
        this.logger.log('Received text message:', msg.text);
        let responseText = await this.getChatGptResponse(msg.text);

        this.bot.sendMessage(chatId, responseText).catch((err) => {
          this.logger.error('Failed to send message', err);
        });
      }
    });

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
