import { Injectable, OnModuleInit } from '@nestjs/common';
//import  TelegramBot  from 'node-telegram-bot-api';
import * as TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class BotService implements OnModuleInit {
  private readonly bot: TelegramBot;

  constructor() {
    this.bot = new TelegramBot('7361197724:AAFeAvuqnid2Fdg3xtZOFUNs0P5yjXpOqOs', { polling: true });
  }

  onModuleInit() {
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(chatId, 'در صورتی که از بازار کریپتو جامانده اید و احساس می کنید برای ورود به این بازار دیر کرده اید، ما یه شانس مجدد در اختیار شما قرار خواهیم داد، با در یافت توکن ما شانس جدیدی برای سرمایه گزاری در اختیار دارید', {
        reply_markup: {
          inline_keyboard: [[{ text: 'شروع بازی', web_app: { url: 'https://t.farschain.com' } }]],
        },
      });
    });
  }
}
