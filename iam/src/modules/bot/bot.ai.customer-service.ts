import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';

import { IamService } from '../iam/services/iam.service';
import { DataService } from '../data/service/data.service';
import { SupportChatLogDto } from '../data/database/dto/support-chat-log.dto';
import { Types } from 'mongoose';
import OpenAI from 'openai';
import { KnowledgeItemService } from '../data/service/knowledge-item.service';

const adminTelegramIds = process.env.TELEGRAM_ADMIN_IDS?.split(',') || [];

@Injectable()
export class CustomerSupportBot implements OnModuleInit {
  private bot: TelegramBot;
  private readonly logger = new Logger(CustomerSupportBot.name);
  private readonly botToken = process.env.TELEGRAM_SUPPORT_BOT_TOKEN;
  private readonly openai = new OpenAI({ apiKey: process.env.CHATGPT_API_KEY_CRM });

  constructor(
    private readonly iamService: IamService,
    private readonly dataService: DataService,
    private readonly knowledgeService: KnowledgeItemService,
  ) {
    const TelegramBotConstructor = (TelegramBot as any).default || TelegramBot;
this.bot = new TelegramBotConstructor(this.botToken, { polling: true });

  }

  async onModuleInit() {
    const me = await this.bot.getMe();
    console.log(`Customer Support Bot started: @${me.username}`);

    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const telegramID = msg.from?.id?.toString();
      const telegramUserName = msg.from?.username || 'Unknown';
      const telegramFirstName = msg.from?.first_name || '';
      const telegramLastName = msg.from?.last_name || '';
      const telegramLanCode = msg.from?.language_code || 'en';
      const contactMobile = msg.contact?.phone_number || '';

      if (!telegramID) return;

      // ✅ Handle Admin Commands for Prompts
      if (adminTelegramIds.includes(telegramID) && msg.text?.startsWith('/')) {
        const [cmd, ...args] = msg.text.split(' ');
        const full = msg.text.replace(cmd, '').trim();

        try {
          if (cmd === '/addprompt') {
            const [q, a] = full.split('=>').map(s => s.trim());
            await this.knowledgeService.createPrompt({ question: q, answer: a });
            await this.bot.sendMessage(chatId, `✅ Prompt added.`);
            return;
          }
          if (cmd === '/updateprompt') {
            const [q, a] = full.split('=>').map(s => s.trim());
            await this.knowledgeService.updatePromptByQuestion(q, a);
            await this.bot.sendMessage(chatId, `🔄 Prompt updated.`);
            return;
          }
          if (cmd === '/deleteprompt') {
            await this.knowledgeService.deletePromptByQuestion(full);
            await this.bot.sendMessage(chatId, `🗑️ Prompt deleted.`);
            return;
          }
          if (cmd === '/listprompts') {
            const prompts = await this.knowledgeService.getPromptList(10);
            const text = prompts
              .map((p, i) => `${i + 1}. ${p.question}\n📎 ${p.answer}`)
              .join('\n\n');
            await this.bot.sendMessage(chatId, `📚 Prompts:\n${text}`);
            return;
          }

        } catch (err) {
          this.logger.error('❌ Admin prompt command failed', err);
          await this.bot.sendMessage(chatId, `❌ Error: ${err.message}`);
          return;
        }
      }

      const userEntity = await this.iamService.findUserByTelegramID(telegramID);
      const userMobile = userEntity?.mobile || contactMobile;

      if (!userMobile) {
        await this.bot.sendMessage(chatId, 'برای استفاده از پشتیبانی لطفاً شماره موبایل خود را به اشتراک بگذارید.', {
          reply_markup: {
            keyboard: [
              [
                {
                  text: '📞 اشتراک شماره موبایل',
                  request_contact: true,
                },
              ],
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });
        return;
      }

      const userInsertDto = {
        telegramID,
        mobile: userMobile,
        chatId: chatId.toString(),
        telegramUserName,
        telegramFirstName,
        telegramLastName,
        telegramLanCode,
        clientSecret: process.env.NEXT_PUBLIC_APP_SECRET,
        alias: '',
      };

      try {
        const { userId } = await this.iamService.registerOrLogin(userInsertDto);

        if (msg.contact || msg.text === '/start') {
          await this.bot.sendMessage(chatId, `سلام ${telegramFirstName} عزیز، به پشتیبانی خوش آمدید. سوال خود را بپرسید.`);
          return;
        }

        if (msg.text) {
          const timestamp = Math.floor(Date.now() / 1000);

          const messages = [
            {
              role: 'system' as const,
              content: `You are a helpful support assistant for a trading platform offering AI bots and signal services. Answer in Persian when appropriate. Be concise and helpful.`,
            },
            {
              role: 'user' as const,
              content: msg.text,
            },
          ];

          const chatCompletion = await this.openai.chat.completions.create({
            model: 'gpt-4o',
            messages,
          });

          const aiReply = chatCompletion.choices[0].message.content?.trim() || 'پاسخی یافت نشد.';

          await this.bot.sendMessage(chatId, aiReply);

          const chatLog: SupportChatLogDto = {
            userId,
            telegramId: telegramID,
            chatId: chatId.toString(),
            query: msg.text,
            response: aiReply,
            save_at: timestamp,
            source: 'telegram'
          };

          await this.dataService.logSupportChat(chatLog);
        }
      } catch (err) {
        this.logger.error('❌ Failed to register/login user', err);
      }
    });
  }
}
