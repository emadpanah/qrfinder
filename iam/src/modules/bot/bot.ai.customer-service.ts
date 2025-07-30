// Ganjool Support Bot - UI Enhanced Version
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { IamService } from '../iam/services/iam.service';
import { DataService } from '../data/service/data.service';
import { SupportChatLogDto } from '../data/database/dto/support-chat-log.dto';
import { Types } from 'mongoose';
import OpenAI from 'openai';
import { KnowledgeItemService } from '../data/service/knowledge-item.service';

const adminTelegramIds = process.env.TELEGRAM_ADMIN_IDS?.split(',') || [];

// 🔐 In-memory lock status per user
const unlockedUsers = new Set<string>();
const contactRequested = new Set<string>(); // Track users who have been asked for contact

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
    console.log(`Ganjool Bot started: @${me.username}`);

    // 📌 Handle /start command
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramID = msg.from?.id?.toString();
      if (!telegramID) return;

      const userEntity = await this.iamService.findUserByTelegramID(telegramID);
      if (!userEntity || !userEntity.mobile) {
        if (!contactRequested.has(telegramID)) {
          const sent = await this.bot.sendMessage(chatId, 'برای استفاده از پشتیبانی لطفاً شماره موبایل خود را به اشتراک بگذارید.', {
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
          await this.bot.pinChatMessage(chatId, sent.message_id);
          contactRequested.add(telegramID);
        }
      } else {
        // User is registered and has mobile, send greeting video and buttons
        await this.sendGreetingVideo(chatId, telegramID, userEntity.mobile, msg.from?.first_name || 'دوست عزیز');
      }
    });

    // 🔘 Handle buttons
    this.bot.on('callback_query', async (query) => {
      const chatId = query.message?.chat.id;
      const telegramID = query.from?.id?.toString();

      if (!chatId || !telegramID) return;

      switch (query.data) {
        case 'btn_info':
          try {
            await this.bot.sendVideo(chatId, 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', {
              caption: '📘 ربات‌های ما ابزارهایی هستند برای ترید هوشمند در کریپتو، فارکس و طلا.',
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: 'بازگشت به منو', callback_data: 'btn_menu' },
                    { text: 'شروع چت', callback_data: 'btn_unlock' },
                  ],
                ],
              },
            });
          } catch (err) {
            this.logger.error('❌ Failed to send info video', err);
            await this.bot.sendMessage(chatId, '❌ خطا در ارسال ویدیو. لطفاً بعداً دوباره امتحان کنید.');
          }
          break;
        case 'btn_prices':
          try {
            await this.bot.sendVideo(chatId, 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', {
              caption: `💰 لیست قیمت‌ها در لینک زیر:\nhttps://trade-ai.link/prices`,
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: 'بازگشت به منو', callback_data: 'btn_menu' },
                    { text: 'شروع چت', callback_data: 'btn_unlock' },
                  ],
                ],
              },
            });
          } catch (err) {
            this.logger.error('❌ Failed to send prices video', err);
            await this.bot.sendMessage(chatId, '❌ خطا در ارسال ویدیو. لطفاً بعداً دوباره امتحان کنید.');
          }
          break;
        case 'btn_compare':
          try {
            await this.bot.sendVideo(chatId, 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', {
              caption: `📊 مقایسه کامل ربات‌ها:\nhttps://trade-ai.link/compare`,
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: 'بازگشت به منو', callback_data: 'btn_menu' },
                    { text: 'شروع چت', callback_data: 'btn_unlock' },
                  ],
                ],
              },
            });
          } catch (err) {
            this.logger.error('❌ Failed to send compare video', err);
            await this.bot.sendMessage(chatId, '❌ خطا در ارسال ویدیو. لطفاً بعداً دوباره امتحان کنید.');
          }
          break;
        case 'btn_connect':
          try {
            await this.bot.sendVideo(chatId, 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', {
              caption: `🔌 آموزش اتصال ربات به صرافی در لینک زیر:\nhttps://trade-ai.link/connect`,
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: 'بازگشت به منو', callback_data: 'btn_menu' },
                    { text: 'شروع چت', callback_data: 'btn_unlock' },
                  ],
                ],
              },
            });
          } catch (err) {
            this.logger.error('❌ Failed to send connect video', err);
            await this.bot.sendMessage(chatId, '❌ خطا در ارسال ویدیو. لطفاً بعداً دوباره امتحان کنید.');
          }
          break;
        case 'btn_unlock':
          unlockedUsers.add(telegramID);
          await this.bot.sendMessage(chatId, '🔓 اکنون می‌توانید سوالات خود را از گنجول بپرسید! ✨');
          break;
        case 'btn_menu':
          const firstName = query.from?.first_name || 'دوست عزیز';
          try {
            await this.bot.sendVideo(chatId, 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', {
              caption: `🎬 خوش‌آمدید ${firstName}! من ربات پشتیبانی Ganjool هستم. برای شروع از دکمه‌های زیر استفاده کنید:`,
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: '🧠 درباره ربات‌ها', callback_data: 'btn_info' },
                    { text: '💵 قیمت‌ها', callback_data: 'btn_prices' },
                  ],
                  [{ text: '📊 مقایسه محصولات', callback_data: 'btn_compare' }],
                  [{ text: '🔧 نحوه اتصال', callback_data: 'btn_connect' }],
                  [{ text: 'شروع چت', callback_data: 'btn_unlock' }],
                ],
              },
            });
          } catch (err) {
            this.logger.error('❌ Failed to send menu video', err);
            await this.bot.sendMessage(chatId, '❌ خطا در ارسال ویدیو. لطفاً بعداً دوباره امتحان کنید.');
          }
          break;
      }

      await this.bot.answerCallbackQuery(query.id);
    });

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
        if (!contactRequested.has(telegramID)) {
          const sent = await this.bot.sendMessage(chatId, 'برای استفاده از پشتیبانی لطفاً شماره موبایل خود را به اشتراک بگذارید.', {
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
          await this.bot.pinChatMessage(chatId, sent.message_id);
          contactRequested.add(telegramID);
        } else {
          await this.bot.sendMessage(chatId, 'لطفاً شماره موبایل خود را به اشتراک بگذارید تا ادامه دهیم.');
        }
        return;
      }

      // Clear the contact request flag once mobile is available
      contactRequested.delete(telegramID);

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

        if (msg.contact) {
          // 📹 Send greeting video and buttons after contact is shared
          await this.sendGreetingVideo(chatId, telegramID, userMobile, telegramFirstName);
          return;
        }

        if (!unlockedUsers.has(telegramID) && msg.text) {
          await this.bot.sendMessage(chatId, '⛔ لطفاً ابتدا دکمه "شروع چت" را فشار دهید تا چت فعال شود.');
          return;
        }

        if (msg.text && unlockedUsers.has(telegramID)) {
          const timestamp = Math.floor(Date.now() / 1000);

          const messages = [
            {
              role: 'system' as const,
              content: `🧠 شما دستیار هوشمند شرکت Trade-AI هستید که ربات‌های ترید و سیگنال هوشمند ارائه می‌دهد. ابتدا خود را معرفی کن و محصولات را معرفی کن. در صورت پرسش درباره محصولات، مقایسه کن و لینک ارائه بده. پاسخ‌ها باید فارسی، صمیمی و دقیق باشند.`,
            },
            {
              role: 'user' as const,
              content: msg.text,
            },
          ];

          const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o',
            messages,
          });

          const aiReply = completion.choices[0].message.content?.trim() || '🤖 پاسخی پیدا نشد.';
          await this.bot.sendMessage(chatId, aiReply);

          const chatLog: SupportChatLogDto = {
            userId,
            telegramId: telegramID,
            chatId: chatId.toString(),
            query: msg.text,
            response: aiReply,
            save_at: timestamp,
            source: 'telegram',
          };

          await this.dataService.logSupportChat(chatLog);
        }
      } catch (err) {
        this.logger.error('❌ Failed to register/login user', err);
        await this.bot.sendMessage(chatId, '❌ خطا در پردازش درخواست. لطفاً دوباره تلاش کنید.');
      }
    });

    
  }

  // Helper method to send greeting video and buttons
    async sendGreetingVideo(chatId: number, telegramID: string, mobile: string, firstName: string) {
      try {
        await this.bot.sendVideo(chatId, 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', {
          caption: `🎬 خوش‌آمدید ${firstName}! من ربات پشتیبانی Ganjool هستم. برای شروع از دکمه‌های زیر استفاده کنید:`,
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🧠 درباره ربات‌ها', callback_data: 'btn_info' },
                { text: '💵 قیمت‌ها', callback_data: 'btn_prices' },
              ],
              [{ text: '📊 مقایسه محصولات', callback_data: 'btn_compare' }],
              [{ text: '🔧 نحوه اتصال', callback_data: 'btn_connect' }],
              [{ text: 'شروع چت', callback_data: 'btn_unlock' }],
            ],
          },
        });
      } catch (err) {
        this.logger.error('❌ Failed to send greeting video', err);
        await this.bot.sendMessage(chatId, '❌ خطا در ارسال ویدیو خوش‌آمدگویی. لطفاً بعداً دوباره امتحان کنید.');
      }
    }
}