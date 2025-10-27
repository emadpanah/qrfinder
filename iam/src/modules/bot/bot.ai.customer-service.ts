// Ganjool Support Bot - Clean /start handling + Minimal Menu + Videos (FINAL)
// Date: 2025-10-21

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { IamService } from '../iam/services/iam.service';
import { DataService } from '../data/service/data.service';
import { SupportChatLogDto } from '../data/database/dto/support-chat-log.dto';
import OpenAI from 'openai';
import { KnowledgeItemService } from '../data/service/knowledge-item.service';
import * as fs from 'fs';
import * as path from 'path';

const adminTelegramIds = process.env.TELEGRAM_ADMIN_IDS?.split(',') || [];

// In-memory states
const unlockedUsers = new Set<string>();
const contactRequested = new Set<string>();

// Texts
const TXT = {
  welcomeAfterContact: `سلام رفیق 👋
 یه جایی برات ساختم که بتونی از بهترین سیگنال‌ها و تحلیل‌های بازار استفاده کنی 👇

🚀  این مسیر مخصوص توئه که قدم‌به‌قدم مهارت و درک بازار رو بالا ببری و بتونی تو این بازار سود کنی.
✨ فقط کافیه بخوای شروع کنی و اشتراک خودتو فعال کنی 👇`,
  askContact: 'برای استفاده از پشتیبانی لطفاً شماره موبایل خود را به اشتراک بگذارید.',
  shareContactBtn: '📞 اشتراک شماره موبایل',
  supportExternal: '📩 برای پشتیبانی، لطفاً به حساب @Trade_Ai_bot_support پیام دهید.',
  menuPrompt: 'لطفاً یک گزینه از منو را انتخاب کنید:',
  mainMenu: {
    getSub: '🎫 دریافت اشتراک',
    support: '🆘 پشتیبانی',
  },
  chooserTitle: '🔹 لطفاً اشتراک مورد نظر خود را انتخاب کنید:',
  planReferral: '🎁 اشتراک ریفرال (رایگان)',
  planMonthly: '💳 اشتراک ماهیانه (پولی)',
  backToMenu: '🔙 بازگشت (منو)',
  backToPlans: '🔙 بازگشت (پلن‌ها)',
  backToExchanges: '🔙 بازگشت (صرافی‌ها)',
  backToProducts: '🔙 بازگشت (محصولات)',
  exchangePickerTitle: '🧩 لطفاً صرافی/بروکر مورد نظر خود را برای ثبت‌نام رایگان انتخاب کنید:',

  // Monthly chooser + payment texts
  monthlyChooserTitle: 'برای دریافت اشتراک می‌توانید یکی از دو محصول زیر را به صورت تتری خرید نمایید:',
  monthlySpaceXBtn: '🤖 ربات اسپیس ایکس',
  monthlyNabzarBtn: '🧠 دستیار هوش مصنوعی نبضار',
paySpaceXMsg:
  'برای خرید <b>ربات اسپیس ایکس</b> مبلغ <b>۱۰۰ دلار تتر (TRC20)</b> را به آدرس زیر ارسال کنید و <b>هش واریز</b> را به آی‌دی زیر ارسال نمایید:\n\n<code>TQ488ARGLPvVy4vw2EpGRkmcKfA6iBoWcv</code>\n\nآی‌دی پشتیبانی: @Trade_Ai_bot_support',

payNabzarMsg:
  'برای خرید <b>دستیار هوش مصنوعی نبضار</b> مبلغ <b>۴۰ دلار تتر (TRC20)</b> را به آدرس زیر ارسال کنید و <b>هش واریز</b> را به آی‌دی زیر ارسال نمایید:\n\n<code>TQ488ARGLPvVy4vw2EpGRkmcKfA6iBoWcv</code>\n\nآی‌دی پشتیبانی: @Trade_Ai_bot_support',
};

// Callback IDs
const CB = {
  openPlans: 'plans_open',
  openExchanges: 'referral_exchanges',
  lbank: 'ex_lbank',
  wallex: 'ex_wallex', // kept id; routes to OneRoyal
  amarket: 'ex_amarket',
  backMenu: 'back_menu',
  backPlans: 'back_plans',
  backExchanges: 'back_exchanges',
  supportChat: 'btn_support_chat',

  // Monthly flows
  openMonthly: 'plans_monthly',
  monthlySpaceX: 'plans_monthly_spacex',
  monthlyNabzar: 'plans_monthly_nabzar',
};

@Injectable()
export class CustomerSupportBot implements OnModuleInit {
  private bot: TelegramBot;
  private readonly logger = new Logger(CustomerSupportBot.name);

  // Test token first (as you specified)
  private readonly botToken =
    process.env.TELEGRAM_SUPPORTTEST_BOT_TOKEN
    //process.env.TELEGRAM_SUPPORT_BOT_TOKEN
    ;

