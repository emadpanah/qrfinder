import { Injectable, OnModuleInit } from '@nestjs/common';
//import  TelegramBot  from 'node-telegram-bot-api';
import * as TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class BotService implements OnModuleInit {
  private readonly bot: TelegramBot;

  constructor() {
    this.bot = new TelegramBot('6879591689:AAErBS8Z3JEsO7kZZ9xBrpv7E1Tutu1v2YM', { polling: true });
  }

  onModuleInit() {
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

}
