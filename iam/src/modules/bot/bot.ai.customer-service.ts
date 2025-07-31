// Ganjool Support Bot - UI Enhanced Version
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { IamService } from '../iam/services/iam.service';
import { DataService } from '../data/service/data.service';
import { SupportChatLogDto } from '../data/database/dto/support-chat-log.dto';
import { Types } from 'mongoose';
import OpenAI from 'openai';
import { KnowledgeItemService } from '../data/service/knowledge-item.service';
import * as fs from 'fs'; // Import fs for file existence check

const adminTelegramIds = process.env.TELEGRAM_ADMIN_IDS?.split(',') || [];

// 🔐 In-memory lock status per user
const unlockedUsers = new Set<string>();
const contactRequested = new Set<string>(); // Track users who have been asked for contact

@Injectable()
export class CustomerSupportBot implements OnModuleInit {
  private bot: TelegramBot;
  private readonly logger = new Logger(CustomerSupportBot.name);
  private readonly botToken = process.env.TELEGRAM_SUPPORT_BOT_TOKEN;
  private readonly openai = new OpenAI({
    apiKey: process.env.CHATGPT_API_KEY_CRM,
  });

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
          const sent = await this.bot.sendMessage(
            chatId,
            'برای استفاده از پشتیبانی لطفاً شماره موبایل خود را به اشتراک بگذارید.',
            {
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
            },
          );
          await this.bot.pinChatMessage(chatId, sent.message_id);
          contactRequested.add(telegramID);
        }
      } else {
        // User is registered and has mobile, send greeting video and buttons
        await this.sendGreetingVideo(
          chatId,
          telegramID,
          userEntity.mobile,
          msg.from?.first_name || 'دوست عزیز',
        );
      }
    });

    // 🔘 Handle buttons
    this.bot.on('callback_query', async (query) => {
      const chatId = query.message?.chat.id;
      const telegramID = query.from?.id?.toString();

      if (!chatId || !telegramID) return;
      switch (query.data) {
        case 'btn_free_signup':
          await this.bot.sendMessage(
            chatId,
            'لطفاً صرافی مورد نظر خود را برای ثبت‌نام رایگان انتخاب کنید:',
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: 'LBank', callback_data: 'btn_lbank' }],
                  [{ text: 'Wallex', callback_data: 'btn_wallex' }],
                  [{ text: 'AMarket', callback_data: 'btn_amarket' }],
                ],
              },
            },
          );
          break;
        case 'btn_lbank':
          await this.bot.sendMessage(
            chatId,
            'لینک‌های LBank:\n- YouTube: https://www.youtube.com/watch?v=example_lbank\n- Referral: https://lbank.com/referral\n- Support: https://lbank.com/support',
            {
              parse_mode: 'Markdown',
            },
          );
          break;
        case 'btn_wallex':
          await this.bot.sendMessage(
            chatId,
            'لینک‌های Wallex:\n- YouTube: https://www.youtube.com/watch?v=example_wallex\n- Referral: https://wallex.com/referral\n- Support: https://wallex.com/support',
            {
              parse_mode: 'Markdown',
            },
          );
          break;
        case 'btn_amarket':
          await this.bot.sendMessage(
            chatId,
            'لینک‌های AMarket:\n- YouTube: https://www.youtube.com/watch?v=example_amarket\n- Referral: https://amarket.com/referral\n- Support: https://amarket.com/support',
            {
              parse_mode: 'Markdown',
            },
          );
          break;
        case 'btn_direct_buy':
          await this.bot.sendMessage(
            chatId,
            'برای خرید مستقیم، لطفاً به سایت مراجعه کنید:',
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: 'خرید از Trade AI', url: 'https://trade-ai.bot' }],
                ],
              },
            },
          );
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
            const [q, a] = full.split('=>').map((s) => s.trim());
            await this.knowledgeService.createPrompt({
              question: q,
              answer: a,
            });
            await this.bot.sendMessage(chatId, `✅ Prompt added.`);
            return;
          }
          if (cmd === '/updateprompt') {
            const [q, a] = full.split('=>').map((s) => s.trim());
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
          const sent = await this.bot.sendMessage(
            chatId,
            'برای استفاده از پشتیبانی لطفاً شماره موبایل خود را به اشتراک بگذارید.',
            {
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
            },
          );
          await this.bot.pinChatMessage(chatId, sent.message_id);
          contactRequested.add(telegramID);
        } else {
          await this.bot.sendMessage(
            chatId,
            'لطفاً شماره موبایل خود را به اشتراک بگذارید تا ادامه دهیم.',
          );
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
          await this.sendGreetingVideo(
            chatId,
            telegramID,
            userMobile,
            telegramFirstName,
          );
          return;
        }

        // if (!unlockedUsers.has(telegramID) && msg.text) {
        //   await this.bot.sendMessage(
        //     chatId,
        //     '⛔ لطفاً ابتدا دکمه "شروع چت" را فشار دهید تا چت فعال شود.',
        //   );
        //   return;
        // }

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

          const aiReply =
            completion.choices[0].message.content?.trim() ||
            '🤖 پاسخی پیدا نشد.';
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
        await this.bot.sendMessage(
          chatId,
          '❌ خطا در پردازش درخواست. لطفاً دوباره تلاش کنید.',
        );
      }
    });
  }
  async sendGreetingVideo(
    chatId: number,
    telegramID: string,
    mobile: string,
    firstName: string,
  ) {
    const localVideoPath = './asset/videos/greeting-lbank.mp4'; // Path to local video file

    // Log: Starting video send process
    this.logger.log(
      `Attempting to send greeting video from: ${localVideoPath} for user ${telegramID}`,
    );

    // Send preliminary message to indicate processing
    await this.bot.sendMessage(
      chatId,
      '⏳ در حال آماده‌سازی ویدیو، لطفاً صبر کنید...',
    );

    // Debug: Check if file exists
    if (!fs.existsSync(localVideoPath)) {
      this.logger.error(`Video file not found at: ${localVideoPath}`);
      await this.bot.sendMessage(
        chatId,
        '❌ فایل ویدیویی یافت نشد. لطفاً مسیر فایل را بررسی کنید.',
      );
      return;
    }
    this.logger.log(`Video file found at: ${localVideoPath}`);

    // Debug: Check file stats
    const stats = fs.statSync(localVideoPath);
    this.logger.log(
      `File size: ${stats.size} bytes, isFile: ${stats.isFile()}`,
    );

    try {
      // Log: Starting video upload
      this.logger.log(`Starting upload of video to chatId: ${chatId}`);
      await this.bot.sendVideo(chatId, localVideoPath, {
        caption: `🎬 خوش‌آمدید ${firstName}! من ربات پشتیبانی Ganjool هستم.\n\n💣 ۵۰ دلار بده، تا ۱۰۰ میلیون ببر!\n🤖 ربات‌های ترید هوش مصنوعی رایگان Trade AI به افتخار ۵۰۰K شدن شبکه های اجتماعی با اسپانسرینگ LBank\n\n🔥 فقط یه ترید بزن و وارد تورنمنت ویژه شو!\n🎁 جایزه نقدی برای ۳۰ نفر اول\n💥 فرصت خیلی محدوده!\n\n📈 رده‌بندی زنده تو شبکه‌هامونه!`,
        reply_markup: {
          inline_keyboard: [
            [{ text: 'ثبت نام رایگان', callback_data: 'btn_free_signup' }],
            [{ text: 'خرید مستقیم از سایت', callback_data: 'btn_direct_buy' }],
          ],
        },
      });
      this.logger.log(`Video successfully sent to chatId: ${chatId}`);
    } catch (err) {
      this.logger.error('❌ Failed to send greeting video', err);
      if (err.response && err.response.body) {
        this.logger.error('Telegram API Error:', err.response.body);
      } else {
        this.logger.error('Unknown error during sendVideo:', err.message);
      }
      await this.bot.sendMessage(
        chatId,
        '❌ خطا در ارسال ویدیو خوش‌آمدگویی. لطفاً بعداً دوباره امتحان کنید.',
      );
    }
  }
}