  private readonly openai = new OpenAI({
    apiKey: process.env.CHATGPT_API_KEY_CRM,
  });

  constructor(
    private readonly iamService: IamService,
    private readonly dataService: DataService,
    private readonly knowledgeService: KnowledgeItemService,
  ) {
    process.env.NTBA_FIX_350 = '1';
    const TelegramBotConstructor = (TelegramBot as any).default || TelegramBot;
    this.bot = new TelegramBotConstructor(this.botToken, { polling: true });
  }

  async onModuleInit() {
    const me = await this.bot.getMe();
    console.log(`Ganjool Bot started: @${me.username}`);

    // ===== /start =====
    this.bot.onText(/\/start(?:\s+.*)?/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramID = msg.from?.id?.toString();
      if (!telegramID) return;

      const userEntity = await this.iamService.findUserByTelegramID(telegramID);

      if (!userEntity || !userEntity.mobile) {
        if (!contactRequested.has(telegramID)) {
          const sent = await this.bot.sendMessage(chatId, TXT.askContact, {
            reply_markup: {
              keyboard: [[{ text: TXT.shareContactBtn, request_contact: true }]],
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          });
          try { await this.bot.pinChatMessage(chatId, sent.message_id); } catch {}
          contactRequested.add(telegramID);
        }
        return;
      }

      // User already registered → show welcome + menu
      await this.sendWelcomeAndMenu(chatId);
    });

    // ===== Callback buttons =====
    this.bot.on('callback_query', async (query) => {
      const chatId = query.message?.chat.id;
      const telegramID = query.from?.id?.toString();
      if (!chatId || !telegramID) return;

      try {
        switch (query.data) {
          case CB.openPlans:
            await this.sendPlans(chatId);
            break;
          case CB.openExchanges:
            await this.sendExchangePicker(chatId);
            break;
          case CB.lbank:
            await this.sendLBank(chatId);
            break;
          case CB.wallex:
            await this.sendOneRoyal(chatId);
            break;
          case CB.amarket:
            await this.sendAMarket(chatId);
            break;
          case CB.supportChat:
            await this.bot.sendMessage(chatId, TXT.supportExternal);
            break;

          // Monthly chooser + payments
          case CB.openMonthly:
            await this.sendMonthlyChooser(chatId);
            break;
          case CB.monthlySpaceX:
            await this.sendMonthlySpaceX(chatId);
            break;
          case CB.monthlyNabzar:
            await this.sendMonthlyNabzar(chatId);
            break;

          case CB.backMenu:
            await this.sendWelcomeAndMenu(chatId);
            break;
          case CB.backPlans:
            await this.sendPlans(chatId);
            break;
          case CB.backExchanges:
            await this.sendExchangePicker(chatId);
            break;
        }
      } catch (err) {
        this.logger.error('callback error', err);
      } finally {
        try { await this.bot.answerCallbackQuery(query.id); } catch {}
      }
    });

    // ===== Messages & Contact =====
    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const telegramID = msg.from?.id?.toString();
      if (!telegramID) return;

      const text = (msg.text || '').trim();

      // Ignore /start here to avoid double handling
      if (text.startsWith('/start')) return;

      const telegramUserName = msg.from?.username || 'Unknown';
      const telegramFirstName = msg.from?.first_name || '';
      const telegramLastName = msg.from?.last_name || '';
      const telegramLanCode = msg.from?.language_code || 'en';
      const contactMobile = msg.contact?.phone_number || '';

      // --- Admin prompt commands ---
      if (adminTelegramIds.includes(telegramID) && text.startsWith('/')) {
        const [cmd, ...args] = text.split(' ');
        const full = text.replace(cmd, '').trim();
        try {
          if (cmd === '/addprompt') {
            const [q, a] = full.split('=>').map((s) => s.trim());
            await this.knowledgeService.createPrompt({ question: q, answer: a });
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
            const t = prompts.map((p, i) => `${i + 1}. ${p.question}\n📎 ${p.answer}`).join('\n\n');
            await this.bot.sendMessage(chatId, `📚 Prompts:\n${t}`);
            return;
          }
        } catch (err) {
          this.logger.error('❌ Admin prompt command failed', err);
          await this.bot.sendMessage(chatId, `❌ Error: ${err.message}`);
          return;
        }
      }

      // --- Register/Login ---
      const userEntity = await this.iamService.findUserByTelegramID(telegramID);
      const userMobile = userEntity?.mobile || contactMobile;

      if (!userMobile) {
        if (!contactRequested.has(telegramID)) {
          const sent = await this.bot.sendMessage(chatId, TXT.askContact, {
            reply_markup: {
              keyboard: [[{ text: TXT.shareContactBtn, request_contact: true }]],
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          });
          try { await this.bot.pinChatMessage(chatId, sent.message_id); } catch {}
          contactRequested.add(telegramID);
        } else {
          await this.bot.sendMessage(chatId, 'لطفاً شماره موبایل خود را به اشتراک بگذارید تا ادامه دهیم.');
        }
        return;
      }

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

        // If contact just shared → welcome + menu
        if (msg.contact) {
          await this.sendWelcomeAndMenu(chatId);
          return;
        }

        // Main menu textual buttons
        if (text) {
          if (text === TXT.mainMenu.getSub) {
            await this.sendPlans(chatId);
            return;
          }
          if (text === TXT.mainMenu.support) {
            await this.bot.sendMessage(chatId, TXT.supportExternal);
            return;
          }

          // If AI is locked, keep them in menu
          if (!unlockedUsers.has(telegramID)) {
            await this.sendWelcomeAndMenu(chatId);
            return;
          }
        }

        // ===== AI chat (if unlocked) =====
        if (text && unlockedUsers.has(telegramID)) {
          const timestamp = Math.floor(Date.now() / 1000);
          const messages = [
            {
              role: 'system' as const,
              content:
                '🧠 شما دستیار هوشمند شرکت Trade-AI هستید که ربات‌های ترید و سیگنال هوشمند ارائه می‌دهد. ابتدا خود را معرفی کن و محصولات را معرفی کن. در صورت پرسش درباره محصولات، مقایسه کن و لینک ارائه بده. پاسخ‌ها باید فارسی، صمیمی و دقیق باشند.',
            },
            { role: 'user' as const, content: text },
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
            query: text,
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

  // ---------- Helpers ----------

  private async sendWelcomeAndMenu(chatId: number) {
    await this.bot.sendMessage(chatId, TXT.welcomeAfterContact);
    await this.bot.sendMessage(chatId, TXT.menuPrompt, {
      reply_markup: {
        keyboard: [[{ text: TXT.mainMenu.getSub }, { text: TXT.mainMenu.support }]],
        resize_keyboard: true,
        one_time_keyboard: false,
      },
    });
  }

  private async sendPlans(chatId: number) {
    await this.bot.sendMessage(chatId, TXT.chooserTitle, {
      reply_markup: {
        inline_keyboard: [
          [{ text: TXT.planReferral, callback_data: CB.openExchanges }],
          [{ text: TXT.planMonthly, callback_data: CB.openMonthly }], // monthly chooser (no URL)
          [{ text: TXT.backToMenu, callback_data: CB.backMenu }],
        ],
      },
    });
  }

  // Monthly chooser + payments
  private async sendMonthlyChooser(chatId: number) {
    await this.bot.sendMessage(chatId, TXT.monthlyChooserTitle, {
      reply_markup: {
        inline_keyboard: [
          [{ text: TXT.monthlySpaceXBtn, callback_data: CB.monthlySpaceX }],
          [{ text: TXT.monthlyNabzarBtn, callback_data: CB.monthlyNabzar }],
          [{ text: TXT.backToPlans, callback_data: CB.backPlans }],
        ],
      },
      parse_mode: 'Markdown',
    });
  }

private async sendMonthlySpaceX(chatId: number) {
  await this.bot.sendMessage(chatId, TXT.paySpaceXMsg, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: TXT.backToProducts || '🔙 بازگشت (محصولات)', callback_data: CB.openMonthly }],
      ],
    },
  });
}

