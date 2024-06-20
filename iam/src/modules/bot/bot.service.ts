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
      this.bot.sendMessage(chatId, 'Open Mini App', {
        reply_markup: {
          inline_keyboard: [[{ text: 'Open Mini App', web_app: { url: 'https://t.farschain.com' } }]],
        },
      });
    });
  }
}