private async sendMonthlyNabzar(chatId: number) {
  await this.bot.sendMessage(chatId, TXT.payNabzarMsg, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: TXT.backToProducts || '🔙 بازگشت (محصولات)', callback_data: CB.openMonthly }],
      ],
    },
  });
}



  private async sendExchangePicker(chatId: number) {
    await this.bot.sendMessage(chatId, TXT.exchangePickerTitle, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '(LBank) ال‌بنک', callback_data: CB.lbank }],
          [{ text: '(OneRoyal) وان رویال', callback_data: CB.wallex }],
          [{ text: '(AMarket) آمارکتس', callback_data: CB.amarket }],
          [{ text: TXT.backToPlans, callback_data: CB.backPlans }],
        ],
      },
    });
  }

  // Try video first, fallback to image
  private async sendMedia(
    chatId: number,
    preferredVideoBasename: string,
    fallbackImagePath: string,
    caption?: string,
  ) {
    const possible = (base: string) => [
      path.join('./assets/videos', `${base}.mp4`),
      path.join('./assets/videos', `${base}.MP4`),
      path.join('./assets/videos', `${base}.mov`),
      path.join('./assets/videos', `${base}.MOV`),
    ];
    const vid = possible(preferredVideoBasename).find((p) => fs.existsSync(p));
    if (vid) {
      try {
        await this.bot.sendVideo(chatId, fs.createReadStream(vid), { caption: caption || '' });
        return;
      } catch (e) {
        this.logger.warn(`Video send failed for ${vid}; fallback to photo.`);
      }
    }
    if (fs.existsSync(fallbackImagePath)) {
      await this.bot.sendPhoto(chatId, fallbackImagePath, { caption: caption || '' });
    } else {
      await this.bot.sendMessage(chatId, '⚠️ فایل رسانه‌ای یافت نشد.');
    }
  }

  // Exchanges
  private async sendLBank(chatId: number) {
    await this.sendMedia(
      chatId,
      'lbank',
      './assets/img/lbank.jpeg',
      'بعد از ثبت‌نام در صرافی کریپتو LBank، شماره مشتری (UID) خود رو برای ما ارسال کنید 🟢',
    );

    await this.bot.sendMessage(chatId, '👇 مراحل پیشنهادی:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔗 لینک ثبت‌نام', url: 'https://www.lbank.com/fa/signup?icode=565WO' }],
          [{ text: '📩 ارسال UID', callback_data: CB.supportChat }],
          [{ text: '🎥 آموزش ثبت‌نام (YouTube)', url: 'https://www.youtube.com/watch?v=eiX8KdOEbjc&pp=2AaSAw%3D%3D' }],
          [{ text: TXT.backToExchanges, callback_data: CB.backExchanges }],
        ],
      },
      parse_mode: 'Markdown',
    });
  }

  private async sendOneRoyal(chatId: number) {
    await this.sendMedia(
      chatId,
      'oneroyal',
      './assets/img/oneroyal.jpeg',
      'بعد از ثبت‌نام در بروکر OneRoyal، شماره مشتری (UID) خود رو برای ما ارسال کنید 🟢',
    );
    await this.bot.sendMessage(chatId, '👇 مراحل پیشنهادی:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔗 لینک ثبت‌نام', url: 'https://vc.cabinet.oneroyal.com/links/go/10891' }],
          [{ text: '📩 ارسال UID', callback_data: CB.supportChat }],
          [{ text: '🎥 آموزش ثبت‌نام (YouTube)', url: 'https://youtube.com/shorts/WK1pix-CVNo?feature=share' }],
          [{ text: TXT.backToExchanges, callback_data: CB.backExchanges }],
        ],
      },
      parse_mode: 'Markdown',
    });
  }

  private async sendAMarket(chatId: number) {
    await this.sendMedia(
      chatId,
      'amarket',
      './assets/img/amarket.jpeg',
      'بعد از ثبت‌نام در صرافی کریپتو AMarket، شماره مشتری (UID) خود رو برای ما ارسال کنید 🟢',
    );
    await this.bot.sendMessage(chatId, '👇 مراحل پیشنهادی:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔗 لینک ثبت‌نام', url: 'https://fa.amarketsworld.com/open-an-account-standard-fa/?g=TRADEAI&utm_source=TRAI-Inf-PA&utm_medium=SM-TRAI&utm_campaign=TR-H-Mar' }],
          [{ text: '📩 ارسال UID', callback_data: CB.supportChat }],
          [{ text: '🎥 آموزش ثبت‌نام (YouTube)', url: 'https://www.youtube.com/watch?v=q22kqp4XEjg' }],
          [{ text: TXT.backToExchanges, callback_data: CB.backExchanges }],
        ],
      },
      parse_mode: 'Markdown',
    });
  }

  // Greeting video (with SpaceX/Nabzar buttons, no site URL)
  async sendGreetingVideo(
    chatId: number,
    telegramID: string,
    mobile: string,
    firstName: string,
  ) {
    const localVideoPath = './assets/videos/greeting-lbank.MP4';
    if (!fs.existsSync(localVideoPath)) {
      await this.bot.sendMessage(chatId, `❌ فایل ویدیویی یافت نشد: ${localVideoPath}.`);
      return;
    }
    try {
      await this.bot.sendVideo(
        chatId,
        fs.createReadStream(localVideoPath),
        {
          caption: `🎬 خوش‌آمدید ${firstName}!`,
          reply_markup: {
            inline_keyboard: [
              [{ text: '🎫 ثبت نام رایگان', callback_data: CB.openExchanges }],
              [{ text: '🤖 ربات اسپیس ایکس', callback_data: CB.monthlySpaceX }],
              [{ text: '🧠 دستیار هوش مصنوعی نبضار', callback_data: CB.monthlyNabzar }],
              [{ text: '🆘 چت با پشتیبانی', callback_data: CB.supportChat }],
            ],
          },
          contentType: 'video/mp4',
        },
      );
    } catch (err: any) {
      this.logger.error('video send error', err);
      await this.bot.sendMessage(chatId, `❌ خطا در ارسال ویدیو: ${err.message}`);
    }
  }
}
