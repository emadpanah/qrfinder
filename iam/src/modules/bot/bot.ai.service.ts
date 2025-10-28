import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { OpenAI } from 'openai';
import { ProductService } from '../product/services/product.service';
import { DataRepository } from '../data/database/repositories/data.repository'; 
import { isEmpty } from 'validator';
import { DominanceDto } from '../data/database/dto/dominance.dto';
import { UserChatLogDto } from '../data/database/dto/userchatlog.dto';
import { IamService } from '../iam/services/iam.service';
import { Types } from 'mongoose';
import { BalanceService } from '../iam/services/iam-balance.service';
import { Balance } from '../iam/database/schemas/iam-balance.schema';
import { cleanNabzarSignalJsonSection, escapeMarkdown, extractSignalJsonEnvelope, formatNumber, mapSymbol, sanitizeString,  truncateText } from 'src/shared/helper';
import { TradingViewAlertDto } from '../data/database/dto/traidingview-alert.dto';
import { title } from 'process';
import { Console } from 'console';
import { DataService } from '../data/service/data.service';
import { min } from 'class-validator';
import { CalendarRepository } from '../data/database/repositories/calendar.repository';
import { TradeSignal } from '../data/database/schema/trade-signal.schema';




@Injectable()
export class BotAIService implements OnModuleInit {
  private readonly bot: TelegramBot;
  private readonly apiKey = process.env.CHATGPT_API_KEY;
  private readonly logger = new Logger(BotAIService.name);
  private openai = new OpenAI({ apiKey: this.apiKey });
  private botUsername: string;
  private currentTelegramId: string;
  private currentUserAlias: string;
  private userId: Types.ObjectId;
  private userLastAsk: Record<string, string> = {};
  private curId: Types.ObjectId;
  private userBalance: number;

  private readonly categories = {
    'اندیکاتور های تکنیکال': [
      'تحلیل حرفه ای RSI بیت‌کوین',
      'تحلیل MACD اتریوم',
      'بررسی EMA سولانا',
      'بررسی Stochastic بیت‌کوین',
      'بررسی CCI اتریوم',
      'بررسی ADX ریپل',
      ' برترین ارزهای دیجیتال امروز بر اساس RSI',
      ' برترین ارزهای دیجیتال امروز بر اساس MACD',
      ' برترین ارزهای دیجیتال امروز بر اساس EMA',
      ' برترین ارزهای دیجیتال امروز بر اساس Stochastic',
      ' برترین ارزهای دیجیتال امروز بر اساس CCI',
      ' برترین ارزهای دیجیتال امروز بر اساس ADX',
    ],
    'داده های مارکت': [
      'قیمت بیت‌کوین امروز',
      'قیمت اتریوم امروز',
      'قیمت BTC, ETH, SOL امروز',
      'برترین ارزهای دیجیتال امروز بر اساس قیمت',
      'برترین ارزهای دیجیتال امروز بر اساس حجم',
      'برترین ارزهای دیجیتال امروز بر اساس ارزش بازار',
      'تسلط بازار بیت‌کوین امروز',
      'شاخص ترس و طمع (FNG) امروز',
      'بررسی قیمت بیت‌کوین  براساس داده‌های تاریخی',
      'داده‌های تاریخی RSI اتریوم',
    ],
    'داده های سوشال': [
      'سوشال دامیننس بیت کوین',
      'بررسی بیت کوین بر اساس پارامترهای سوشال',
      'بررسی اتریوم بر اساس امتیاز گلکسی',
      'بررسی سولانا بر اساس امتیاز altRank',
      'برترین ارزهای دیجیتال بر اساس امتیاز گلکسی',
      'برترین ارزهای دیجیتال بر اساس altRank',
      'برترین ارزهای دیجیتال memecoin بر اساس امتیاز گلکسی',
      'برترین ارزهای دیجیتال layer2 بر اساس امتیاز گلکسی',
      'برترین ارزهای دیجیتال AI بر اساس امتیاز گلکسی',
      'برترین ارزهای دیجیتال NFT بر اساس امتیاز گلکسی',
    ],
    'تکنولوژی': [
      'برترین ارزهای دیجیتال در حوزه DeFi',
      'برترین ارزهای دیجیتال در حوزه AI',
      'برترین ارزهای دیجیتال در حوزه NFT',
      'برترین ارزهای دیجیتال در حوزه Gaming',
      'برترین ارزهای دیجیتال در حوزه Stablecoin',
      'برترین ارزهای دیجیتال در حوزه Real-World Assets',
      'برترین ارزهای دیجیتال در حوزه Bitcoin Ecosystem',
      'برترین ارزهای دیجیتال در حوزه Layer 1',
      'برترین ارزهای دیجیتال در حوزه Layer 2',
      'برترین ارزهای دیجیتال در حوزه MemeCoin',
      'برترین ارزهای دیجیتال در حوزه SocialFi',
      'برترین ارزهای دیجیتال در حوزه DAO',
      'برترین ارزهای دیجیتال در حوزه Sports',
      'برترین ارزهای دیجیتال در حوزه Gambling',
      'برترین ارزهای دیجیتال در حوزه Fan Tokens',
    ],
    'اخبار': [
      'آخرین اخبار بیت‌کوین',
      'آخرین اخبار NFT',
      'آخرین اخبار memecoin',
      'آخرین اخبار های ریپل',
      ' اخبار بر اساس تعاملات بالا',
      'اخبار مربوط به اتریوم',
      'اخبار با احساسات مثبت برای بیت‌کوین',
      'تحلیل دقیق بیت‌کوین با توجه به اخبار',
    ],
    'آموزش': [
      // Beginner Basics
      'آشنایی با اصول اولیه معامله‌گری',
      'ریاضیات مورد نیاز برای معامله‌گری',
      'معرفی مفهوم چارت و نمودار',
      'معرفی سایت CoinMarketCap',
      'معرفی ابزار TradingView',
      'انواع چارت‌ها و نمودارها (کندل‌استیک، میله‌ای، خطی)',
      'آموزش تحلیل ساده خطوط حمایت و مقاومت',

      // Intermediate Concepts
      'معرفی انواع ربات‌های معامله‌گری',
      'ربات‌های معامله‌گری چگونه کار می‌کنند؟',
      'معرفی کانال‌های سیگنال‌دهی',
      'آشنایی با مفهوم کپی‌ترید',
      'بررسی روش‌های مدیریت ریسک در معاملات',
      'آشنایی با استراتژی‌های بلندمدت و کوتاه‌مدت',

      // Advanced Education
      'چگونه اخبار بر بازار کریپتو اثر می‌گذارند؟',
      'نحوه تشخیص احساسات مثبت و منفی در اخبار',
      'آموزش استفاده از داده‌های سوشال در تحلیل',
      'راهنمای کامل شاخص ترس و طمع (FNG)',
      'راهنمای کار با پارامترهای Social Dominance',
      'آشنایی با امتیاز گلکسی و altRank',
      'چگونه ارزهای دیجیتال برتر را بر اساس داده‌های سوشال پیدا کنیم؟',

      // Learning about crypto types
      'ارزهای دیجیتال DeFi چیست؟',
      'توکن‌های هوش مصنوعی (AI) چیست؟',
      'توکن‌های NFT چیست؟',
      'توکن‌های Gaming چیست؟',
      'استیبل‌کوین چیست؟',
      'توکن‌های Real-World Assets چیست؟',
      'اکوسیستم بیت‌کوین چیست؟',
      'لایه اول (Layer 1) چیست؟',
      'لایه دوم (Layer 2) چیست؟',
      'میم‌کوین (MemeCoin) چیست؟',
      'توکن‌های SocialFi چیست؟',
      'توکن‌های DAO چیست؟',
      'توکن‌های ورزشی (Sports Tokens) چیست؟',
      'توکن‌های Gambling چیست؟',
      'توکن‌های Fan Tokens چیست؟',
      'توکن‌های Web3 چیست؟',
      'توکن‌های مربوط به حوزه Metaverse چیست؟',
      'توکن‌های IoT چیست؟',
      'توکن‌های Security چیست؟',
      'توکن‌های Privacy چیست؟',
    ],
    'تنظیمات کاربری': [
      //'تنظیم نام مستعار',
      'دریافت نام مستعار',
      'دریافت موجودی کاربر',
    ],
  };


  //   'تحلیل و اخبار بیت‌کوین امروز',
  //   'بررسی روندهای اتریوم امروز',
  //   'قیمت بیت‌کوین امروز',
  //   'قیمت اتریوم امروز',
  //   'قیمت چند ارز دیجیتال امروز',
  //   'برترین ارزهای دیجیتال امروز بر اساس قیمت',
  //   'RSI بیت‌کوین امروز',
  //   'MACD اتریوم امروز',
  //   'EMA سولانا امروز',
  //   'Stochastic بیت‌کوین امروز',
  //   'CCI اتریوم امروز',
  //   'ADX بیت‌کوین امروز',
  //   'برترین ارزهای دیجیتال امروز بر اساس RSI',
  //   'برترین ارزهای دیجیتال امروز بر اساس MACD',
  //   'برترین ارزهای دیجیتال امروز بر اساس EMA',
  //   'برترین ارزهای دیجیتال امروز بر اساس Stochastic',
  //   'برترین ارزهای دیجیتال امروز بر اساس CCI',
  //   'برترین ارزهای دیجیتال امروز بر اساس ADX',
  //   'تسلط بازار بیت‌کوین امروز',
  //   'Galaxy Score اتریوم امروز',
  //   'Alt Rank سولانا امروز',
  //   'احساسات بازار بیت‌کوین امروز',
  //   'آخرین اخبار بیت‌کوین امروز',
  //   'برترین اخبار امروز بر اساس تعاملات',
  //   'جستجوی اخبار مربوط به اتریوم امروز',
  //   'اخبار با احساسات مثبت برای بیت‌کوین امروز',
  //   'تولید سیگنال‌های معاملاتی برای اتریوم امروز',
  //   'تحلیل دقیق بیت‌کوین امروز',
  //   'شاخص ترس و طمع (FNG) امروز',
  //   'داده‌های تاریخی قیمت بیت‌کوین امروز',
  //   'داده‌های تاریخی RSI اتریوم امروز',
  //   'برترین ارزهای دیجیتال امروز بر اساس حجم',
  //   'برترین ارزهای دیجیتال امروز بر اساس ارزش بازار',
  //   'برترین ارزهای دیجیتال امروز در حوزه DeFi',
  //   'برترین ارزهای دیجیتال امروز در حوزه AI',
  //   'برترین ارزهای دیجیتال امروز در حوزه NFT',
  //   'برترین ارزهای دیجیتال امروز در حوزه Gaming',
  //   'برترین ارزهای دیجیتال امروز در حوزه Stablecoin',
  //   'برترین ارزهای دیجیتال امروز در حوزه Real-World Assets',
  //   'برترین ارزهای دیجیتال امروز در حوزه Bitcoin Ecosystem',
  //   'برترین ارزهای دیجیتال امروز در حوزه Layer 1',
  //   'برترین ارزهای دیجیتال امروز در حوزه Layer 2',
  //   'برترین ارزهای دیجیتال امروز در حوزه MemeCoin',
  //   'برترین ارزهای دیجیتال امروز در حوزه SocialFi',
  //   'برترین ارزهای دیجیتال امروز در حوزه DAO',
  //   'برترین ارزهای دیجیتال امروز در حوزه Sports',
  //   'برترین ارزهای دیجیتال امروز در حوزه Gambling',
  //   'برترین ارزهای دیجیتال امروز در حوزه Real Estate',
  //   'برترین ارزهای دیجیتال امروز در حوزه Fan Tokens',
  // ];

  constructor(
    private readonly iamService: IamService,
    private readonly dataService: DataService,
    private readonly balanceService: BalanceService,
    private readonly dataRepository: DataRepository,
    private readonly calendarRepository: CalendarRepository // Inject DataRepository
  ) {
    this.bot = new TelegramBot(
      process.env.TELEGRAM_BOT_TOKEN,
      //process.env.NABZAR_BOT_TOKEN,
      { polling: true });


  }

  // private readonly validCategories = [
  //   'DeFi', 'Layer 1', 'Layer 2', 'MemeCoin', 'Gaming & Metaverse', 'AI', 
  //   'NFTs', 'SocialFi', 'Stablecoin', 'Real-World Assets', 'Bitcoin Ecosystem',
  //   'Liquid Staking Derivatives', 'Exchange Tokens', 'DAO', 'Analytics', 'Sports',
  //   'Run', 'Gambling', 'Real Estate', 'Fan Tokens',
  // ];

  //
  private readonly validCategories = ['liquid-staking-tokens', 'runes',
    'analytics', 'stablecoin', 'fan', 'bitcoin-ecosystem', 'sports', 'desci', 'real-estate', 'real-world-assets',
    'ai', 'exchange-tokens', 'wallets', 'brc20', 'events', 'defi', 'layer-1', 'base-ecosystem', 'meme', 'dao',
    'layer-2', 'lending-borrowing', 'nft', 'gaming', 'gambling', 'depin', 'socialfi', 
    'stacks-ecosystem', 'made-in-usa', 'cardano','oracle', 'inj', 'zk', 'pow','solana-ecosystem','dot'];

  private readonly validSorts = [
    //'price', 
    //'price_btc',
    'volume_24h',
    'volatility',
    'circulating_supply',
    'max_supply',
    'percent_change_1h',
    'percent_change_24h',
    'percent_change_7d',
    'percent_change_30d',
    'market_cap',
    'market_cap_rank',
    'interactions_24h',
    'social_volume_24h',
    'social_dominance',
    'market_dominance',
    'market_dominance_prev',
    'galaxy_score',
    'galaxy_score_previous',
    'alt_rank',
    'alt_rank_previous',
    'sentiment',
  ];
  // = [
  //   'price', 'price_btc', 'volume_24h', 'volatility', 'circulating_supply', 'max_supply',
  //   'percent_change_1h', 'percent_change_24h', 'percent_change_7d', 'market_cap',
  //   'market_cap_rank', 'interactions_24h', 'social_volume_24h', 'social_dominance',
  //   'market_dominance', 'galaxy_score', 'galaxy_score_previous', 'alt_rank', 'alt_rank_previous',
  //   'sentiment',
  // ];

  //   private generateSystemMessage(): string {
  //     const categoryList = this.validCategories.join(', ');
  //     const sortList = this.validSorts.join(', ');
  //     const today = new Date().toLocaleDateString('en-US', {
  //       month: 'long', day: 'numeric', year: 'numeric'
  //   });

  // //   // Include the current date in the initial message
  //    const datePrompt = `Today's date is ${today}.`;

  //     return `
  // You are a crypto assistant. you are  Below are the valid categories and sorting parameters for LunarCrush data:

  // - **Categories**:
  //   ${categoryList}.

  // - **Sorting Parameters**:
  //   ${sortList}.

  // Always ensure the user input matches one of these categories or sorting parameters. If the user query does not match,
  //  politely ask them to select from the available options. ${datePrompt}`;}

  // Inside your BotAIService class

  // Function to construct the system prompt
  private constructSystemPrompt(alias: string): string {
    let basePrompt = '';
    basePrompt = `
    You are 'Nabzar,' a personal assistant for cryptocurrencies and blockchains and forex like gold and silver and US500. 
    'Nabzar' is a Persian name made from the combination of 'Nabz' (pulse) and 'Bazar' (market), symbolizing the heartbeat of the market, نبضار.
    As 'Nabzar,' you embody the characteristics of being kind, friendly, and approachable, ensuring users feel comfortable seeking your help.
    You are eager to help users, always providing clear and detailed answers in a way they can easily understand.
    You also encourage curiosity and learning by engaging with users in an interactive and supportive manner.
    for using Nabzar users must share theire phone number by share contact button in theire chat with Nabzar,
    they can also type '/help' and see list of pre defined prompts that they can use in Nabzar in cases they need help with working with Nabzar or
     persenting Nabzar features. 
    If a user asks a question in Persian, you must answer in Persian, and if a user asks in English, you answer in English.
    If a user asks a question in Persian but with English characters (Finglish), you answer in Persian language.
    Your tone is always polite, engaging, and professional, but you remain approachable and relatable to users of all experience levels.
    If the user asks questions like 'Do I buy Bitcoin or sell Bitcoin now' or other similar queries, you must analyze the requested symbol and generate trading signals using the analyzeAndCreateSignals function, 
    for buying Nabzar they must go to https://trade-ai.bot/ site and buy membership.
    You are committed to guiding users step-by-step, offering them insights, explanations, and knowledge about crypto and blockchain in a way that enhances their confidence and understanding.
    Today's date is ${new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })}.
  `;

    if (!alias) {
      basePrompt = `${basePrompt} 
    The user has not set a preferred alias yet. Please ask them to set a preferred alias. for setting their 
    alias they must use sentences like this " may name is [alias]" or "call me [alias]" or "set my alias to [alias]".`;
    }

    return basePrompt;
  }


  async getChatGptResponse(prompt: string, chatId: string): Promise<{
    responseText?: string; calledFunc: string; queryType: string;
    newParameters?: string[]; language: string, advertingMsgId: string, responseArray?: string[]
  }> {



    let queryType = 'in-scope'; // Default to in-scope
    let newParameters: string[] = [];
    let calledFunc: string = '';
    let advertingMsgId = '';
    // const analysisMsg = await this.bot.sendMessage(
    //         chatId,
    //         `🚀 <b>در حال پردازش درخواست شما...</b>\n\n✨ از <a href="https://trade-ai.bot/">برترین پلتفرم ایران</a> برای خرید ربات‌های معامله‌گر و دستیاران حرفه‌ای تریدر استفاده کنید! 🌟`,
    //         {
    //           parse_mode: 'HTML',
    //           reply_markup: {
    //             inline_keyboard: [
    //               [
    //                 {
    //                   text: 'بازدید از اسپانسر',
    //                   url: 'https://trade-ai.bot/',
    //                 },
    //               ],
    //             ],
    //           },
    //         }
    //       );
    //       advertingMsgId = analysisMsg.message_id;
          
        
    await this.bot.sendChatAction(chatId, 'typing');


    const functions = [
      // {
      //   name: 'getRSIForDate',
      //   description: 'Fetches the RSI data for a specific symbol on a specific date.',
      //   parameters: {
      //     type: 'object',
      //     properties: {
      //       symbol: {
      //         type: 'string',
      //         description: `The cryptocurrency symbol or coin name. Accepts either the symbol (e.g., BTCUSDT, etc) or the coin name (e.g., "Bitcoin", "Ripple", "Solana", "سولانا", "ریپل", etc) in any language. The name will be automatically mapped to its corresponding symbol.`
      //       },
      //       date: {
      //         type: 'string',
      //         description: 'The date for which to retrieve the RSI data, in YYYY-MM-DD format.',
      //       },
      //       language: {
      //         type: 'string',
      //         description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
      //       },
      //     },
      //     required: ['symbol', 'date', 'language'],
      //   },
      // },
      {
        name: 'getUserAlias',
        description: 'Retrieves the user\'s preferred name or alias.',
        parameters: {
          type: 'object',
          properties: {
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.'
            },
          },
          required: ['language'],
        },
      },
      {
        name: 'setUserAlias',
        description: 'When user ask for updating or setting the user\'s preferred name or alias.',
        parameters: {
          type: 'object',
          properties: {
            alias: {
              type: 'string',
              description: 'The preferred name or alias the user wants to set.',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            },
          },
          required: ['alias', 'language'],
        },
      },
      {
        name: 'getUserBalance',
        description: 'Retrieves the user\'s current balance in their preferred currency.',
        parameters: {
          type: 'object',
          properties: {
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.'
            },
          },
          required: ['language'],
        },
      },
      {
        "name": "getRSIForDate",
        "description": "Fetches the RSI data for a specific symbol on a specific date.",
        "parameters": {
          "type": "object",
          "properties": {
            "symbol": { "type": "string", "description": `The cryptocurrency symbol or coin name. Accepts either the symbol (e.g., BTCUSDT, etc) or the coin name (e.g., "Bitcoin", "Ripple", "Solana", "سولانا", "ریپل", etc) in any language. The name will be automatically mapped to its corresponding symbol.` },
            "date": { "type": "string", "description": "The date in YYYY-MM-DD format. if date is not given use today." },
            "language": {
              "type": "string",
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.'
            },
          },
          "required": ["symbol", "language"]
        }
      },
      {
        name: 'getEMAForDate',
        description: 'Fetches the EMA data for a specific symbol on a specific date.',
        parameters: {
          type: 'object',
          properties: {
            symbol: { type: 'string', description: `The cryptocurrency symbol or coin name. Accepts either the symbol (e.g., BTCUSDT, etc) or the coin name (e.g., "Bitcoin", "Ripple", "Solana", "سولانا", "ریپل", etc) in any language. The name will be automatically mapped to its corresponding symbol.` },
            date: { type: 'string', description: 'The date in YYYY-MM-DD format. If not provided, use today.' },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.'
            },
          },
          required: ['symbol', 'language'],
        },
      },
      // {
      //   name: 'getSMAForDate',
      //   description: 'Fetches the SMA data for a specific symbol on a specific date.',
      //   parameters: {
      //     type: 'object',
      //     properties: {
      //       symbol: {
      //         type: 'string', description: `The cryptocurrency symbol or coin name. Accepts either the symbol (e.g., BTCUSDT, etc) or the coin name (e.g., "Bitcoin", "Ripple", "Solana", "سولانا", "ریپل", etc) in any language. The name will be automatically mapped to its corresponding symbol.`
      //       },
      //       date: { type: 'string', description: 'The date in YYYY-MM-DD format. If not provided, use today.' },
      //       language: {
      //         type: 'string',
      //         description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.'
      //       },
      //     },
      //     required: ['symbol', 'language'],
      //   },
      // },
      {
        name: 'getStochasticForDate',
        description: 'Fetches the Stochastic data for a specific symbol on a specific date.',
        parameters: {
          type: 'object',
          properties: {
            symbol: { type: 'string', description: `The cryptocurrency symbol or coin name. Accepts either the symbol (e.g., BTCUSDT, etc) or the coin name (e.g., "Bitcoin", "Ripple", "Solana", "سولانا", "ریپل", etc) in any language. The name will be automatically mapped to its corresponding symbol.` },
            date: { type: 'string', description: 'The date in YYYY-MM-DD format. If not provided, use today.' },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.'
            },
          },
          required: ['symbol', 'language'],
        },
      },
      {
        name: 'getCCIForDate',
        description: 'Fetches the CCI data for a specific symbol on a specific date.',
        parameters: {
          type: 'object',
          properties: {
            symbol: { type: 'string', description: `The cryptocurrency symbol or coin name. Accepts either the symbol (e.g., BTCUSDT, etc) or the coin name (e.g., "Bitcoin", "Ripple", "Solana", "سولانا", "ریپل", etc) in any language. The name will be automatically mapped to its corresponding symbol.` },
            date: { type: 'string', description: 'The date in YYYY-MM-DD format. If not provided, use today.' },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.'
            },
          },
          required: ['symbol', 'language'],
        },
      },
      {
        name: 'getADXForDate',
        description: 'Fetches the ADX data for a specific symbol on a specific date.',
        parameters: {
          type: 'object',
          properties: {
            symbol: {
              type: 'string',
              description: `The cryptocurrency symbol or coin name. Accepts either the symbol (e.g., BTCUSDT, etc) or the coin name (e.g., "Bitcoin", "Ripple", "Solana", "سولانا", "ریپل", etc) in any language. The name will be automatically mapped to its corresponding symbol.`
            },
            date: {
              type: 'string',
              description: 'The date for which to retrieve the ADX data, in YYYY-MM-DD format.',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            },
          },
          required: ['symbol', 'language'],
        },
      },
      {
        name: 'getTopNStochasticCryptos',
        description: 'Fetches the top N cryptocurrencies based on their Stochastic value for a specific date.',
        parameters: {
          type: 'object',
          properties: {
            n: {
              type: 'number',
              description: 'Number of top cryptocurrencies to return based on Stochastic.',
            },
            date: {
              type: 'string',
              description: 'The date (YYYY-MM-DD) for which to retrieve the top Stochastic cryptos.',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            },
          },
          required: ['language'],
        },
      },
      {
        name: 'getTopNCCICryptos',
        description: 'Fetches the top N cryptocurrencies based on their CCI value for a specific date.',
        parameters: {
          type: 'object',
          properties: {
            n: {
              type: 'number',
              description: 'Number of top cryptocurrencies to return based on CCI.',
            },
            date: {
              type: 'string',
              description: 'The date (YYYY-MM-DD) for which to retrieve the top CCI cryptos.',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            },
          },
          required: ['language'],
        },
      },
      {
        name: 'getTopNEMACryptos',
        description: 'Fetches the top N cryptocurrencies based on their EMA value for a specific date.',
        parameters: {
          type: 'object',
          properties: {
            n: {
              type: 'number',
              description: 'Number of top cryptocurrencies to return based on EMA.',
            },
            date: {
              type: 'string',
              description: 'The date (YYYY-MM-DD) for which to retrieve the top EMA cryptos.',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            },
          },
          required: ['language'],
        },
      },
      {
        name: 'getTopNADXCryptos',
        description: 'Fetches the top N cryptocurrencies based on their ADX value for a specific date.',
        parameters: {
          type: 'object',
          properties: {
            n: {
              type: 'number',
              description: 'Number of top cryptocurrencies to return based on ADX.',
            },
            date: {
              type: 'string',
              description: 'The date (YYYY-MM-DD) for which to retrieve the top ADX cryptos.',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            },
          },
          required: ['language'],
        },
      },
      {
        name: 'getMultipleIndicatorSymbol',
        description: 'Fetches multiple Indicators for specific symbol',
        parameters: {
          type: 'object',
          properties: {
            indicators: {
              type: 'array',
              items: {
                type: 'string',
                description: ``
              },
              description: 'An array of Indicators that user request'
            },
            symbol: {
              type: 'string',
              description: `The cryptocurrency symbol or coin name. Accepts either the symbol (e.g., BTCUSDT, etc) or the coin name (e.g., "Bitcoin", "Ripple", "Solana", "سولانا", "ریپل", etc) in any language. The name will be automatically mapped to its corresponding symbol.`
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            }
          },
          required: ['indicators', 'language', 'symbol'],
        },
      },
      {
        name: 'getRSIForMultipleSymbolsOnDate',
        description: 'Fetches the RSI data for multiple symbols on a specific date.',
        parameters: {
          type: 'object',
          properties: {
            symbols: {
              type: 'array',
              items: {
                type: 'string',
                description: `The cryptocurrency symbol or coin name. Accepts either the symbol (e.g., BTCUSDT, etc) or the coin name (e.g., "Bitcoin", "Ripple", "Solana", "سولانا", "ریپل", etc) in any language. The name will be automatically mapped to its corresponding symbol.`
              },
              description: 'An array of symbols for which RSI data is requested.'
            },
            date: {
              type: 'string',
              description: 'The date (YYYY-MM-DD) for which to retrieve the RSI data. if date is not given use today.',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            }
          },
          required: ['symbols', 'language'],
        },
      },
      {
        name: 'getTopNRSICryptos',
        description: 'Fetches the top N cryptocurrencies based on their RSI value for a specific date.',
        parameters: {
          type: 'object',
          properties: {
            n: {
              type: 'number',
              description: 'Number of top cryptocurrencies to return based on RSI.'
            },
            date: {
              type: 'string',
              description: 'The date (YYYY-MM-DD) for which to retrieve the top RSI cryptos. if date is not given use today.'
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            }
          },
          required: ['language'],
        },
      },
      {
        name: 'getSortForSymbols',
        description: 'Fetches the requested sort metric values and categories for multiple symbols from the LunarCrush data.',
        parameters: {
          type: 'object',
          properties: {
            symbols: {
              type: 'array',
              items: {
                type: 'string',
                description: `The cryptocurrency symbol or coin name. Accepts either the symbol (e.g., BTCUSDT) or the coin name (e.g., Bitcoin, Ripple).`,
              },
              description: 'An array of symbols for which sort metrics are requested.',
            },
            sort: {
              type: 'string',
              description: 'The sorting parameter. Must be one of the allowed sorts: volume_24h, volatility, percent_change_24h, market_cap, interactions_24h, social_dominance, market_dominance, galaxy_score, alt_rank, sentiment.',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian.',
            },
          },
          required: ['symbols', 'sort', 'language'],
        },
      },
      {
        name: 'getSortForSymbol',
        description: 'Fetches the requested sort metric value and the categories for a given symbol from the LunarCrush data.',
        parameters: {
          type: 'object',
          properties: {
            symbol: {
              type: 'string',
              description: `The cryptocurrency symbol or coin name. Accepts either the symbol (e.g., BTCUSDT, etc) or the coin name (e.g., "Bitcoin", "Ripple", "Solana", "سولانا", "ریپل", etc) in any language. The name will be automatically mapped to its corresponding symbol.`
            },
            sort: {
              type: 'string',
              description: 'The sorting parameter. Must be one of the allowed sorts: volume_24h, volatility, percent_change_24h, market_cap, interactions_24h, social_dominance, market_dominance, galaxy_score, alt_rank, sentiment.',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            },
          },
          required: ['symbol', 'sort', 'language'],
        },
      },
      {
        name: 'getTopCryptosByCategoryAndSort',
        description: 'Fetches the top cryptocurrencies filtered by category and sorted by a given parameter. Valid categories and sorts are predetermined.',
        parameters: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'The category of the coins. Must be one of the allowed categories: liquid-staking-tokens, runes, analytics, stablecoin, fan, bitcoin-ecosystem, sports, desci, real-estate, real-world-assets, ai, exchange-tokens, wallets, brc20, events, defi, layer-1, base-ecosystem, meme, dao, layer-2, lending-borrowing, nft, gaming, gambling, depin, socialfi, stacks-ecosystem.',
            },
            sort: {
              type: 'string',
              description: 'The sorting parameter. Must be one of the allowed sorts: volume_24h, volatility, percent_change_24h, market_cap, interactions_24h, social_dominance, market_dominance, galaxy_score, alt_rank, sentiment.',
            },
            limit: {
              type: 'integer',
              description: 'The number of top cryptocurrencies to fetch (default is 10).',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            },
          },
          required: ['category', 'sort', 'language'],
        },
      },
      {
        name: 'getTopCryptosBySort',
        description: 'Fetches the top cryptocurrencies sorted by a given parameter (e.g., volume_24h, volatility, percent_change_24h, market_cap, interactions_24h, social_dominance, market_dominance, galaxy_score, alt_rank, sentiment).',
        parameters: {
          type: 'object',
          properties: {
            sort: {
              type: 'string',
              description: 'The sorting parameter. Must be one of the allowed sorts: volume_24h, volatility, percent_change_24h, market_cap, interactions_24h, social_dominance, market_dominance, galaxy_score, alt_rank, sentiment.',
            },
            limit: {
              type: 'integer',
              description: 'The number of top cryptocurrencies to fetch (default is 10).',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            },
          },
          required: ['sort', 'language'],
        },
      },
      {
        name: 'getMACDForDate',
        description: 'Fetches the MACD data for a specific symbol on a specific date.',
        parameters: {
          type: 'object',
          properties: {
            symbol: {
              type: 'string',
              description: `The cryptocurrency symbol or coin name. Accepts either the symbol (e.g., BTCUSDT, etc) or the coin name (e.g., "Bitcoin", "Ripple", "Solana", "سولانا", "ریپل", etc) in any language. The name will be automatically mapped to its corresponding symbol.`
            },
            date: {
              type: 'string',
              description: 'The date for which to retrieve the MACD data, in YYYY-MM-DD format. if date is not given use today.',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            },
          },
          required: ['symbol', 'language'],
        },
      },
      {
        name: 'getMACDForMultipleSymbolsOnDate',
        description: 'Fetches the MACD data for multiple symbols on a specific date.',
        parameters: {
          type: 'object',
          properties: {
            symbols: {
              type: 'array',
              items: {
                type: 'string',
                description: `The cryptocurrency symbol or coin name. Accepts either the symbol (e.g., BTCUSDT, etc) or the coin name (e.g., "Bitcoin", "Ripple", "Solana", "سولانا", "ریپل", etc) in any language. The name will be automatically mapped to its corresponding symbol.`
              },
              description: 'An array of symbols for which MACD data is requested.'
            },
            date: {
              type: 'string',
              description: 'The date (YYYY-MM-DD) for which to retrieve MACD data. if date is not given use today.'
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            }
          },
          required: ['symbols', 'language'],
        },
      },
      {
        name: 'getTopNMACDCryptos',
        description: 'Fetches the top N cryptocurrencies based on their MACD value for a specific date.',
        parameters: {
          type: 'object',
          properties: {
            n: {
              type: 'number',
              description: 'Number of top cryptocurrencies to return based on MACD.'
            },
            date: {
              type: 'string',
              description: 'The date (YYYY-MM-DD) for which to retrieve the top MACD cryptos. if date is not given use today.'
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            }
          },
          required: ['language'],
        },
      },
      {
        name: 'getFngForDate',
        description: 'Fetches the Fear and Greed Index data for a specific date.',
        parameters: {
          type: 'object',
          properties: {
            timestamp: {
              type: 'string',
              description: 'The date for which to retrieve the FNG index, in YYYY-MM-DD format.',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            },
          },
          required: ['language'],
        },
      },
      {
        name: 'getCryptoPrice',
        description: 'Fetches the latest price for a specific cryptocurrency or forex symbol.',
        parameters: {
          type: 'object',
          properties: {
            symbol: {
              type: 'string',
              description: `The cryptocurrency or forex symbol or coin name. Accepts either the symbol (e.g., BTCUSDT, XAUUSD,  etc) or the coin name (e.g., "Bitcoin", "Ripple", "Solana", "سولانا", "ریپل", etc) in any language. The name will be automatically mapped to its corresponding symbol.`
            },
            date: {
              type: 'string',
              description: 'The date for which to retrieve the price, in YYYY-MM-DD format. if date is not given use today.',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            },
          },
          required: ['symbol', 'language'],
        },
      },
      {
        name: 'getCryptoPrices',
        description: 'Fetches the latest prices for multiple cryptocurrency or forex symbols.',
        parameters: {
          type: 'object',
          properties: {
            symbols: {
              type: 'array',
              items: { type: 'string' },
              description: `The cryptocurrency or forex symbol or coin name. Accepts either the symbol (e.g.,XAUUSD, BTCUSDT, etc) or the coin name (e.g., "Bitcoin", "Ripple", "Solana", "سولانا", "ریپل", etc) in any language. The name will be automatically mapped to its corresponding symbol.`,
            },
            date: {
              type: 'string',
              description: 'The date for which to retrieve the prices, in YYYY-MM-DD format. if date is not given use today.',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            },
          },
          required: ['symbols', 'language'],
        },
      },
      {
        name: 'getTopCryptosByPrice',
        description: 'Fetches the top N cryptocurrencies by market price.',
        parameters: {
          type: 'object',
          properties: {
            limit: {
              type: 'integer',
              description: 'The number of top cryptocurrencies to fetch.',
            },
            date: {
              type: 'string',
              description: 'The date for which to retrieve the prices, in YYYY-MM-DD format. if date is not given use today.',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            },
          },
          required: ['language'],
        },
      },
      {
        name: 'analyzeAndCreateSignals',
        description: 'Analyzing or in persin تحلیل or technical Analyzing or trading signals generation (e.g., Buy, Sell, Hold, Target, Stop) for'
          + 'given crypto or forex symbols up to 10 and in given timeframe (default is 1hour).',
        parameters: {
          type: 'object',
          properties: {
            symbols: {
              type: 'array',
              items: { type: 'string' },
              maxItems: 10,
              description: 'A list of cryptocurrency symbols to analyze. For example: ["BTCUSDT", "ETHUSDT", "XAUUSD"]. Maximum is 10 symbols.',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            },
            timeframe: {
              type: 'string',
              description: 'The timeframe of the user query for signal or analyze default is 1h, e.g., 15m, 1h, 4h, 1d etc.',
            },
          },
          required: ['symbols', 'language', 'timefarme'],
        },
      },
      {
        name: 'handleOutOfScopeQuery',
        description: 'Handles queries that are unrelated to the bot\'s scope (e.g., non-blockchain topics), unrelated topic, e.g., "medical", "general knowledge", "sports", etc. Logs the query for analysis and informs the user politely.',
        parameters: {
          type: 'object',
          properties: {
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            },
            unrelatedTopic: {
              type: 'string',
              description: 'The detected category of the unrelated topic, e.g., "medical", "general knowledge", "sports" , etc.',
            },
            unrelatedsubjuct: {
              type: 'string',
              description: 'The detected subject of the unrelated topic, e.g., "trump", "cancer", "football", etc.',
            },
          },
          required: ['query', 'language', 'unrelatedTopic'],
        },
      },
      {
        name: 'getLatestNewsBySymbol',
        description: 'Fetches the latest N news articles about cryptocurrencies by given symbol.',
        parameters: {
          type: 'object',
          properties: {
            symbol: {
              type: 'string',
              description: `The cryptocurrency symbol or coin name. Accepts either the symbol (e.g., BTCUSDT, etc) or the coin name (e.g., "Bitcoin", "Ripple", "Solana", "سولانا", "ریپل", etc) in any language. The name will be automatically mapped to its corresponding symbol.`
            },
            limit: {
              type: 'number',
              description: 'Number of news articles to retrieve (default 10, max 30).'
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            }
          },
          required: ['language']
        }
      },
      {
        name: 'getTopNewsByInteractionsAndTitle',
        description: 'Fetches the top N news articles sorted by interactions in the last 24 hours and given title',
        parameters: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Keyword to search for in the news titles.'
            },
            limit: {
              type: 'number',
              description: 'Number of news articles to retrieve (default 10, max 30).'
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            }
          },
          required: ['language']
        }
      },
      {
        name: 'searchNewsByTitle',
        description: 'Fetches N news articles containing a specific keyword in the news title. if given title contains any token or coin name replace it by realted symbol (e.g., Ripple -> XRP, سولانا -> SOL, ریپل -> XRP, etc)',
        parameters: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Keyword to search for in the news titles.'
            },
            limit: {
              type: 'number',
              description: 'Number of news articles to retrieve (default 10, max 30).'
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            }
          },
          required: ['language']
        }
      },
      {
        name: 'getHighSentimentNewsByTitle',
        description: 'Fetch the top N news articles with high sentiment with given title',
        parameters: {
          type: 'object',
          properties: {
            n: {
              type: 'integer',
              description: 'The number of news articles to fetch (default 10, max 30).',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            },
            title: {
              type: 'string',
              description: 'Keyword to search for in the news titles.'
            },
          },
          required: ['language'],
        },
      },

    ];
    const systemPrompt = this.constructSystemPrompt(this.currentUserAlias);
    console.log('system Prompt:', systemPrompt);
    console.log('user prompt:', prompt);
    try {
      const stream = await this.openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          //          { role: 'system', content: systemMessage },
          { role: "user", content: prompt }
        ],
        model: "gpt-4o-mini-2024-07-18",
        functions: functions,
      });

      const message = stream.choices[0].message;

      // Check if ChatGPT suggested a function call
      if (message.function_call) {
        //sending advertise msg 
        calledFunc = message.function_call.name;
        const allowedFunctions = new Set(["getUserAlias", "setUserAlias", "getUserBalance"]);
        if (!allowedFunctions.has(calledFunc)) {
          const analysisMsg = await this.bot.sendMessage(
            chatId,
            `🚀 <b>در حال پردازش درخواست شما...</b>\n\n✨ از <a href="https://trade-ai.bot/">برترین پلتفرم ایران</a> برای خرید ربات‌های معامله‌گر و دستیاران حرفه‌ای تریدر استفاده کنید! 🌟`,
            {
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: 'بازدید از اسپانسر',
                      url: 'https://trade-ai.bot/',
                    },
                  ],
                ],
              },
            }
          );
          advertingMsgId = analysisMsg.message_id;
        }


        const parameters = JSON.parse(message.function_call.arguments || '{}');

        this.logger.log(`Parsed function call: ${calledFunc} with parameters: ${JSON.stringify(parameters)}`);

        let functionResponse;

        switch (calledFunc) {

          case 'setUserAlias': {
            const { alias, language } = parameters;

            try {
              // Sanitize the alias
              const sanitizedAlias = sanitizeString(alias, 30);

              // Use IamService to set the user's alias
              await this.iamService.setUserAlias(this.currentTelegramId, sanitizedAlias);

              // Prepare response
              const functionResponse = language === 'fa'
                ? `نام شما با موفقیت به "${sanitizedAlias}" تنظیم شد.`
                : `Your name has been successfully set to "${sanitizedAlias}".`;

              return {
                responseText: functionResponse,
                calledFunc,
                queryType,
                newParameters,
                language,
                advertingMsgId
              };
            } catch (error) {
              this.logger.error('Error setting user alias:', error);
              return {
                responseText: language === 'fa'
                  ? 'خطایی در تنظیم نام شما رخ داده است.'
                  : 'An error occurred while setting your name.',
                calledFunc,
                queryType,
                language,
                advertingMsgId
              };
            }
          }

          case 'getUserAlias': {
            const { language } = parameters;

            try {
              // Use IamService to retrieve user profile
              const userProfile = await this.iamService.getUser(this.userId);

              if (!userProfile || !userProfile.alias) {
                functionResponse = language === 'fa'
                  ? 'شما هنوز نام مستعاری تنظیم نکرده‌اید.'
                  : 'You have not set a preferred name yet.';
              } else {
                functionResponse = language === 'fa'
                  ? `نام شما ${userProfile.alias} است.`
                  : `Your name is ${userProfile.alias}.`;
              }

              return {
                responseText: functionResponse,
                calledFunc,
                queryType,
                newParameters,
                language,
                advertingMsgId
              };
            } catch (error) {
              this.logger.error('Error retrieving user name:', error);
              return {
                responseText: language === 'fa'
                  ? 'خطایی در بازیابی نام شما رخ داده است.'
                  : 'An error occurred while retrieving your name.',
                calledFunc,
                queryType,
                language,
                advertingMsgId
              };
            }
          }


          case 'getUserBalance': {
            const { language } = parameters;

            try {
              // Use BalanceService to retrieve user balance
              const balance = await this.balanceService.getUserBalance(this.userId, this.curId);

              if (balance === null || balance === undefined) {
                functionResponse = language === 'fa'
                  ? 'موجودی شما یافت نشد.'
                  : 'Your balance could not be retrieved.';
              } else {
                const numericBalance = typeof balance === 'number' ? balance : parseFloat(balance);

                if (isNaN(numericBalance)) {
                  functionResponse = language === 'fa'
                    ? 'موجودی شما نامعتبر است.'
                    : 'Your balance is invalid.';
                } else {
                  const formattedBalance = formatNumber(numericBalance, language);

                  functionResponse = language === 'fa'
                    ? `موجودی شما ${formattedBalance} تومان است.`
                    : `Your balance is ${formattedBalance} Tomans.`;
                }
              }

              return {
                responseText: functionResponse,
                calledFunc,
                queryType,
                newParameters,
                language,
                advertingMsgId
              };
            } catch (error) {
              this.logger.error('Error retrieving user balance:', error);
              return {
                responseText: language === 'fa'
                  ? 'خطایی در بازیابی موجودی شما رخ داده است.'
                  : 'An error occurred while retrieving your balance.',
                calledFunc,
                queryType,
                language,
                advertingMsgId
              };
            }
          }


          case 'getTopCryptosByCategoryAndSort': {
            const { category, sort = 'galaxy_score', limit = 10, language } = parameters;
            // Validate category
            if (!this.validCategories.includes(category)) {
              const errorMsg = `Invalid category: "${category}". Please choose from: ${this.validCategories.join(', ')}.`;
              return {
                responseText: errorMsg,
                calledFunc,
                queryType,
                newParameters,
                language,
                advertingMsgId
              };
            }

            // Validate sort
            if (!this.validSorts.includes(sort)) {
              const errorMsg = `Invalid sort parameter: "${sort}". Please choose from: ${this.validSorts.join(', ')}.`;
              return {
                responseText: errorMsg,
                calledFunc,
                queryType,
                newParameters,
                language,
                advertingMsgId
              };
            }

            const response = await this.getTopCoinsByCategoryAndAnySort(category, sort, limit, language);
            return {
              responseText: await this.getDynamicInterpretation(null, prompt, response, `Top Cryptocurrency in selected category ${category} sorted by ${sort}`, '', parameters.date, parameters.language),
              calledFunc,
              queryType,
              newParameters,
              language,
              advertingMsgId
            };
          }

          case 'getTopCryptosBySort': {
            const { sort, limit = 10, language } = parameters;
            // Validate sort parameter
            //volume_24h, volatility, percent_change_24h, market_cap, 
            //interactions_24h, social_dominance, market_dominance,
            // galaxy_score, alt_rank, sentiment

            if (!this.validSorts.includes(sort)) {
              const errorMsg = `Invalid sort parameter: "${sort}". Please choose from: ${this.validSorts.join(', ')}.`;
              return {
                responseText: errorMsg,
                calledFunc,
                queryType,
                newParameters,
                language,
                advertingMsgId
              };
            }

            // Now retrieve data from the repository
            const response = await this.getTopCryptosByAnySort(sort, limit, language);
            return {
              responseText: await this.getDynamicInterpretation(null, prompt, response, `Top Cryptocurrency sorted by ${sort}`, '', parameters.date, parameters.language),
              calledFunc,
              queryType,
              newParameters,
              language,
              advertingMsgId
            };
          }

          case 'handleOutOfScopeQuery': {
            const { language, unrelatedTopic, unrelatedSubjuct } = parameters;

            // Generate the response using ChatGPT
            const response = await this.generateDynamicPoliteResponse(unrelatedTopic, language);

            const newParameters = [
              unrelatedTopic, unrelatedSubjuct
            ];
            // Return the response to the user
            queryType = 'out-of-scope';
            return {
              responseText: response,
              calledFunc,
              queryType,
              newParameters,

              language,
              advertingMsgId
            };
          }
          case 'getEMAForDate': {
            const effectiveDate = parameters.date || new Date().toISOString().split('T')[0];
            const timestamp = new Date(effectiveDate).getTime() / 1000;
            const mappedSymbol = mapSymbol(parameters.symbol.toLowerCase(), 'pair');
            const emaData = await this.dataRepository.getEMABySymbolAndDate(mappedSymbol, timestamp);
            const his = await this.dataRepository.getLast7DaysEMA(mappedSymbol, timestamp);
            return {
              responseText: await this.getDynamicInterpretation(his, prompt, emaData, 'EMA', mappedSymbol, parameters.date, parameters.language),
              calledFunc,
              queryType,
              newParameters,
              language: parameters.language,
              advertingMsgId
            };
          }

          case 'getTopNEMACryptos': {
            const { n, date, language } = parameters;
            const effectiveDate = date || new Date().toISOString().split('T')[0];
            const timestamp = new Date(effectiveDate).getTime() / 1000;
            const topEMACryptos = await this.dataRepository.getTopNByIndicator('EMA', n, timestamp);

            return {
              responseText: await this.getDynamicInterpretation(null, prompt, topEMACryptos, 'Top Cryptocurrency by EMA andicator', '', parameters.date, parameters.language),
              calledFunc,
              queryType,
              newParameters,

              language,
              advertingMsgId
            };
          }

            // case 'getSMAForDate': {
            //   const effectiveDate = parameters.date || new Date().toISOString().split('T')[0];
            //   const timestamp = new Date(effectiveDate).getTime() / 1000;
            //   const mappedSymbol = mapSymbol(parameters.symbol.toLowerCase(), 'pair');
            //   const smaData = await this.dataRepository.getSMABySymbolAndDate(mappedSymbol, timestamp);
            //   const his = await this.dataRepository.getLast7Days(mappedSymbol, 'SMA', timestamp);
            //   return {
            //     responseText: await this.getDynamicInterpretation(his, prompt, smaData, 'SMA', mappedSymbol, parameters.date, parameters.language),
            //     queryType,
            //     newParameters,
            //     language: parameters.language,
            advertingMsgId
          //   };
          // }

          // case 'getTopNSMACryptos': {
          //   const { n, date, language } = parameters;
          //   const effectiveDate = date || new Date().toISOString().split('T')[0];
          //   const timestamp = new Date(effectiveDate).getTime() / 1000;
          //   const topSMACryptos = await this.dataRepository.getTopNByIndicator('SMA', n, timestamp);

          //   return {
          //     responseText: topSMACryptos.length > 0
          //       ? topSMACryptos.map((crypto, index) => `${index + 1}. ${crypto.symbol}: SMA ${crypto.sma_value}`).join('\n')
          //       : 'No SMA data available.',
          //       calledFunc,
          //     queryType,
          //     newParameters,
          //     
          //    language,
          //  advertingMsgId
          //   };
          // }

          case 'getStochasticForDate': {
            const effectiveDate = parameters.date || new Date().toISOString().split('T')[0];
            const timestamp = new Date(effectiveDate).getTime() / 1000;
            const mappedSymbol = mapSymbol(parameters.symbol.toLowerCase(), 'pair');
            const stochasticData = await this.dataRepository.getStochasticBySymbolAndDate(mappedSymbol, timestamp);
            const his = await this.dataRepository.getLast7DaysStochastic(mappedSymbol, timestamp);
            return {
              responseText: await this.getDynamicInterpretation(his, prompt, stochasticData, 'Stochastic', mappedSymbol, parameters.date, parameters.language),
              calledFunc,
              queryType,
              newParameters,
              language: parameters.language,
              advertingMsgId
            };
          }

          case 'getTopNStochasticCryptos': {
            const { n = 10, date, language } = parameters;
            const effectiveDate = date || new Date().toISOString().split('T')[0];
            const timestamp = new Date(effectiveDate).getTime() / 1000;
            const topStochasticCryptos = await this.dataRepository.getTopNByIndicator('Stochastic', n, timestamp);

            return {
              responseText: await this.getDynamicInterpretation(null, prompt, topStochasticCryptos, `Top Cryptocurrency by Stochastic andicator`, '', parameters.date, parameters.language),
              calledFunc,
              queryType,
              newParameters,

              language,
              advertingMsgId
            };
          }

          case 'getCCIForDate': {
            const effectiveDate = parameters.date || new Date().toISOString().split('T')[0];
            const timestamp = new Date(effectiveDate).getTime() / 1000;
            const mappedSymbol = mapSymbol(parameters.symbol.toLowerCase(), 'pair');
            const cciData = await this.dataRepository.getCCIBySymbolAndDate(mappedSymbol, timestamp);
            const his = await this.dataRepository.getLast7DaysCCI(mappedSymbol, timestamp);
            return {
              responseText: await this.getDynamicInterpretation(his, prompt, cciData, 'CCI', mappedSymbol, parameters.date, parameters.language),
              calledFunc,
              queryType,
              newParameters,
              language: parameters.language,
              advertingMsgId
            };
          }

          case 'getTopNCCICryptos': {
            const { n = 10, date, language } = parameters;
            const effectiveDate = date || new Date().toISOString().split('T')[0];
            const timestamp = new Date(effectiveDate).getTime() / 1000;
            const topCCICryptos = await this.dataRepository.getTopNByIndicator('CCI', n, timestamp);

            return {
              responseText: await this.getDynamicInterpretation(null, prompt, topCCICryptos, `Top Cryptocurrency by CCI andicator`, '', parameters.date, parameters.language),
              calledFunc,
              queryType,
              newParameters,

              language,
              advertingMsgId
            };
          }

          case 'getADXForDate': {
            const effectiveDate = parameters.date || new Date().toISOString().split('T')[0];
            const timestamp = new Date(effectiveDate).getTime() / 1000;
            const mappedSymbol = mapSymbol(parameters.symbol.toLowerCase(), 'pair');
            const adxData = await this.dataRepository.getADXBySymbolAndDate(mappedSymbol, timestamp);
            const his = await this.dataRepository.getLast7DaysADX(mappedSymbol, timestamp);
            return {
              responseText: await this.getDynamicInterpretation(his, prompt, adxData, 'ADX', mappedSymbol, parameters.date, parameters.language),
              calledFunc,
              queryType,
              newParameters,
              language: parameters.language,
              advertingMsgId
            };
          }

          case 'getMultipleIndicatorSymbol': {
            // Map the symbol from the input
            const mappedSymbol = mapSymbol(parameters.symbol.toLowerCase(), 'pair');

            // Fetch requested indicators
            const indicatorResults = await Promise.all(
              parameters.indicators.map(async (indicator) => {
                switch (indicator.toLowerCase()) {
                  case 'adx':
                    return { name: 'ADX', data: await this.dataRepository.getADXBySymbolAndDate(mappedSymbol) };
                  case 'rsi':
                    return { name: 'RSI', data: await this.dataRepository.getRSIBySymbolAndDate(mappedSymbol) };
                  case 'macd':
                    return { name: 'MACD', data: await this.dataRepository.getMACDBySymbolAndDate(mappedSymbol) };
                  case 'ema':
                    return { name: 'EMA', data: await this.dataRepository.getEMABySymbolAndDate(mappedSymbol) };
                  case 'sma':
                    return { name: 'SMA', data: await this.dataRepository.getSMABySymbolAndDate(mappedSymbol) };
                  case 'cci':
                    return { name: 'CCI', data: await this.dataRepository.getCCIBySymbolAndDate(mappedSymbol) };
                  case 'stochastic':
                    return { name: 'Stochastic', data: await this.dataRepository.getStochasticBySymbolAndDate(mappedSymbol) };
                  default:
                    return { name: indicator, data: `Indicator "${indicator}" is not supported.` };
                }
              })
            );

            // Prepare the dynamic response
            const responseText = await this.getDynamicInterpretation(
              null,
              prompt,
              indicatorResults, // No specific data object for multiple indicators
              'Multiple Indicators',
              mappedSymbol,
              null, // No specific date needed
              parameters.language
            );

            // Return the final response
            return {
              responseText,
              calledFunc,
              queryType,
              newParameters,
              language: parameters.language,
              advertingMsgId
            };
          }


          case 'getTopNADXCryptos': {
            const { n = 10, date, language } = parameters;
            const effectiveDate = date || new Date().toISOString().split('T')[0];
            const timestamp = new Date(effectiveDate).getTime() / 1000;
            const topADXCryptos = await this.dataRepository.getTopNByIndicator('ADX', n, timestamp);

            return {
              responseText: await this.getDynamicInterpretation(null, prompt, topADXCryptos, `Top Cryptocurrency by ADX andicator`, '', parameters.date, parameters.language),
              calledFunc,
              queryType,
              newParameters,

              language,
              advertingMsgId
            };
          }


          case 'getRSIForDate': {
            // Set the default date if not provided
            const effectiveDate = parameters.date || new Date().toISOString().split('T')[0];
            const timestamp1 = new Date(effectiveDate).getTime() / 1000;
            const mappedSymbol = mapSymbol(parameters.symbol.toLowerCase(), 'pair');
            functionResponse = await this.getRSIForDate(mappedSymbol, timestamp1);

            // // Identify new or unexpected parameters
            // const allowedParameters = ['symbol', 'date', 'language'];
            // const newParameters = Object.keys(parameters).filter(
            //   (key) => !allowedParameters.includes(key)
            // );
            const his = await this.dataRepository.getLast7DaysRSI(mappedSymbol, timestamp1);
            // Generate AI response using getDynamicInterpretation
            const aiResponse = await this.getDynamicInterpretation(his, prompt,
              functionResponse,
              'RSI',
              mappedSymbol,
              effectiveDate,
              parameters.language
            );

            return {
              responseText: aiResponse,
              calledFunc,
              queryType,
              newParameters,
              language: parameters.language,
              advertingMsgId
            };
          }

          case 'getMACDForDate':
            const ddd = parameters.date || new Date().toISOString().split('T')[0];
            const timestamp2 = new Date(ddd).getTime() / 1000;
            const mappedSymbol = mapSymbol(parameters.symbol.toLowerCase(), 'pair');
            functionResponse = await this.getMACDForDate(mappedSymbol, timestamp2);
            const his = await this.dataRepository.getLast7DaysMACD(mappedSymbol, timestamp2);
            return {
              responseText: await this.getDynamicInterpretation(his, prompt, functionResponse, 'MACD', mappedSymbol, parameters.date, parameters.language),
              calledFunc,
              queryType,
              newParameters,
              language: parameters.language,
              advertingMsgId
            };

          case 'getFngForDate':
            {
              const dd = parameters.date || new Date().toISOString().split('T')[0];
              const timesta = new Date(dd).getTime() / 1000;
              functionResponse = await this.getFngForDate(timesta);
              const his = await this.dataRepository.getLast7DaysFngDataOptimized(timesta);
              return {
                responseText: await this.getDynamicInterpretation(his, prompt, functionResponse, 'FNG', "", parameters.timestamp, parameters.language),
                calledFunc,
                queryType,
                newParameters,
                language: parameters.language,
                advertingMsgId
              };
            }
          case 'getCryptoPrice': {
            const effectiveDate = parameters.date || new Date().toISOString().split('T')[0];
            const timestamp1 = new Date(effectiveDate).getTime() / 1000;
            //console.log('parameters.symbol', parameters.symbol);
            const mappedSymbol = mapSymbol(parameters.symbol.toLowerCase(), 'pair');
            //console.log('mappedSymbol:', mappedSymbol);
            functionResponse = await this.getCryptoPrice(mappedSymbol, timestamp1);
            //console.log('functionResponse:', functionResponse);
            const his = await this.dataRepository.getLast7DaysDailyPriceOptimized(mappedSymbol, timestamp1);
            //console.log('his:', his);
            return {
              responseText: await this.getDynamicInterpretation(his, prompt, functionResponse, 'Crypto Price', mappedSymbol, parameters.date, parameters.language),
              calledFunc,
              queryType,
              newParameters,
              language: parameters.language,
              advertingMsgId
            };
          }

          case 'getTopCryptosByPrice': {
            const effectiveDate = parameters.date || new Date().toISOString().split('T')[0];
            const timestamp1 = new Date(effectiveDate).getTime() / 1000;
            functionResponse = await this.getTopCryptosByPrice(parameters.limit, timestamp1);
            return {
              responseText: await this.getDynamicInterpretation(null, prompt, functionResponse, `Top ${parameters.limit} Cryptocurrency by price`, '', parameters.date, parameters.language),
              calledFunc,
              queryType,
              newParameters,
              language: parameters.language,
              advertingMsgId
            };
          }

          //we need to handel multiple comparing 
          case 'getCryptoPrices': {
            const effectiveDate = parameters.date || new Date().toISOString().split('T')[0];
            const timestamp1 = new Date(effectiveDate).getTime() / 1000;
            functionResponse = await this.getCryptoPrices(parameters.symbols, timestamp1);
            return {
              responseText: await this.getDynamicInterpretation(null, prompt, functionResponse, `Price of following ${parameters.symbols}`, '', parameters.date, parameters.language),
              calledFunc,
              queryType,
              newParameters,
              language: parameters.language,
              advertingMsgId
            };
          }

          case 'getRSIForMultipleSymbolsOnDate': {
            const effectiveDate = parameters.date || new Date().toISOString().split('T')[0];
            const timestamp1 = new Date(effectiveDate).getTime() / 1000;
            const { symbols, language } = parameters;
            functionResponse = await this.getRSIForMultipleSymbolsOnDate(symbols, timestamp1, language);
            return {
              responseText: functionResponse,
              calledFunc,
              queryType,
              newParameters,
              language: parameters.language,
              advertingMsgId
            };
          }

          case 'getTopNRSICryptos': {
            const effectiveDate = parameters.date || new Date().toISOString().split('T')[0];
            const timestamp = new Date(effectiveDate).getTime() / 1000;
            const { n, language } = parameters;
            functionResponse = await this.getTopNRSICryptos(n, timestamp, language);
            return {
              responseText: await this.getDynamicInterpretation(null, prompt, functionResponse, `Top ${n} cryptocurrencies by RSI`, '', parameters.date, parameters.language),
              calledFunc,
              queryType,
              newParameters,
              language: parameters.language,
              advertingMsgId
            };
          }

          // New function calls for MACD (multiple and top N)
          case 'getMACDForMultipleSymbolsOnDate': {
            const effectiveDate = parameters.date || new Date().toISOString().split('T')[0];
            const timestamp = new Date(effectiveDate).getTime() / 1000;
            const { symbols, language } = parameters;
            functionResponse = await this.getMACDForMultipleSymbolsOnDate(symbols, timestamp, language);
            return {
              responseText: functionResponse,
              calledFunc,
              queryType,
              newParameters,
              language: parameters.language,
              advertingMsgId
            };
          }

          case 'getTopNMACDCryptos': {
            const { n, date, language } = parameters;
            const effectiveDate = date || new Date().toISOString().split('T')[0];
            const timestamp = new Date(effectiveDate).getTime() / 1000;
            functionResponse = await this.getTopNMACDCryptos(n, timestamp, language);
            return {
              responseText: await this.getDynamicInterpretation(null, prompt, functionResponse, `Top ${n} cryptocurrencies by MACD`, '', parameters.date, parameters.language),
              calledFunc,
              queryType,
              newParameters,
              language: parameters.language,
              advertingMsgId
            };
          }

          case 'analyzeAndCreateSignals': {
          const functionResponse = await this.analyzeAndCreateSignals(
            parameters.symbols,
            parameters.language,
            parameters.timeframe,
            prompt
          );

          // analyzeAndCreateSignals returns a STRING (the user-visible analysis text)

          // Make sure this helper is in scope, e.g. this.extractSignalJsonEnvelope(...)
          const sig = extractSignalJsonEnvelope(functionResponse); // if you exported a standalone helper

          if (sig) {
            const nowSec = Math.floor(Date.now() / 1000);
            const doc: Partial<TradeSignal> = {
              symbol: sig.symbol,
              timeframe: sig.timeframe, // or use parameters.timeframe if you prefer the requested tf
              side: sig.action,
              entry: sig.entry,
              targets: sig.targets || [],
              stop: sig.stop ?? null,
              generated_at: nowSec,
              generated_iso: new Date().toISOString(),
              source: 'gpt4o-mini-v1',
              status: 'open',
              reached: { T1: false, T2: false, T3: false, SL: false },
              extras: { prompt },
            };

            try {
              await this.dataRepository.createTradeSignal(doc as any);
            } catch (e) {
              console.error('Failed to save TradeSignal:', e);
            }
          } else {
            // Optional: log once to help you verify the prompt tail got appended
            console.warn('No NABZAR_SIGNAL_JSON envelope found in analysis output.');
          }

          const cleanedText = cleanNabzarSignalJsonSection(functionResponse);

          return {
            responseText: cleanedText, // return the actual string text
            calledFunc,
            queryType,
            newParameters,
            language: parameters.language,
            advertingMsgId,
          };
        }

          case 'getSortForSymbol': {
            const { symbol, sort, language } = parameters;

            // Validate sort
            if (!this.validSorts.includes(sort)) {
              const errorMsg = `Invalid sort parameter: "${sort}". Please choose from: ${this.validSorts.join(', ')}.`;
              return {
                responseText: errorMsg,
                calledFunc,
                queryType,
                newParameters,
                language: parameters.language,
                advertingMsgId
              };
            }
            //console.log('parameters.symbol :', parameters.symbol);
            const mappedSymbol = mapSymbol(parameters.symbol.toLowerCase(), 'plain');
            //console.log('sort: ', sort);
            //console.log('mappedSymbol', mappedSymbol);
            const sorts = await this.dataRepository.getSortValueForSymbol(mappedSymbol, sort);

            if (!sorts) {
              const errorMas = `No data found for symbol ${mappedSymbol} with the requested sort parameter.`;
              return {
                responseText: errorMas,
                calledFunc,
                queryType,
                newParameters,
                language: parameters.language,
                advertingMsgId
              };
            }


            return {
              responseText: await this.getDynamicInterpretation(null, prompt, sorts, 'Crypto market and social parameters', mappedSymbol, parameters.date, parameters.language),
              calledFunc,
              queryType,
              newParameters,
              language: parameters.language,
              advertingMsgId
            };
          }

          case 'getSortForSymbols': {
            const { symbols, sort, language } = parameters;

            // Validate sort
            if (!this.validSorts.includes(sort)) {
              const errorMsg = `Invalid sort parameter: "${sort}". Please choose from: ${this.validSorts.join(', ')}.`;
              return {
                responseText: errorMsg,
                calledFunc,
                queryType,
                newParameters,

                language,
                advertingMsgId
              };
            }

            // Map symbols and fetch data
            const mappedSymbols = symbols.map((symbol) => mapSymbol(symbol.toLowerCase(), 'plain'));
            const sorts = await this.dataRepository.getSortValueForSymbols(mappedSymbols, sort);

            // Check if no data is found for any symbol
            const validSorts = sorts.filter((res) => res !== null);
            if (validSorts.length === 0) {
              const errorMsg = `No data found for the requested sort parameter "${sort}" across the provided symbols.`;
              return {
                responseText: errorMsg,
                calledFunc,
                queryType,
                newParameters,

                language,
                advertingMsgId
              };
            }

            return {
              responseText: await this.getDynamicInterpretation(null, prompt, sorts, 'Crypto market and social parameters', mappedSymbols.join(', '), parameters.date, parameters.language),
              calledFunc,
              queryType,
              newParameters,
              language: parameters.language,
              advertingMsgId
            };
          }


          case 'getLatestNewsByTitle': {

            const { limit = 10, language, title } = parameters; // Include language
            const news = await this.dataRepository.getLatestNews(limit, title);
            return {
              responseArray: await this.formatNewsResponse(news, language),
              calledFunc,
              queryType,
              newParameters,
              language: parameters.language,
              advertingMsgId
            };
          }

          case 'getTopNewsByInteractionsAndTitle': {
            const { limit = 10, language, title } = parameters; // Include language
            let news;
            news = await this.dataRepository.getTopNewsByInteractions(limit, title);
            return {
              responseArray: await this.formatNewsResponse(news, language),
              calledFunc,
              queryType,
              newParameters,
              language: parameters.language,
              advertingMsgId
            };
          }

          case 'getLatestNewsBySymbol': {
            const { limit = 10, language } = parameters; // Include language
            let news;
            const mappedSymbol = mapSymbol(parameters.symbol.toLowerCase(), 'plain');
            if (mappedSymbol) {
              news = await this.dataRepository.getLatestNews(limit, mappedSymbol);

            } else {
              news = await this.dataRepository.getLatestNews(limit, parameters.symbol);
            }
            return {
              responseArray: await this.formatNewsResponse(news, language),
              calledFunc,
              queryType,
              newParameters,
              language: parameters.language,
              advertingMsgId
            };
          }

          case 'searchNewsByTitle': {
            const { title, limit = 10, language } = parameters; // Include language
            let news;
            if (title)
              news = await this.dataRepository.searchNewsByTitle(title, limit);
            return {
              responseArray: await this.formatNewsResponse(news, language),
              calledFunc,
              queryType,
              newParameters,
              language: parameters.language,
              advertingMsgId
            };
          }


          case 'getHighSentimentNewsByTitle': {
            const { n = 10, language, title } = parameters;
            const response = await this.getHighSentimentNews(n, language, title);
            return {
              responseArray: await this.formatNewsResponse(response, language),
              calledFunc,
              queryType,
              newParameters,
              language: parameters.language,
              advertingMsgId
            };
          }


          default:
            {
              queryType = 'out-of-scope';
              return {
                responseText: 'Requested function is not available.',
                calledFunc, queryType, language: "en", advertingMsgId
              };
            }
        }
      }
      else {
        const responseMessage = message.content?.trim();

        if (responseMessage) {
          this.logger.log(`Response from ChatGPT: ${responseMessage}`);
          return {
            responseText: responseMessage || 'Invalid response from ChatGPT.',
            calledFunc, queryType, language: "en", advertingMsgId
          };

        } else {
          this.logger.error('Received an empty response from ChatGPT', { stream });
          return {
            responseText: 'Sorry, I didn’t receive a valid response from ChatGPT. Please try again.',
            calledFunc, queryType, language: "en", advertingMsgId
          };
        }
      }
    } catch (error) {
      console.error('Error fetching response from ChatGPT:', error);
      return {
        responseText: 'There is Update going on AI Core, please try again later. ',
        calledFunc, queryType, language: "en", advertingMsgId
      };

    }
  }


  /**
 * Generates a polite response in the user's language using ChatGPT.
 * @param topic - The unrelated topic to include in the response.
 * @param language - The language in which the response should be generated (e.g., 'en', 'fa', 'es', etc.).
 * @returns {Promise<string>} - The generated response message.
 */
  private async generateDynamicPoliteResponse(topic: string, language: string): Promise<string> {
    const prompt = `
    You are a multilingual assistant. A user asked a question about an unrelated topic: "${topic}".
    Generate a polite response in ${language} that explains you can only answer questions related to blockchain and cryptocurrencies, and encourages the user to ask relevant questions.
  `;

    try {
      const response = await this.openai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a polite and professional assistant.' },
          { role: 'user', content: prompt },
        ],
        model: 'gpt-4o-mini-2024-07-18',
      });

      const generatedMessage = response.choices[0]?.message?.content?.trim();

      if (!generatedMessage) {
        throw new Error('Empty response from ChatGPT.');
      }

      return generatedMessage;
    } catch (error) {
      this.logger.error('Failed to generate polite response using ChatGPT', error);
      // Fallback message
      return `Sorry, I couldn't generate a response in ${language}. Please ask questions related to blockchain and cryptocurrencies.`;
    }
  }

  private logDuration(startTime: number, endTime: number, operation: string) {
    const duration = endTime - startTime;
    this.logger.log(`${operation} took ${duration}ms`);
  }


//   async analyzeAndCreateSignals(symbols: string[], language: string, userPrompt: string): Promise<string> {
//     let sym;
//     if (symbols.length >= 1) {
//       sym = symbols[0];
//     }
//     const effectiveDate = new Date().toISOString().split('T')[0];
//     const timestamp1 = new Date(effectiveDate).getTime() / 1000;



//     // Start timing for FNG data retrieval
//     const fngStart = Date.now();
//     const fngData = await this.dataRepository.findFngByDate();
//     const fngHis = await this.dataRepository.getLast7DaysFngDataOptimized(timestamp1);
//     const fngEnd = Date.now();
//     this.logDuration(fngStart, fngEnd, 'Fetching FNG data');
//     const fng = fngData
//       ? { value: fngData.value || "0", value_classification: fngData.value_classification || "Neutral" }
//       : { value: "0", value_classification: "Neutral" };

//     let responseText = ``;
//     //console.log('sym:', sym);
//     const symbol = mapSymbol(sym.toLowerCase(), 'pair');

//     const indicatorsStart = Date.now();
//     const [rsi, sorts, macd, adx, cci, stochastic, ema, price] = await Promise.all([
//       this.dataRepository.getRSIBySymbolAndDate(symbol),
//       this.dataRepository.getAllSortsForSymbol(symbol),
//       this.dataRepository.getMACDBySymbolAndDate(symbol),
//       this.dataRepository.getADXBySymbolAndDate(symbol),
//       this.dataRepository.getCCIBySymbolAndDate(symbol),
//       this.dataRepository.getStochasticBySymbolAndDate(symbol),
//       this.dataRepository.getEMABySymbolAndDate(symbol),
//       this.dataRepository.getLatestPriceBySymbol(symbol, timestamp1), // Raw price history
//     ]);

//     const indicatorsEnd = Date.now();
//     this.logDuration(indicatorsStart, indicatorsEnd, 'Fetching indicators data');

//     // Transform priceHistoryRaw into the expected format
//     const priceHistoryStart = Date.now();
//     const priceHistory = await this.dataRepository.getLast7DaysDailyPriceOptimized(symbol, timestamp1);
//     const priceHistoryEnd = Date.now();
//     this.logDuration(priceHistoryStart, priceHistoryEnd, 'Transforming price history data');



//     // // Validate data
//     // if (!cci || !stochastic || !rsi || !ema 
//     //   || Object.keys(sorts).length === 0
//     //    || !macd || !adx || priceHistory.length === 0) {
//     //   return `⚠️ Insufficient data (RSI, MACD, ADX, sorts, or price history) for ${symbol}.`;
//     // }

//     // Start timing for historical data retrieval
//     const historicalDataStart = Date.now();
//     const historicalData = {
//       priceHistory,
//       RSIHistory: await this.dataRepository.getLast7DaysRSI(symbol, timestamp1),
//       MACDHistory: await this.dataRepository.getLast7DaysMACD(symbol, timestamp1),
//       ADXHistory: await this.dataRepository.getLast7DaysADX(symbol, timestamp1),
//       CCIHistory: await this.dataRepository.getLast7DaysCCI(symbol, timestamp1),
//       EMAHistory: await this.dataRepository.getLast7DaysEMA(symbol, timestamp1),
//       StochasticHistory: await this.dataRepository.getLast7DaysStochastic(symbol, timestamp1)
//     };
//     const historicalDataEnd = Date.now();
//     this.logDuration(historicalDataStart, historicalDataEnd, 'Fetching historical data');

//     // Fetch last 10 news articles for the symbol
//     const newsStart = Date.now();
//     const news = await this.dataRepository.getLatestNews(5, symbol); // Assuming this method exists
//     const newsEnd = Date.now();
//     this.logDuration(newsStart, newsEnd, 'Fetching news data');


//     // Format news data
//     const formattedNews = await Promise.all(
//       news.map(async (item) => {
//         // Translate the title if the language is not English
//         let title;
//         if (language === 'en') {
//           title = item.post_title;
//         } else {
//           title = await this.getTranslatedText(item.id, item.post_title, language);
//         }
//         return `
//   📰 *News Title*: ${title}
//   - *Sentiment*: ${item.post_sentiment}
//   - *Interactions*: ${item.post_interactions || 'N/A'}
//   - *Link*: [Read more](${item.post_link})
//       `;
//       })
//     );

//     const formattedNewsString = formattedNews.join('\n\n');

//     function formatHistoricalData(historicalData: any[], indicator: string): string {
//       if (!historicalData || historicalData.length === 0) {
//         return `No historical ${indicator} data available for the last 7 days.`;
//       }

//       return `Here is the historical ${indicator} data for the past 7 days:\n${historicalData
//         .map((entry, index) => {
//           const time = entry.time ? new Date(entry.time * 1000).toLocaleString() : 'N/A';
//           const valueString = Object.entries(entry)
//             .filter(([key]) => key !== 'time')
//             .map(([key, value]) => `${key}: ${value !== undefined ? value : 'N/A'}`)
//             .join(', ');
//           return `Day ${index + 1}: ${valueString}, Time: ${time}`;
//         })
//         .join('\n')}`;
//     }




//     // Format individual indicators
//     const formattedRSIHistory = formatHistoricalData(historicalData.RSIHistory, 'RSI');
//     const formattedMACDHistory = formatHistoricalData(historicalData.MACDHistory, 'MACD');
//     const formattedADXHistory = formatHistoricalData(historicalData.ADXHistory, 'ADX');
//     const formattedCCIHistory = formatHistoricalData(historicalData.CCIHistory, 'CCI');
//     const formattedStochasticHistory = formatHistoricalData(historicalData.StochasticHistory, 'Stochastic');
//     const formattedEMAHistory = formatHistoricalData(historicalData.EMAHistory, 'EMA');
//     const formattedPriceHistory = formatHistoricalData(historicalData.priceHistory, 'Price');
//     const formattedFNGHistory = formatHistoricalData(fngHis, 'FNG');

//     const analyzeSorts = (sortLabel: string, current: any, previous: any = null) => {
//       if (current === "No data") {
//         return `${sortLabel}: No data available for analysis.`;
//       }
//       if (previous !== null) {
//         const trend = current > previous ? "an upward trend" : "a downward trend";
//         return `${sortLabel}: The current value is ${current}, showing ${trend} compared to the previous value (${previous}).`;
//       }
//       return `${sortLabel}: The current value is ${current}.`;
//     };
//     const currentPrice = price;

//     const prompt = `
//  As you are a trading assistant specializing in cryptocurrency analysis. Use the following methodologies, indicators, and data points to generate a comprehensive trading signal for the symbol ${symbol}:

//   ### **Price Data**
// - **Price Analysis**: The current price is ${currentPrice.price}. Historical data indicates:
// ${formattedPriceHistory}

// ### **Indicators Analysis**
// - **RSI Analysis**: Current RSI value is ${JSON.stringify(rsi)}. Historical data:
// ${formattedRSIHistory}

// - **MACD Analysis**: Current MACD values are ${JSON.stringify(macd)}. Historical data:
// ${formattedMACDHistory}

// - **ADX Analysis**: Current ADX value is ${JSON.stringify(adx)}. Historical data:
// ${formattedADXHistory}

// - **CCI Analysis**: Current CCI value is ${JSON.stringify(cci)}. Historical data:
// ${formattedCCIHistory}

// - **Stochastic Analysis**: Current Stochastic values are ${JSON.stringify(stochastic)}. Historical data:
// ${formattedStochasticHistory}

// - **EMA Analysis**: Current EMA value is ${JSON.stringify(ema)}. Historical data:
// ${formattedEMAHistory}
//    ### **Sentiment**
//   - **Fear and Greed Index (FNG)**: ${fng.value} (${fng.value_classification}). Historical data:
//   ${formattedFNGHistory}

//    ### **Sorts data**
//   - ${analyzeSorts("Volume (24h)", sorts.volume_24h)}
//   - ${analyzeSorts("Volatility", sorts.volatility)}
//   - ${analyzeSorts("Circulating Supply", sorts.circulating_supply)}
//   - ${analyzeSorts("Max Supply", sorts.max_supply)}
//   - ${analyzeSorts("Market Cap", sorts.market_cap)}
//   - ${analyzeSorts("Market Cap Rank", sorts.market_cap_rank)}
//   - ${analyzeSorts(
//       "Market Dominance",
//       sorts.market_dominance,
//       sorts.market_dominance_prev
//     )}
//   - ${analyzeSorts(
//       "Galaxy Score",
//       sorts.galaxy_score,
//       sorts.galaxy_score_previous
//     )}
//   - ${analyzeSorts(
//       "Alt Rank",
//       sorts.alt_rank,
//       sorts.alt_rank_previous
//     )}
//   - ${analyzeSorts("Sentiment", sorts.sentiment)}

//   ### **Latest News**
//   Here are the latest 5 news articles for ${symbol}:
//   ${formattedNewsString}

//    ### **Analysis Instructions**
//   Based on the above data and user prompt: ${userPrompt}, analyze the market conditions for ${symbol} including:

// - **News Analysis**  
// - Friendly formatting of all data  
// - A detailed explanation of price movement over the past 7 days  
// - Indicator-by-indicator evaluation comparing current and historical values  
// - Sorts analysis, including changes over time  

// ### **Trading Action Section Instructions**
// At the end, generate a trading action section with one of the following actions:
// - **Buy**
// - **Strong Buy**
// - **Sell**
// - **Strong Sell**
// - **Hold**

// 📌 Based on the chosen action, apply this logic:

// - For **Buy**:
//   - 🎯 Target = currentPrice × 1.01
//   - 🛑 Stop Loss = currentPrice × 0.9905

// - For **Strong Buy**:
//   - 🎯 Target = currentPrice × 1.0102
//   - 🛑 Stop Loss = currentPrice × 0.9905

// - For **Sell**:
//   - 🎯 Target = currentPrice × 0.99
//   - 🛑 Stop Loss = currentPrice × 1.0095

// - For **Strong Sell**:
//   - 🎯 Target = currentPrice × 0.9898
//   - 🛑 Stop Loss = currentPrice × 1.0095

// - For **Hold**: Do not provide target or stop loss. Just summarize the reason for holding.

// 📝 Format the trading action section like this:

// \`\`\`
// 📊 Trading Action: [ACTION]

// 🎯 Target Price: $[value] ([percentage])
// 🛑 Stop Loss: $[value] ([percentage])

// 📋 Summary:
// [Short summary of reasoning for the action.]

// 🧠 Explanation:
// [Detailed explanation combining technical indicators, price movement, sentiment, sorts, and news.]
// \`\`\`

// 🛑 Risk :
// This analysis is generated by AI and does not constitute financial advice.  
// You trade at your own risk.

// Please respond in ${language} language.
//   `;

//     console.log("Analyze prompt:", prompt);



//     try {
//       const aiResponseStart = Date.now();
//       const response = await this.openai.chat.completions.create({
//         messages: [
//           {
//             role: "system",
//             content: `You are a trading assistant specializing in cryptocurrency analysis.
//             you are a crypto assistant that provides detailed technical analysis and trading insights based on the given data.`,
//           },
//           {
//             role: "user",
//             content: prompt,
//           },
//         ],
//         model: "gpt-4o-mini-2024-07-18",
//       });

//       const analysis = response.choices[0].message.content.trim();

//       const aiResponseEnd = Date.now();
//       this.logDuration(aiResponseStart, aiResponseEnd, 'Fetching ai response');



//       // Append the formatted analysis to the response text
//       responseText += `💡 **${symbol} Analysis**:\n${this.formatAnalysis(analysis)}\n\n`;
//     } catch (error) {
//       console.error("Error fetching analysis from ChatGPT:", error);
//       responseText += `❌ **${symbol}**: Error generating analysis. Please try again later.\n\n`;
//     }


//     return responseText;
//   }

async analyzeAndCreateSignals(symbols: string[], language: string, timeframe: '15m'|'1h'|'4h'|'1d' = '1h', userPrompt: string): Promise<string> {
    let sym;
    if (symbols.length >= 1) {
      sym = symbols[0];
    }
    const effectiveDate = new Date().toISOString().split('T')[0];
    const timestamp1 = new Date(effectiveDate).getTime() / 1000;

    // Start timing for FNG data retrieval
    const fngStart = Date.now();
    const fngData = await this.dataRepository.findFngByDate();
    const fngHis = await this.dataRepository.getLast7DaysFngDataOptimized(timestamp1);
    const fngEnd = Date.now();
    this.logDuration(fngStart, fngEnd, 'Fetching FNG data');
    const fng = fngData
      ? { value: fngData.value || "0", value_classification: fngData.value_classification || "Neutral" }
      : { value: "0", value_classification: "Neutral" };

    let responseText = ``;
    const symbol = mapSymbol(sym.toLowerCase(), 'pair');

    const overallStart = Date.now();

    const rsiStart = Date.now();
    const rsiPromise = this.dataRepository.getRSIBySymbolAndDate(symbol)
      .then(res => { this.logDuration(rsiStart, Date.now(), 'RSI'); return res; });

    const sortsStart = Date.now();
    const sortsPromise = this.dataRepository.getAllSortsForSymbol(symbol)
      .then(res => { this.logDuration(sortsStart, Date.now(), 'SORTS'); return res; });

    const macdStart = Date.now();
    const macdPromise = this.dataRepository.getMACDBySymbolAndDate(symbol)
      .then(res => { this.logDuration(macdStart, Date.now(), 'MACD'); return res; });

    const adxStart = Date.now();
    const adxPromise = this.dataRepository.getADXBySymbolAndDate(symbol)
      .then(res => { this.logDuration(adxStart, Date.now(), 'ADX'); return res; });

    const cciStart = Date.now();
    const cciPromise = this.dataRepository.getCCIBySymbolAndDate(symbol)
      .then(res => { this.logDuration(cciStart, Date.now(), 'CCI'); return res; });

    const stoStart = Date.now();
    const stochasticPromise = this.dataRepository.getStochasticBySymbolAndDate(symbol)
      .then(res => { this.logDuration(stoStart, Date.now(), 'Stochastic'); return res; });

    const emaStart = Date.now();
    const emaPromise = this.dataRepository.getEMABySymbolAndDate(symbol)
      .then(res => { this.logDuration(emaStart, Date.now(), 'EMA'); return res; });

    const priceStart = Date.now();
    const pricePromise = this.dataRepository.getLatestPriceBySymbol(symbol, timestamp1)
      .then(res => { this.logDuration(priceStart, Date.now(), 'Price'); return res; });

    // Preserve your original destructuring order/names
    const [
      rsi, 
      sorts, 
      macd, 
      adx, 
      cci, 
      stochastic, 
      ema, 
      price
    ] = await Promise.all([
      rsiPromise,
      sortsPromise,
      macdPromise,
      adxPromise,
      cciPromise,
      stochasticPromise,
      emaPromise,
      pricePromise,
    ]);

    this.logDuration(overallStart, Date.now(), 'Fetching indicators data (overall)');



    // Transform priceHistoryRaw into the expected format
    const priceHistoryStart = Date.now();
    const priceHistory = await this.dataRepository.getLast7DaysDailyPriceOptimized(symbol, timestamp1);
    const priceHistoryEnd = Date.now();
    this.logDuration(priceHistoryStart, priceHistoryEnd, 'Transforming price history data');

    // Start timing for historical data retrieval
    const historicalDataStart = Date.now();
    const historicalData = {
      priceHistory,
      RSIHistory: await this.dataRepository.getLast7DaysRSI(symbol, timestamp1),
      MACDHistory: await this.dataRepository.getLast7DaysMACD(symbol, timestamp1),
      ADXHistory: await this.dataRepository.getLast7DaysADX(symbol, timestamp1),
      CCIHistory: await this.dataRepository.getLast7DaysCCI(symbol, timestamp1),
      EMAHistory: await this.dataRepository.getLast7DaysEMA(symbol, timestamp1),
      StochasticHistory: await this.dataRepository.getLast7DaysStochastic(symbol, timestamp1)
    };
    const historicalDataEnd = Date.now();
    this.logDuration(historicalDataStart, historicalDataEnd, 'Fetching historical data');

    // Fetch last 10 news articles for the symbol
    const newsStart = Date.now();
    const news = await this.dataRepository.getLatestNews(5, symbol); // Assuming this method exists
    const newsEnd = Date.now();
    this.logDuration(newsStart, newsEnd, 'Fetching news data');

    // Format news data
    const formattedNews = await Promise.all(
      news.map(async (item) => {
        // Translate the title if the language is not English
        let title;
        if (language === 'en') {
          title = item.post_title;
        } else {
          title = await this.getTranslatedText(item.id, item.post_title, language);
        }
        return `
  📰 *News Title*: ${title}
  - *Sentiment*: ${item.post_sentiment}
  - *Interactions*: ${item.post_interactions || 'N/A'}
  - *Link*: [Read more](${item.post_link})
      `;
      })
    );
    const formattedNewsString = formattedNews.join('\n\n');

   // Fetch calendar events for the next 30 days
    const calendarStart = Date.now();
    const currentTimestamp = Date.now(); // Use milliseconds
    const thirtyDaysLater = currentTimestamp + 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    const calendarEvents = await this.calendarRepository.getEventsBySymbol(symbol);
    console.log(`Fetched ${calendarEvents.length} calendar events for ${symbol} at runtime`);
    const upcomingEvents = calendarEvents
      .filter(event => event.fetched_at >= currentTimestamp && event.fetched_at <= thirtyDaysLater)
      .sort((a, b) => a.fetched_at - b.fetched_at);
    console.log(`Upcoming events for ${symbol}:`, upcomingEvents);
    const calendarEnd = Date.now();
    this.logDuration(calendarStart, calendarEnd, 'Fetching calendar events');

    // Format calendar events
    const formattedCalendarEvents = upcomingEvents.length > 0
      ? upcomingEvents.map(event => `
  📅 *Event*: ${event.name}
  - *Date*: ${new Date(event.event_date).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}
  - *Type*: ${event.event_type}
  - *Description*: ${event.event_description}
  - *Impact Level*: ${event.impact_level}
  - *Expected Price Impact*: ${event.expected_price_impact > 0 ? '+' : ''}${event.expected_price_impact}%
  - *Sentiment Score*: ${event.sentiment_score}
  - *Related Assets*: ${event.related_assets.join(', ')}
  `).join('\n\n')
      : `No upcoming events found for ${symbol} in the next 30 days.`;

    function formatHistoricalData(historicalData: any[], indicator: string): string {
      if (!historicalData || historicalData.length === 0) {
        return `No historical ${indicator} data available for the last 7 days.`;
      }
      return `Here is the historical ${indicator} data for the past 7 days:\n${historicalData
        .map((entry, index) => {
          const time = entry.time ? new Date(entry.time * 1000).toLocaleString() : 'N/A';
          const valueString = Object.entries(entry)
            .filter(([key]) => key !== 'time')
            .map(([key, value]) => `${key}: ${value !== undefined ? value : 'N/A'}`)
            .join(', ');
          return `Day ${index + 1}: ${valueString}, Time: ${time}`;
        })
        .join('\n')}`;
    }

    // Format individual indicators
    const formattedRSIHistory = formatHistoricalData(historicalData.RSIHistory, 'RSI');
    const formattedMACDHistory = formatHistoricalData(historicalData.MACDHistory, 'MACD');
    const formattedADXHistory = formatHistoricalData(historicalData.ADXHistory, 'ADX');
    const formattedCCIHistory = formatHistoricalData(historicalData.CCIHistory, 'CCI');
    const formattedStochasticHistory = formatHistoricalData(historicalData.StochasticHistory, 'Stochastic');
    const formattedEMAHistory = formatHistoricalData(historicalData.EMAHistory, 'EMA');
    const formattedPriceHistory = formatHistoricalData(historicalData.priceHistory, 'Price');
    const formattedFNGHistory = formatHistoricalData(fngHis, 'FNG');

    const analyzeSorts = (sortLabel: string, current: any, previous: any = null) => {
      if (current === "No data") {
        return `${sortLabel}: No data available for analysis.`;
      }
      if (previous !== null) {
        const trend = current > previous ? "an upward trend" : "a downward trend";
        return `${sortLabel}: The current value is ${current}, showing ${trend} compared to the previous value (${previous}).`;
      }
      return `${sortLabel}: The current value is ${current}.`;
    };
    const currentPrice = price;

     const isCFD = /^(XAUUSD|US100)$/i.test(symbol);
     console.log('--symbol Detection : is gold or US100 : ', isCFD)
    //  const cryptoActionBlock = `
    //       ### **Trading Action Section Instructions (Crypto)**
    //       Generate a trading action section with one of the following actions:
    //       - **Buy**
    //       - **Strong Buy**
    //       - **Sell**
    //       - **Strong Sell**
    //       - **Hold**

    //       📌 Based on the chosen action, apply this logic:
    //       - For **Buy**:
    //         - 🎯 Target = currentPrice × 1.01
    //         - 🛑 Stop Loss = currentPrice × 0.9905
    //       - For **Strong Buy**:
    //         - 🎯 Target = currentPrice × 1.0102
    //         - 🛑 Stop Loss = currentPrice × 0.9905
    //       - For **Sell**:
    //         - 🎯 Target = currentPrice × 0.99
    //         - 🛑 Stop Loss = currentPrice × 1.0095
    //       - For **Strong Sell**:
    //         - 🎯 Target = currentPrice × 0.9898
    //         - 🛑 Stop Loss = currentPrice × 1.0095
    //       - For **Hold**: Do not provide target or stop loss. Just summarize the reason for holding.

    //       📝 Format the trading action section like this:
    //       \`\`\`
    //       📊 Trading Action: [ACTION]
    //       🎯 Target Price: $[value] ([percentage])
    //       🛑 Stop Loss: $[value] ([percentage])
    //       ⏲ TimeFrame : ${timeframe}
    //       📋 Summary:
    //       [Short summary of reasoning for the action.]
    //       🧠 Explanation:
    //       [Detailed explanation combining technical indicators, price movement, sentiment, sorts, news, and calendar events.]
    //       \`\`\`
    //         `.trim();

    const cryptoActionBlock = `
  ### Trading Action Section Instructions (Crypto) — 3 Targets

  Choose exactly ONE action:
  - Buy | Strong Buy | Sell | Strong Sell | Hold

  Let currentPrice be the live price.

  Rules (TP2 matches your original single target; TP1 is softer, TP3 is more ambitious):

  - Buy:
    • TP1 = currentPrice × 1.0050
    • TP2 = currentPrice × 1.0100
    • TP3 = currentPrice × 1.0150
    • SL  = currentPrice × 0.9905

  - Strong Buy:
    • TP1 = currentPrice × 1.0070
    • TP2 = currentPrice × 1.0102
    • TP3 = currentPrice × 1.0180
    • SL  = currentPrice × 0.9905

  - Sell:
    • TP1 = currentPrice × 0.9950
    • TP2 = currentPrice × 0.9900
    • TP3 = currentPrice × 0.9850
    • SL  = currentPrice × 1.0095

  - Strong Sell:
    • TP1 = currentPrice × 0.9940
    • TP2 = currentPrice × 0.9898
    • TP3 = currentPrice × 0.9840
    • SL  = currentPrice × 1.0095

  - Hold:
    • Do NOT return SL or Targets. Provide a brief reason only.

  Percent formula (show sign, 2 decimals):
  percent(x) = 100 * (x - currentPrice) / currentPrice

  Output exactly in this format (prices ≤4 decimals; include percent vs currentPrice). No extra text:

  \`\`\`
  📊 Trading Action: [ACTION]
  🎯 TP1: $[value] ([percent])   🎯 TP2: $[value] ([percent])   🎯 TP3: $[value] ([percent])
  🛑 Stop Loss: $[value] ([percent])
  ⏲ TimeFrame : ${timeframe}
  📋 Summary:
  [Short reason]
  🧠 Explanation:
  [Detailed reasoning combining technical indicators, price movement, sentiment, sorts, news, and calendar events.]
  \`\`\`

  If action is Hold: return only "📊 Trading Action", "⏲ TimeFrame", "📋 Summary", "🧠 Explanation".
`.trim();


//      const cfdActionBlock = `
//   ### Trading Action Rules (XAUUSD & US100) — 3 Take-Profit Levels

//   Select exactly ONE action:
//   Buy | Strong Buy | Sell | Strong Sell | Hold

//   Inputs:
//   - currentPrice: number (live price)
//   - tf ∈ {15m, 1h, 4h, 1d}  // timeframe
//   - tick = 0.01             // pip/tick size

//   Pip table by timeframe (SL and TP levels in pips):
//   - 15m:  SL=25,  TP1=20,  TP2=30,  TP3=40
//   - 1h :  SL=50,  TP1=40,  TP2=60,  TP3=80
//   - 4h :  SL=100, TP1=120, TP2=160, TP3=200
//   - 1d :  SL=200, TP1=240, TP2=320, TP3=400

//   Use the row that matches \`${timeframe}\`. Let slPips,tp1Pips,tp2Pips,tp3Pips be from the table.

//   If action == "Buy":
//     SL  = currentPrice - slPips  * tick
//     TP1 = currentPrice + tp1Pips * tick
//     TP2 = currentPrice + tp2Pips * tick
//     TP3 = currentPrice + tp3Pips * tick

//   If action == "Sell":
//     SL  = currentPrice + slPips  * tick
//     TP1 = currentPrice - tp1Pips * tick
//     TP2 = currentPrice - tp2Pips * tick
//     TP3 = currentPrice - tp3Pips * tick

//   If action == "Strong Buy":
//     SL  = currentPrice - slPips * tick
//     TP1 = currentPrice + (tp1Pips * tick * 1.02)
//     TP2 = currentPrice + (tp2Pips * tick * 1.02)
//     TP3 = currentPrice + (tp3Pips * tick * 1.02)

//   If action == "Strong Sell":
//     SL  = currentPrice + slPips * tick
//     TP1 = currentPrice - (tp1Pips * tick * 1.02)
//     TP2 = currentPrice - (tp2Pips * tick * 1.02)
//     TP3 = currentPrice - (tp3Pips * tick * 1.02)

//   If action == "Hold":
//     Do NOT return SL or Targets; give only a brief reason.

//   Percent formula (include sign, 2 decimals):
//   percent(x) = 100 * (x - currentPrice) / currentPrice

//   Output exactly in this format (prices with 2 decimals; include percent vs currentPrice in parentheses). No extra text:

//   \`\`\`
//   📊 Trading Action: [ACTION]
//   🎯 TP1: $[value] ([percent])   🎯 TP2: $[value] ([percent])   🎯 TP3: $[value] ([percent])
//   🛑 Stop Loss: $[value] ([percent])
//   ⏲ TimeFrame : ${timeframe}
//   📋 Summary:
//   <short reason>
//   🧠 Explanation:
//   <detailed reasoning using indicators, price action, sentiment, sorts, news, and calendar>
//   \`\`\`

//   If action is Hold: return only "📊 Trading Action", "⏲ TimeFrame", "📋 Summary", "🧠 Explanation".
// `.trim();


const cfdActionBlock = `
### **Trading Action Section (CFD)**

**Inputs**
- symbol (e.g., XAUUSD, US30, GER40, WTI)
- currentPrice (number)
- action: **Buy | Strong Buy | Sell | Strong Sell | Hold**

**Rules**
- Always produce **three targets (T1, T2, T3)** and **one Stop Loss (SL)** — except **Hold** (no targets/SL).
- Levels are **percentages of entry (currentPrice)**.
- Round to the instrument's **tickSize**.

**Default Percent Sets (good starting point for Gold/XAUUSD)**
- **Buy**:       T1 = +0.50%, T2 = +1.00%, T3 = +2.00%; **SL = –0.75%**
- **Strong Buy**: T1 = +0.70%, T2 = +1.40%, T3 = +2.80%; **SL = –0.70%**
- **Sell**:      T1 = –0.50%, T2 = –1.00%, T3 = –2.00%; **SL = +0.75%**
- **Strong Sell**:T1 = –0.70%, T2 = –1.40%, T3 = –2.80%; **SL = +0.70%**
- **Hold**: no targets, no SL.

**Formulas**
- For **Buy / Strong Buy**:
  - Tn = currentPrice × (1 + pct_n)
  - SL = currentPrice × (1 – sl_pct)
- For **Sell / Strong Sell**:
  - Tn = currentPrice × (1 – |pct_n|)
  - SL = currentPrice × (1 + sl_pct)

**Output (JSON)**
- \`{ symbol, action, entry, targets: [T1,T2,T3], stopLoss, rrToT2 }\`
- \`rrToT2\` = |(T2 – entry)| / |(entry – SL)|

**TypeScript Helper**
\`\`\`ts
type Action = 'Buy' | 'Strong Buy' | 'Sell' | 'Strong Sell' | 'Hold';

const pctSets: Record<Action, any> = {
  Buy:          { t1: 0.005,  t2: 0.010,  t3: 0.020,  sl: 0.0075 },
  'Strong Buy': { t1: 0.007,  t2: 0.014,  t3: 0.028,  sl: 0.007  },
  Sell:         { t1:-0.005,  t2:-0.010,  t3:-0.020,  sl: 0.0075 },
  'Strong Sell':{ t1:-0.007,  t2:-0.014,  t3:-0.028,  sl: 0.007  },
  Hold:         null
};

// Optional: default tick sizes per common symbols (override as needed)
const defaultTickSize: Record<string, number> = {
  XAUUSD: 0.1,   // gold
  XAGUSD: 0.001, // silver
  US30:   1,
  GER40:  1,
  WTI:    0.01
};

function calcCFDLevels(
  symbol: string,
  currentPrice: number,
  action: Action,
  tickSize?: number
) {
  const set = pctSets[action];
  if (!set) return { symbol, action, note: 'Hold — no targets/SL' };

  const ts = tickSize ?? defaultTickSize[symbol] ?? 0.1;
  const round = (p: number) => Math.round(p / ts) * ts;

  const targets = [
    round(currentPrice * (1 + set.t1)),
    round(currentPrice * (1 + set.t2)),
    round(currentPrice * (1 + set.t3)),
  ];

  const stopLoss =
    action === 'Buy' || action === 'Strong Buy'
      ? round(currentPrice * (1 - set.sl))
      : round(currentPrice * (1 + set.sl));

  const rrToT2 = Math.abs((targets[1] - currentPrice) / (currentPrice - stopLoss));

  return {
    symbol,
    action,
    entry: round(currentPrice),
    targets,
    stopLoss,
    rrToT2: Number(rrToT2.toFixed(2))
  };
}
\`\`\`

**Example (Gold / XAUUSD)**
- \`calcCFDLevels('XAUUSD', 2000, 'Buy')\`
  → \`targets: [2010, 2020, 2040]\`, \`stopLoss: 1985\`, \`rrToT2 ≈ 1.33\`
`;



    const actionBlock = isCFD ? cfdActionBlock : cryptoActionBlock;

    const prompt = `
    [Timeframe]: ${timeframe} (always mention the timeframe in the result)
As you are a trading assistant specializing in cryptocurrency analysis. Use the following methodologies, indicators, and data points to generate a comprehensive trading signal for the symbol ${symbol}
 :

### **Price Data**
- **Price Analysis**: The current price is ${currentPrice?.price || 'N/A'}. Historical data indicates:
${formattedPriceHistory}
(always mention  "Trading Action Section Instructions" data then go for showing other explanation)
### **Trading Action Section Instructions**
${actionBlock}
### **Indicators Analysis**
- **RSI Analysis**: Current RSI value is ${JSON.stringify(rsi) || 'N/A'}. Historical data:
${formattedRSIHistory}
- **MACD Analysis**: Current MACD values are ${JSON.stringify(macd) || 'N/A'}. Historical data:
${formattedMACDHistory}
- **ADX Analysis**: Current ADX value is ${JSON.stringify(adx) || 'N/A'}. Historical data:
${formattedADXHistory}
- **CCI Analysis**: Current CCI value is ${JSON.stringify(cci) || 'N/A'}. Historical data:
${formattedCCIHistory}
- **Stochastic Analysis**: Current Stochastic values are ${JSON.stringify(stochastic) || 'N/A'}. Historical data:
${formattedStochasticHistory}
- **EMA Analysis**: Current EMA value is ${JSON.stringify(ema) || 'N/A'}. Historical data:
${formattedEMAHistory}

### **Sentiment**
- **Fear and Greed Index (FNG)**: ${fng.value} (${fng.value_classification}). Historical data:
${formattedFNGHistory}

### **Social and Market Live Data** (always mention galaxy score and altrank in this section add one line of simple description for them)
-**Volume (24h)**: ${analyzeSorts("Volume (24h)", sorts?.volume_24h || 'N/A')}
-**Volatility**: ${analyzeSorts("Volatility", sorts?.volatility || 'N/A')}
-**Circulating Supply**: ${analyzeSorts("Circulating Supply", sorts?.circulating_supply || 'N/A')}
-**Max Supply**: ${analyzeSorts("Max Supply", sorts?.max_supply || 'N/A')}
-**Market Cap**: ${analyzeSorts("Market Cap", sorts?.market_cap || 'N/A')}
-**Market Dominance**: ${analyzeSorts("Market Dominance", sorts?.market_dominance || 'N/A', sorts?.market_dominance_prev)}
-**Galaxy Score**: ${analyzeSorts("Galaxy Score", sorts?.galaxy_score || 'N/A', sorts?.galaxy_score_previous)}
-**Alt Rank**: ${analyzeSorts("Alt Rank", sorts?.alt_rank || 'N/A', sorts?.alt_rank_previous)}
-**Sentiment**: ${analyzeSorts("Sentiment", sorts?.sentiment || 'N/A')}

### **Latest News**
Here are the latest 5 news articles for ${symbol}:
${formattedNewsString}

### **Calendar Events**
Here are the upcoming events for ${symbol} in the next 30 days:
${formattedCalendarEvents}

### **Analysis Instructions**
Based on the above data and user prompt: ${userPrompt}, analyze the market conditions for ${symbol} including:
- **News Analysis**: Evaluate the sentiment and impact of recent news.
- **Calendar Events Analysis**: Explicitly mention upcoming related events, their expected price impact, and sentiment score in the analysis results. Consider how these events (e.g., conferences, token unlocks, economic reports) may affect market sentiment and price.
- Friendly formatting of all data.
- A detailed explanation of price movement over the past 7 days.
- Indicator-by-indicator evaluation comparing current and historical values.
- Sorts analysis, including changes over time.
- Event-driven insights from the calendar, factoring in expected price impact and sentiment score.
- Adapt reasoning and risk commentary according to [Timeframe].

always include a risk disclaimer adapted to the timeframe and style like this:
### **Risk Description**
🛑 Risk:
This analysis is generated by AI and does not constitute financial advice. You trade at your own risk.

always mention the signal data section in the result like this:
<<<NABZAR_SIGNAL_JSON>>>
{"symbol":"${symbol}","timeframe":"${timeframe}","action":"[ACTION]","entry":${currentPrice?.price || 0},"targets":[TP1,TP2,TP3],"stop":SL}
<<<END_NABZAR_SIGNAL_JSON>>>

Please respond in ${language} language.
  `;
  const systemPromptG5 = `
ROLE
You are Nabzar’s senior trading assistant. Your role is to analyze all provided market, indicator, sentiment, and event data and generate actionable trading signals.

TASK
- Start with the "Trading Action Section" exactly as described in the user prompt.
- Select one action: Strong Buy | Buy | Hold | Sell | Strong Sell.
- Use the formulas in the user prompt for target and stop loss.
- Provide a clear summary, then detailed explanation.

CONTEXT
- Data you will receive in the user message includes:
  • Price & 7-day history
  • Indicators: RSI, MACD, ADX, CCI, Stochastic, EMA
  • Sentiment (FNG + history)
  • Social/market metrics: volume, volatility, supply, market cap, dominance, Galaxy Score, AltRank, sentiment
  • Latest 5 news articles (title, sentiment, interactions, link)
  • Upcoming 30-day calendar events (date, type, description, impact, sentiment score, related assets)
- Always mention Galaxy Score and AltRank in the social/market section, with a one-line interpretation.
- Respect the exact section order provided in the user prompt.
- Respond in the requested language (${language}).

TIMEFRAME POLICY
- You may receive a timeframe (e.g. 15m, 1h, 4h, 1d) in the user prompt or data context.
- Align analysis and confidence to it:

Signal horizon
• 15m → scalp (hours)  
• 1h → intraday (same day)  
• 4h → swing-lite (1–3 days)  
• 1d → swing/position (days–weeks)  

Indicator emphasis
• 15m: short EMAs (9/21), RSI(7–10), fast Stochastic, OI/funding/liquidations; news low impact unless sudden.  
• 1h: EMA 20/50, RSI(14), MACD fast; FNG somewhat relevant; news/events medium.  
• 4h: EMA 50/100, MACD slope, ADX>20, trend structure; news/events meaningful.  
• 1d: EMA 100/200, ADX>25, divergences; macro/news/events very high impact.  

Confirmation strictness
• 15m: 2 aligned signals enough; be quick to HOLD if conflicting.  
• 1h: require 2–3 aligned.  
• 4h: require 3 aligned including trend-quality.  
• 1d: require 3+ aligned with no major macro conflicts.  

Risk language
• 15m: warn of whipsaws/liquidity.  
• 1h: session opens, funding flips.  
• 4h: gap/overnight risk.  
• 1d: macro/event gap risk.  

Targets/Stops
- Use the formulas given in the user prompt for precision.  
- But adapt your confidence and commentary to timeframe: smaller % moves on 15m, larger swings on daily.  

Past appearance
- Consider last N bars proportional to timeframe:  
  15m → 20–40 bars  
  1h → 30–60 bars  
  4h → 20–40 bars  
  1d → 30–90 bars  

OUTPUT FORMAT
- Begin with:
  📊 Trading Action: [ACTION]
  🎯 TP1: $[value] ([percent])   🎯 TP2: $[value] ([percent])   🎯 TP3: $[value] ([percent])
  🛑 Stop Loss: $[value] ([percent])
  ⏲ TimeFrame : $[value]
  📋 Summary: <short>
  🧠 Explanation: <long>
- Then continue with Indicators, Sentiment, Social/Market Data, News, Calendar Events, as structured in the user prompt.
- Keep numbers concise (≤4 decimals, percent with 2 decimals).

STOP CONDITIONS
- Do not fabricate data; only analyze what’s given in the user prompt.
- Do not include these instructions in output.
- End when all requested sections are produced.


Risk Description
always include a risk disclaimer adapted to the timeframe and style like this:
🛑 Risk:
This analysis is generated by AI and does not constitute financial advice. You trade at your own risk.

always mention the signal data section in the result like this:
<<<NABZAR_SIGNAL_JSON>>>
{"symbol":"${symbol}","timeframe":"${timeframe}","action":"[ACTION]","entry":${currentPrice?.price || 0},"targets":[TP1,TP2,TP3],"stop":SL}
<<<END_NABZAR_SIGNAL_JSON>>>

`;


    console.log("Analyze prompt:", prompt);

    try {
      const aiResponseStart = Date.now();
      const response = await this.openai.chat.completions.create({
        messages: [
          {
            role: "system",
            // content: `You are a trading assistant specializing in cryptocurrency analysis.
            // you are a crypto assistant that provides detailed technical analysis and trading insights based on the given data.`,
            content: systemPromptG5
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: //"gpt-5-mini",
        //"gpt-4.1-mini",
        "gpt-4o-mini-2024-07-18",
        temperature: 0.2,
      });

      const analysis = response.choices[0].message.content.trim();
      const aiResponseEnd = Date.now();
      this.logDuration(aiResponseStart, aiResponseEnd, 'Fetching ai response');

      // Append the formatted analysis to the response text
      responseText += `💡 **${symbol} Analysis**:\n${this.formatAnalysis(analysis)}\n\n`;
    } catch (error) {
      console.error("Error fetching analysis from ChatGPT:", error);
      responseText += `❌ **${symbol}**: Error generating analysis. Please try again later.\n\n`;
    }

    return responseText;
  }



  private formatAnalysis(rawAnalysis: string): string {
    return rawAnalysis
      .replace(/###/g, "🔹") // Replace section headers with a bullet icon
      .replace(/\*\*(.*?)\*\*/g, "🌟 $1") // Highlight bolded text with a star emoji
      .replace(/- /g, "➡️ "); // Use an arrow for list items

  }



  //   async generateDynamicAnalyzePrompt(
  //     symbol: string,
  //     sorts: Record<string, any>,
  //     indicators: { RSI?: number; MACD?: { MACD: number; Signal: number; Histogram: number }; ADX?: number },
  //     fng: { value: string; value_classification: string },
  //     language: string
  //   ): Promise<string> {
  //     const prompt = `
  //   You are a trading assistant specializing in cryptocurrency analysis. Use the following methodologies, indicators, and data points to generate a comprehensive trading signal for the symbol ${symbol}:

  //    ### **Analysis Instructions**
  //   1. **RSI**: Evaluate for overbought (>70) or oversold (<30) conditions.
  //   2. **MACD**: Identify bullish or bearish crossovers.
  //   3. **ADX**: Assess the trend's strength (e.g., ADX > 25 indicates a strong trend).
  //   4. **FNG**: Factor in market sentiment (e.g., "Fear" indicates cautious trading; "Greed" suggests optimism).
  //   5. **Sorts**: Use price, volume_24h, volatility, circulating_supply, max_supply, percent_change_1h, percent_change_24h, 
  //   percent_change_7d, percent_change_30d, market_cap, market_cap_rank, interactions_24h, 
  //   social_volume_24h, social_dominance, market_dominance, market_dominance_prev, galaxy_score, 
  //   galaxy_score_previous, alt_rank, alt_rank_previous and sentiment, to refine the signal.
  //   6. Combine these indicators to suggest a trading action: "Buy", "Sell", "Hold", or "Strong Buy/Sell".
  //   7. Provide a detailed explanation for the signal, considering the above data points.
  //   8. Respond in ${language} language.

  //   ### **Objective**
  //   Deliver actionable insights to traders using these data points. Include a summary of the analysis and a clear recommendation.

  //   ### **Indicators**
  //   - **RSI**: ${indicators.RSI ? `Value: ${indicators.RSI}` : "No data available"}
  //   - **MACD**: ${indicators.MACD
  //         ? `MACD: ${indicators.MACD.MACD}, Signal: ${indicators.MACD.Signal}, Histogram: ${indicators.MACD.Histogram}`
  //         : "No data available"
  //       }
  //   - **ADX**: ${indicators.ADX ? `Value: ${indicators.ADX}` : "No data available"}

  //   ### **Sentiment**
  //   - **Fear and Greed Index (FNG)**: ${fng.value} (${fng.value_classification})

  //   ### **Sorts**
  // - **Price**: ${sorts.price || "No data"}
  //   - **Volume (24h)**: ${sorts.volume_24h || "No data"}
  // - **Volatility**: ${sorts.volatility || "No data"}
  // - **Circulating Supply**: ${sorts.circulating_supply || "No data"}
  // - **Max Supply**: ${sorts.max_supply || "No data"}
  // - **Percent Change (1h)**: ${sorts.percent_change_1h || "No data"}
  // - **Percent Change (24h)**: ${sorts.percent_change_24h || "No data"}
  // - **Percent Change (7d)**: ${sorts.percent_change_7d || "No data"}
  // - **Percent Change (30d)**: ${sorts.percent_change_30d || "No data"}
  // - **Market Cap**: ${sorts.market_cap || "No data"}
  // - **Market Cap Rank**: ${sorts.market_cap_rank || "No data"}
  // - **Interactions (24h)**: ${sorts.interactions_24h || "No data"}
  // - **Social Volume (24h)**: ${sorts.social_volume_24h || "No data"}
  // - **Social Dominance**: ${sorts.social_dominance || "No data"}
  // - **Market Dominance**: ${sorts.market_dominance || "No data"}
  // - **Market Dominance (Prev)**: ${sorts.market_dominance_prev || "No data"}
  // - **Galaxy Score**: ${sorts.galaxy_score || "No data"}
  // - **Galaxy Score (Prev)**: ${sorts.galaxy_score_previous || "No data"}
  // - **Alt Rank**: ${sorts.alt_rank || "No data"}
  // - **Alt Rank (Prev)**: ${sorts.alt_rank_previous || "No data"}
  // - **Sentiment**: ${sorts.sentiment || "No data"} 
  // `;

  //     return prompt;
  //   }



  private async getTranslatedText(
    id: string,
    originalText: string,
    language: string,
  ): Promise<string> {
    // Check if translation exists in DB
    const existingTranslation = await this.dataRepository.getTranslation(id, language);
    if (existingTranslation) {
      return existingTranslation;
    }

    // Translation doesn't exist, request from ChatGPT
    const translatedText = await this.translateTextWithChatGPT(originalText, language);

    // Save the translation to DB
    await this.dataRepository.saveTranslation(id, originalText, language, translatedText);
    return translatedText;
  }

  private async translateTextWithChatGPT(originalText: string, language: string): Promise<string> {
    const prompt = `
  Translate the following text to ${language}:
  "${originalText}"
    `;
    const response = await this.openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a professional translator.' },
        { role: 'user', content: prompt },
      ],
      model: 'gpt-4o-mini-2024-07-18',
    });

    const translatedText = response.choices[0]?.message?.content?.trim();
    if (!translatedText) {
      this.logger.error(`Failed to fetch translation for text: "${originalText}"`);
      throw new Error('Translation failed.');
    }
    this.logger.log(`New translation generated by ChatGPT for language: ${language}`);
    return translatedText;
  }


  async getDynamicInterpretation(historicalData: any[], prompt: string, data: any, topic: string, symbol: string, date: string, language: string): Promise<string> {

    const historicalDataString = historicalData
      ? `Here is the historical ${topic} data for the past 7 days:\n${[...historicalData]
        .reverse() // Reverse the array to show the latest data first
        .map((entry, index) => `Day ${index + 1}: ${JSON.stringify(entry)}`)
        .join("\n")}`
      : `No historical data available for ${topic}.`;

    // Updated prompt to include historical data
    const additionalPrompt = `
  The user asked the following: "${prompt}".
  Provide a detailed interpretation of the following topic -> ${topic}, data for symbol(s) -> ${symbol} ${date ? `on date -> ${date}` : ''} , data ->
  ${JSON.stringify(data)}.
  Please include an explanation of user promt and details in what this ${topic} data and show time with data and use the historical trends -> ${historicalDataString}, imply in terms of market conditions and trading strategy.
  Answer in ${language}.
`;
    console.log('additionalPrompt :', additionalPrompt)
    try {
      const response = await this.openai.chat.completions.create({
        messages: [
          {
            role: "system", content: "You are a crypto assistant that provides insights based on given data and context. " +
              "You must respond in the language specified by the user. If the user specifies Persian, respond in Persian. " +
              "For English or other languages, respond accordingly."
          },
          { role: "user", content: additionalPrompt }
        ],
        model: "gpt-4o-mini-2024-07-18",
      });

      const detailedInterpretation = response.choices[0].message.content.trim();
      return detailedInterpretation;
    } catch (error) {
      console.error('Error fetching dynamic interpretation from ChatGPT:', error);
      return `Here is the raw ${topic} data: ${JSON.stringify(data)}`;
    }
  }

  async handleGetLastUsers(n: number): Promise<string[]> {
    const users = await this.iamService.getLastNUsers(n);
    return users.map((u, i) => `*${i + 1}.* 🆔 ID: ${escapeMarkdown(u.telegramID || '')}
  👤 Username: ${escapeMarkdown(u.telegramUserName || '-')}
  🧑 First Name: ${escapeMarkdown(u.telegramFirstName || '-')}
  👨‍🦰 Last Name: ${escapeMarkdown(u.telegramLastName || '-')}
  📱 Mobile: ${escapeMarkdown(u.mobile || '-')}`);
  }
  
  
  async handleGetBalance(telegramId: string): Promise<string> {
    const user = await this.iamService.findUserByTelegramID(telegramId);
    if (!user) return `❌ User ${telegramId} not found.`;
    const balance = await this.balanceService.getUserBalance(user._id);
    return `💰 Balance for ${telegramId}: ${balance}`;
  }
  
  async handleGetExpiredUsers(n: number): Promise<string[]> {
    const users = await this.iamService.getExpiredUsers(n);
    return users.map((u, i) => `*${i + 1}.* 🆔 ID: ${escapeMarkdown(u.telegramID || '')}
  👤 Username: ${escapeMarkdown(u.telegramUserName || '-')}
  🧑 First Name: ${escapeMarkdown(u.telegramFirstName || '-')}
  👨‍🦰 Last Name: ${escapeMarkdown(u.telegramLastName || '-')}
  📱 Mobile: ${escapeMarkdown(u.mobile || '-')}
  💰 Last Balance: ${u.balanceAfterTransaction ?? '-'}
  📅 Last Renew (Jalali): ${escapeMarkdown(u.lastRenewDate || '-')}`);
  }
  
  private async handleMakeExpired(chatId: string, telegramId: string): Promise<any> {
    return await this.dataService.handleMakeExpired(chatId, telegramId);
  }
  
  private async handleGetChatLogs(chatId: string, telegramId: string, n: number): Promise<any[]> {
   return await this.dataService.handleGetChatLogs(telegramId, n);
  }
  
  async handleGetUserMChats(n: number, m: number): Promise<string[]> {
    const users = await this.iamService.findUsersWithMinChatCount(m, n); // single optimized query
  
    return users.map((u, i) =>
      `*${i + 1}.* 🆔 ID: ${escapeMarkdown(u.telegramID || '-')}\n` +
      `👤 Username: ${escapeMarkdown(u.telegramUserName || '-')}\n` +
      `🧑 First Name: ${escapeMarkdown(u.telegramFirstName || '-')}\n` +
      `👨‍🦰 Last Name: ${escapeMarkdown(u.telegramLastName || '-')}\n` +
      `📱 Mobile: ${escapeMarkdown(u.mobile || '-')}\n` +
      `💬 Chat Count: ${u.chatCount}`
    );
  }
  
  
  
  private async handleGetUserDeposits(n: number): Promise<any> {
    return await this.dataService.handleGetUserDeposits(n);
  }
  

  // Fetch prices for multiple symbols
  async getCryptoPrices(symbols: string[], date: number): Promise<string> {
    if (!symbols || symbols.length === 0) {
      return "Please provide at least one cryptocurrency symbol.";
    }

    // Fetch the latest price for each symbol
    const prices = await Promise.all(
      symbols.map(async (symbol) => {
        const mappedSymbol = mapSymbol(symbol.toLowerCase(), 'pair');
        const latestPrice = await this.dataRepository.getLatestPriceBySymbol(mappedSymbol, date);
        if (latestPrice) {
          return `${latestPrice.symbol}: ${latestPrice.price} USDT`;
        } else {
          return `${symbol}: Price not available.`;
        }
      })
    );

    // Combine all responses into a single message
    return prices.join('\n');
  }


  async getFngForDate(date?: number): Promise<string> {

    // Convert the date to a timestamp or use date logic to match "today", "yesterday", etc.
    const targetDate = new Date(date).setHours(0, 0, 0, 0) / 1000; // Adjust for your timestamp format

    // Retrieve the relevant FNG data based on the target date
    const fngData = await this.dataRepository.findFngByDate(date); // Fetch by date

    if (fngData) {
      const formattedDate = new Date(fngData.timestamp * 1000).toLocaleDateString('fa-IR');
      return `The FNG index for ${formattedDate} was ${fngData.value} (${fngData.value_classification}).`;
    } else {
      return `No FNG data found for ${date}.`;
    }
  }



  async getCryptoPrice(symbol: string, date: number): Promise<string> {

    const priceData = await this.dataRepository.getLatestPriceBySymbol(symbol, date);
    console.log('getCryptoPrice - priceData :', priceData);
    return priceData ? `The latest price of ${symbol} is ${priceData.price} USDT` : `No data found for symbol ${symbol}`;
  }

  async getTopCryptosByPrice(limit: number, date: number): Promise<string> {
    const targetDate = new Date(date).setHours(0, 0, 0, 0) / 1000; // Adjust for your timestamp format
    const topCryptos = await this.dataRepository.getTopCryptosByPrice(limit, targetDate);
    return topCryptos.length > 0
      ? topCryptos.map((crypto, index) => `${index + 1}. ${crypto.symbol}: ${crypto.price} USDT`).join('\n')
      : 'No data available for top cryptocurrencies.';
  }

  // async getTopCryptosByVolatility(limit: number): Promise<string> {
  //   const MAX_LIMIT = 50; // Maximum allowed limit for results

  //   // If the limit is 0 or greater than MAX_LIMIT, use MAX_LIMIT
  //   const finalLimit = limit === 0 || limit > MAX_LIMIT ? MAX_LIMIT : 10;

  //   const topCryptos = await this.dataRepository.getTopCryptosByVolatility(finalLimit);

  //   if (topCryptos.length === 0) {
  //     return 'No data available for top cryptocurrencies sorted by volatility.';
  //   }

  //   // Append a message if the returned limit is MAX_LIMIT
  //   const limitMessage =
  //     finalLimit === MAX_LIMIT
  //       ? ` (Returning the top ${MAX_LIMIT} most volatile cryptocurrencies.)`
  //       : '';

  //   return (
  //     `Top ${finalLimit} cryptocurrencies by volatility${limitMessage}:\n` +
  //     topCryptos
  //       .map((crypto, index) => `${index + 1}. ${crypto.symbol} - volatility: ${crypto.volatility}, Price:  ${parseFloat(crypto.price).toFixed(6)} USDT`)
  //       .join('\n')
  //   );
  // }

  //   // Method to get the top cryptocurrencies by galaxy score
  //   async getTopCryptosByGalaxyScore(limit: number): Promise<string> {
  //     const MAX_LIMIT = 50; // Maximum allowed limit for results

  //   // If the limit is 0 or greater than MAX_LIMIT, use MAX_LIMIT
  //   const finalLimit = limit === 0 || limit > MAX_LIMIT ? MAX_LIMIT : 10;
  //     const topCryptos = await this.dataRepository.getTopCryptosByGalaxyScore(finalLimit);
  //     if (topCryptos.length === 0) return 'No data available for top cryptocurrencies by galaxy score.';

  //     return (
  //       `Top ${finalLimit} cryptocurrencies by social score:\n` +
  //       topCryptos
  //         .map(
  //           (crypto, index) =>
  //             `${index + 1}. ${crypto.symbol} - Social Score: ${crypto.galaxy_score}, Price:  ${parseFloat(crypto.price).toFixed(6)} USDT`
  //         )
  //         .join('\n')
  //     );
  //   }

  //   // Method to get the top cryptocurrencies by alt rank
  //   async getTopCryptosByAltRank(limit: number): Promise<string> {
  //     const MAX_LIMIT = 50; // Maximum allowed limit for results

  //   // If the limit is 0 or greater than MAX_LIMIT, use MAX_LIMIT
  //   const finalLimit = limit === 0 || limit > MAX_LIMIT ? MAX_LIMIT : 10;
  //     const topCryptos = await this.dataRepository.getTopCryptosByAltRank(finalLimit);
  //     if (topCryptos.length === 0) return 'No data available for top cryptocurrencies by alt rank.';


  //     return `Top ${finalLimit} altcoin cryptocurrencies \n` + 
  //            topCryptos.map((crypto, index) => `${index + 1}. ${crypto.symbol} - Rank Score: ${crypto.alt_rank}, Price:  ${parseFloat(crypto.price).toFixed(6)} USDT`).join('\n');
  //   }
  async getTopCryptosByAnySort(sort: string, limit: number, language: string): Promise<string> {
    // Check that the limit is sensible
    const MAX_LIMIT = 50;
    const finalLimit = limit <= 0 || limit > MAX_LIMIT ? 10 : limit;

    const coins = await this.dataRepository.getTopCoinsBySort(sort, finalLimit);

    if (!coins || coins.length === 0) {
      return `No data available for sort "${sort}".`;
    }

    // Format the coins into a readable response
    // You can later also prompt for `language` if you need to translate this output
    return coins
      .map((coin, index) => `${index + 1}. ${coin.symbol} (${coin.name}) - ${sort}: ${coin[sort as keyof typeof coin]}`)
      .join('\n');
  }


  async getRSIForDate(symbol: string, date: number) {
    // Map common names to symbols
    //const mappedSymbol = mapSymbol(symbol.toLowerCase(), 'pair');
    const functionResponse = await this.dataRepository.getRSIBySymbolAndDate(symbol, date);
    return functionResponse
      ? `The RSI for ${symbol} on ${date} was ${functionResponse.RSI}.`
      : `No RSI data found for ${symbol} on ${date}.`;
  }



  private async generateErrorMessage(message: string, language: string): Promise<string> {
    // Use ChatGPT to translate the error message dynamically
    const response = await this.openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'Translate the following error message to the specified language.' },
        { role: 'user', content: `${message}\nLanguage: ${language}` },
      ],
      model: 'gpt-4o-mini-2024-07-18',
    });
    return response.choices[0].message.content.trim();
  }

  async getTopCoinsBySort(sort: string, limit: number, language: string): Promise<string> {

    if (!this.validSorts.includes(sort)) {
      const errorMessage = await this.generateErrorMessage(
        `Invalid sort parameter. Please choose from: ${this.validSorts.join(', ')}`,
        language
      );
      return errorMessage;
    }


    const coins = await this.dataRepository.getTopCoinsBySort(sort, limit);

    // If no coins are returned, handle the error message in the `lunarCrushService`.
    if (!coins || coins.length === 0) {
      return `No data available for sort "${sort}".`;
    }

    // Format the coins into a readable response
    return coins.length > 0
      ? coins
        .map(
          (coin, index) =>
            `${index + 1}. ${coin.symbol} (${coin.name}) - ${sort}: ${coin[sort as keyof typeof coin]}`
        )
        .join('\n')
      : 'No data available.';
  }

  async getTopCoinsByCategoryAndAnySort(category: string, sort: string, limit: number, language: string): Promise<string> {
    const MAX_LIMIT = 50;
    const finalLimit = limit <= 0 || limit > MAX_LIMIT ? 10 : limit;

    const coins = await this.dataRepository.getTopCoinsByCategoryAndSort(category, sort, finalLimit);

    if (!coins || coins.length === 0) {
      return `No data available for category "${category}" and sort "${sort}".`;
    }

    // Format the coins into a readable response
    // Optionally, you could consider translating the output based on the `language` parameter later
    return coins
      .map((coin, index) => `${index + 1}. ${coin.symbol} (${coin.name}) - ${sort}: ${coin[sort as keyof typeof coin]}`)
      .join('\n');
  }


  async getMACDForDate(symbol: string, date: number) {

    const functionResponse = await this.dataRepository.getMACDBySymbolAndDate(symbol, date);
    if (functionResponse) {
      return `The MACD data for ${symbol} on ${date}:\n- MACD: ${functionResponse.MACD}\n- Signal: ${functionResponse.Signal}\n- Histogram: ${functionResponse.Histogram}.`;
    } else {
      return `No MACD data found for ${symbol} on ${date}.`;
    }
  }


  async getRSIForMultipleSymbolsOnDate(symbols: string[], date: number, language: string): Promise<string> {
    // TODO: Implement logic to fetch RSI for multiple symbols
    // Example:
    const results = await Promise.all(symbols.map(async (sym) => {
      // Map common names to symbols
      const mappedSymbol = mapSymbol(sym.toLowerCase(), 'pair');
      const data = await this.dataRepository.getRSIBySymbolAndDate(mappedSymbol, date);
      if (data && data.RSI) {
        return `${mappedSymbol}: RSI ${data.RSI}`;
      } else {
        return `${mappedSymbol}: No RSI data.`;
      }
    }));
    return results.join('\n');
  }

  async getTopNRSICryptos(n: number, date: number, language: string): Promise<string> {
    // TODO: Implement logic to fetch top N RSI cryptos
    // Example (dummy):
    const results = await this.dataRepository.getTopNByIndicator('RSI', n, date);
    if (!results || results.length === 0) return 'No RSI data available.';
    return results.map((r, i) => `${i + 1}. ${r.symbol}: RSI ${r.RSI}`).join('\n');
  }

  async getMACDForMultipleSymbolsOnDate(symbols: string[], date: number, language: string): Promise<string> {
    // TODO: Implement logic to fetch MACD for multiple symbols
    const results = await Promise.all(symbols.map(async (sym) => {
      // Map common names to symbols
      const mappedSymbol = mapSymbol(sym.toLowerCase(), 'pair');
      const data = await this.dataRepository.getMACDBySymbolAndDate(mappedSymbol, date);
      if (data) {
        return `${mappedSymbol}: MACD: ${data.MACD}, Signal: ${data.Signal}, Histogram: ${data.Histogram}`;
      } else {
        return `${mappedSymbol}: No MACD data.`;
      }
    }));
    return results.join('\n');
  }

  async getTopNMACDCryptos(n: number, date: number, language: string): Promise<string> {
    // TODO: Implement logic to fetch top N MACD cryptos
    const results = await this.dataRepository.getTopNByIndicator('MACD', n, date);
    if (!results || results.length === 0) return 'No MACD data available.';
    return results.map((r, i) => `${i + 1}. ${r.symbol}: MACD ${r.MACD}`).join('\n');
  }


  private getSentimentIcon(sentiment: number): string {
    if (sentiment >= 4) {
      return '🟢'; // Positive sentiment
    } else if (sentiment >= 2.5) {
      return '🟡'; // Neutral sentiment
    } else {
      return '🔴'; // Negative sentiment
    }
  }

  private getSentimentTitle(sentiment: number): string {
    if (sentiment >= 4) return 'Positive';
    else if (sentiment >= 2.5) return 'Neutral';
    else return 'Negative';
  }

  private async formatNewsResponse(
    news: any[],
    language: string,
  ): Promise<string[]> {
    if (!news || news.length === 0) return ['No news found.'];

    // Format each news item and return an array of formatted strings
    return Promise.all(
      news.map(async (item) => {

        const getTimeAgo = (timestamp: number): string => {
          const now = Date.now();
          const secondsAgo = Math.floor((now - timestamp * 1000) / 1000);

          if (secondsAgo < 60) {
            return `${secondsAgo}s ago`;
          } else if (secondsAgo < 3600) {
            return `${Math.floor(secondsAgo / 60)}m ago`;
          } else if (secondsAgo < 86400) {
            return `${Math.floor(secondsAgo / 3600)}h ago`;
          } else {
            return `${Math.floor(secondsAgo / 86400)}d ago`;
          }
        };
        // Determine sentiment icon based on sentiment value
        const sentiment = item.post_sentiment;
        let sentimentIcon = '⚪ Neutral';
        if (sentiment < 2.5) {
          sentimentIcon = '🔴 Negative';
        } else if (sentiment >= 2.5 && sentiment <= 3.4) {
          sentimentIcon = '⚪ Neutral';
        } else if (sentiment > 3.4) {
          sentimentIcon = '🟢 Positive';
        }

        // Translate the title if the language is not English
        const translatedTitle = language === 'en'
          ? item.post_title
          : await this.getTranslatedText(item.id, item.post_title, language);

        // Calculate time ago
        const timeAgo = getTimeAgo(item.post_created);

        // Format the news item
        return `
  📰 *New Crypto News*:
  *Title:* ${translatedTitle}
  *Source:* ${item.creator_name || 'Unknown'}
  *Time:* ${timeAgo}
  *Sentiment:* ${sentimentIcon}
  *Link:* [Read more](${item.post_link})
        `;
      }),
    );
  }

  private async formatSingleNews(
    newsItem: any,
    language: string,
  ): Promise<string> {
    if (!newsItem) return 'No news item provided.';

    // Helper function to calculate time ago
    const getTimeAgo = (timestamp: number): string => {
      const now = Date.now();
      const secondsAgo = Math.floor((now - timestamp * 1000) / 1000);

      if (secondsAgo < 60) {
        return `${secondsAgo}s ago`;
      } else if (secondsAgo < 3600) {
        return `${Math.floor(secondsAgo / 60)}m ago`;
      } else if (secondsAgo < 86400) {
        return `${Math.floor(secondsAgo / 3600)}h ago`;
      } else {
        return `${Math.floor(secondsAgo / 86400)}d ago`;
      }
    };

    // Determine sentiment icon based on sentiment value
    const sentiment = newsItem.post_sentiment;
    let sentimentIcon = '⚪ Neutral';
    if (sentiment < 2.5) {
      sentimentIcon = '🔴 Negative';
    } else if (sentiment >= 2.5 && sentiment <= 3.4) {
      sentimentIcon = '⚪ Neutral';
    } else if (sentiment > 3.4) {
      sentimentIcon = '🟢 Positive';
    }

    // Translate the title if the language is not English
    const translatedTitle = language === 'en'
      ? newsItem.post_title
      : await this.getTranslatedText(newsItem.id, newsItem.post_title, language);

    // Calculate time ago
    const timeAgo = getTimeAgo(newsItem.post_created);

    // Format the news item
    return `
📰 *New Crypto News*:
*Title:* ${translatedTitle}
*Source:* ${newsItem.creator_name || 'Unknown'}
*Time:* ${timeAgo}
*Sentiment:* ${sentimentIcon}
*Link:* [Read more](${newsItem.post_link})
  `;
  }

  // private async formatNewsResponse(
  //   news: any[],
  //   language: string,
  // ): Promise<string> {
  //   if (!news || news.length === 0) return 'No news found.';

  //   const formattedNews = await Promise.all(
  //     news.map(async (item, index) => {
  //       const source = item.id.split('-')[0];
  //       const sentimentIcon = this.getSentimentIcon(item.post_sentiment);
  //       const sentimentTitle = this.getSentimentTitle(item.post_sentiment);

  //       const translatedTitle = language === 'en'
  //         ? item.post_title
  //         : await this.getTranslatedText(item.id, item.post_title, language);

  //       return `
  //   ${index + 1}. ${translatedTitle} ${sentimentIcon} (${sentimentTitle}, ${item.post_sentiment})
  //   🔗 (${item.post_link})
  //   📰 Source: ${source}`;
  //     }),
  //   );

  //   return `📢 Latest Crypto News\n${formattedNews.join('\n')}`;
  // }


  async getHighSentimentNews(n = 5, language: string, title: string): Promise<any> {
    const results = await this.dataRepository.getNewsWithHighSentiment(n, title);

    if (!results || results.length === 0) {
      return language === 'fa'
        ? 'هیچ خبری با احساس مثبت بالا پیدا نشد.'
        : 'No news found with high sentiment.';
    }

    return await this.formatNewsResponse(results, language);
  }


  private async getUserChatHistory(telegramId: string, limit: number = 2): Promise<UserChatLogDto[]> {
    try {
      const chatLogs = await this.dataRepository.getChatHistory(telegramId, limit);
      return chatLogs;
    } catch (error) {
      this.logger.error('Failed to retrieve user chat history:', error);
      return [];
    }
  }

  
  async sendChunkedMessage(bot: TelegramBot, chatId: number | string, content: string, chunkSize = 3500) {
        const lines = content.split('\n\n');
        let chunk = '';
        for (const line of lines) {
          if ((chunk + '\n\n' + line).length > chunkSize) {
            await bot.sendMessage(chatId, chunk, { parse_mode: 'Markdown' });
            chunk = '';
          }
          chunk += '\n\n' + line;
        }
        if (chunk.trim()) {
          await bot.sendMessage(chatId, chunk, { parse_mode: 'Markdown' });
        }
  }

  
  private estimateAiCostIRT(inputText: string, outputText: string) {
          const charsToTokens = (s: string) => Math.ceil((s ? s.length : 0) / 4);
          const inputTokens = charsToTokens(inputText);
          const outputTokens = charsToTokens(outputText);

          const inputCostUSD = (inputTokens / 1_000_000) * 0.15; // $0.15 / 1M tokens
          const outputCostUSD = (outputTokens / 1_000_000) * 0.60; // $0.60 / 1M tokens
          const totalUSD = inputCostUSD + outputCostUSD;

          const conversionRateToIRT = 5_000_000; // keep in sync with your system
          return Math.ceil(totalUSD * conversionRateToIRT);
  }

  // Persian main menu (ReplyKeyboard) — 1st level only
  // Replace your getMainMenuMarkup() with this:
  private getMainMenuMarkup() {
    return {
      reply_markup: {
        keyboard: [
          ['بیت‌کوین (BTC)', 'طلا (XAUUSD)'],
          ['اتریوم (ETH)', 'نزدک ۱۰۰ (US100)'],
          ['دوج‌کوین (DOGE)', 'سولانا (SOL)'],
          ['شکار کوین'],
          ['پشتیبانی گنجول'],
        ],
        resize_keyboard: true,
        one_time_keyboard: false,
        is_persistent: true,
      },
    };
  }
// 👇 مپ کلید کوتاه -> پرامپت کامل (به انگلیسی؛ خروجی فارسی می‌خواد)
private hunterPromptMap: Record<string, string> = {
  memecoin:   'Give me top 5 memecoins in Persian language',
  ai:         'Give me top 5 AI coins in Persian language',
  madeinusa:  'Give me top 5 made-in-USA coins in Persian language',
  volatility: 'Give me top 5 coins by highest volatility in Persian language',
  pc24h:      'Give me top 5 coins by highest 24h percent change in Persian language',
  inter24h:   'Give me top 5 coins by highest interactions_24h in Persian language',
  socdom:     'Give me top 5 coins by highest social_dominance in Persian language',
  galaxy:     'Give me top 5 coins by highest galaxy_score in Persian language',
  altrank:    'Give me top 5 coins by best alt_rank in Persian language',
  sentiment:  'Give me top 5 coins by highest sentiment in Persian language',
};


private async sendCoinHunterMenu(chatId: number) {
  const items = [
    { title: 'میم‌کوین های برتر',                key: 'memecoin'  },
    { title: 'کوین های هوش مصنوعی برتر',         key: 'ai'        },
    { title: 'کوین های برتر ساخت آمریکا',         key: 'madeinusa' },
    { title: 'کوین ها با بیشترین نوسان',         key: 'volatility'},
    { title: 'کوین ها با بیشترین تغییر ۲۴ساعته',             key: 'pc24h'     },
    { title: 'کوین ها با بیشترین تعاملات ۲۴ساعته',           key: 'inter24h'  },
    { title: 'کوین ها با بیشترین سلطه اجتماعی',               key: 'socdom'    },
    { title: 'کوین های منتخب نبضار',               key: 'galaxy'    },
    { title: 'کوین های منتخب بازار',                      key: 'altrank'   },
    { title: 'کوین های دارای احساسات مثبت',        key: 'sentiment' },
  ];

  // one item per row
  const inline_keyboard = items.map(it => ([
    { text: it.title, callback_data: `qm2_${it.key}` }
  ]));

  await this.bot.sendMessage(chatId, 'یکی از شکارها را انتخاب کنید:', {
    reply_markup: { inline_keyboard },
  });
}



private makeQuickTopMap(dict: Record<string, string>) {
  const out: Record<string, string> = {};
  for (const k of Object.keys(dict)) {
    const nk = this.normalizeFa(k.toLowerCase()); // same pipeline as incoming text
    out[nk] = dict[k];
  }
  return out;
}

// Use it to define your top-level map (write the pretty labels here)
private quickTopMap = this.makeQuickTopMap({
  'بیت‌کوین (BTC)': 'BTC',
  'طلا (XAUUSD)': 'XAUUSD',
  'اتریوم (ETH)': 'ETH',
  'نزدک ۱۰۰ (US100)': 'US100',
  'نزدک 100 (US100)': 'US100', // latin digits fallback
  'سولانا (SOL)': 'SOL',
  'دوج‌کوین (DOGE)': 'DOGE',
});

// Minimal child buttons (text = full prompt we want to send to AI)
private async sendQm2Buttons(chatId: number, symbol: string) {
  const A = (label: string) => ({ text: `${symbol} ${label}`, callback_data: `qm2_${symbol} ${label}` });

  await this.bot.sendMessage(
    chatId,
    `یکی از گزینه‌ها را برای ${symbol} انتخاب کنید:`,
    {
      reply_markup: {
        inline_keyboard: [
          [ A('سیگنال ۱۵ دقیقه')],[ A('سیگنال ۱ ساعته') ],
          [ A('سیگنال ۴ ساعته')],[ A('سیگنال ۱ روزه') ],
          [ A('تحلیل MACD')],[ A('تحلیل RSI') ],
          [  A('تحلیل Stochastic') ],
        ],
      },
    }
  );
}



  private normalizeFa(input: string) {
        return (input || '')
          .replace(/\u200c/g, '') // remove ZWNJ
          .replace(/ي/g, 'ی')
          .replace(/ك/g, 'ک')
          .replace(/[ ]+/g, ' ')
          .trim();
  }

  

  async onModuleInit() {
    const me = await this.bot.getMe();
    this.botUsername = me.username;
    this.logger.log(`Bot username: @${this.botUsername}`);
    




    
    

    this.bot.on('message', async (msg) => {

      
      //const raw = msg.text.trim();
      const chatId = msg.chat.id;
      var text = msg.text?.trim().toLowerCase();
      text = this.normalizeFa(text);
      
      const supportLabel = this.normalizeFa('پشتیبانی گنجول');
      if (text === supportLabel) {
        const supportHandle = 'Trade_Ai_bot_support';
        await this.bot.sendMessage(
          chatId,
          `برای ارتباط با پشتیبانی، روی دکمه زیر بزنید یا به @${supportHandle} پیام دهید.`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: 'ارتباط با پشتیبانی', url: `https://t.me/${supportHandle}` }],
              ],
            },
          }
        );
        return; // ✅ stop here, no submenu / no AI
      }

      const hunterLabel = this.normalizeFa('شکار کوین');
      if (text === hunterLabel) {
        await this.sendCoinHunterMenu(chatId);
        return;
      }

      const sym = this.quickTopMap[text];
      if (sym) {
        await this.sendQm2Buttons(chatId, sym);
        return;
      }



      // Extract user info from the Telegram message
      //console.log('start');
      const telegramID = msg.from?.id?.toString();
      const telegramUserName = msg.from?.username || 'Unknown';
      const telegramFirstName = msg.from?.first_name || '';
      const telegramLastName = msg.from?.last_name || '';
      const telegramLanCode = msg.from?.language_code || 'en';

      // If no Telegram ID is found, log an error and skip processing
      if (!telegramID) {
        this.logger.error('Missing Telegram ID in message.');
        return;
      }
      //console.log('telegramID :', telegramID);
      // Save the Telegram ID locally for chat saving
      this.currentTelegramId = telegramID;


      

      //console.log('telegramID :', telegramID);
      // const adminTelegramId = process.env.TELEGRAM_ADMIN_ID; // Replace this with your Telegram ID as a string
      // // Example inside your bot handler, where you want to fetch the active chatId for a telegramID
      // if (telegramID === adminTelegramId) {

      //   const matches = msg.text.match(/send users:"([^"]+)"\s+(\w+)\s+(\w+)/);
      //   if (matches) {
      //     const idsString = matches[1];
      //     const symbol = matches[2];
      //     const language = matches[3];

      //     const telegramIDs = idsString.split(',').map(id => id.trim());
      //     const successList = [];

      //     for (const id of telegramIDs) {
      //       const loginInfo = await this.iamService.findLatestLoginByTelegramId(id);
      //       if (loginInfo?.chatId) {
      //         const analysis = await this.analyzeAndCreateSignals([symbol], language, '');
      //         await this.bot.sendMessage(loginInfo.chatId, analysis);
      //         successList.push(id);

      //         // Log into UserChatLog for each user
      //         const chatLog: UserChatLogDto = {
      //           telegramId: telegramID,
      //           calledFunction: 'analyzeAndCreateSignals',
      //           query: `admin-cmd: send users: ${successList.join(',')} ${symbol} ${language}`,
      //           response: analysis,
      //           queryType: 'admin-broadcast',
      //           newParameters: [],
      //           save_at: Math.floor(Date.now() / 1000),
      //         };
      //         await this.dataRepository.saveUserChatLog(chatLog);

      //       }
      //     }

      //     await this.bot.sendMessage(chatId, `${symbol.toUpperCase()} analysis sent to: ${successList.join(', ')}`);
      //     return;
      //   }
      // }

      // Register or login the user
      const userInsertDto = {
        telegramID,
        mobile: msg.contact ? msg.contact.phone_number : '',
        chatId: chatId,
        telegramUserName,
        telegramFirstName,
        telegramLastName,
        telegramLanCode,
        clientSecret: process.env.NEXT_PUBLIC_APP_SECRET,
        alias: ''
        // Add this to .env if not already present
      };

      try {
        const { token, isNewToken, userId, alias } = await this.iamService.registerOrLogin(userInsertDto);
        this.userId = new Types.ObjectId(userId);
        this.currentUserAlias = alias;
        // this.logger.log(
        //   `User ${isNewToken ? 'registered' : 'logged in'} successfully with userId: ${userId}. Token: ${token}`
        // );        

        this.curId = (await this.balanceService.getCurrencyByName('Toman'))._id;
        this.userBalance = await this.balanceService.getUserBalance(this.userId, this.curId);
        if (isNewToken) {
          try {
            //add trial credit for bot
            await this.balanceService.addTransaction({
              userId: this.userId,
              transactionType: 'achievementsreward',
              amount: 50000,
              currency: this.curId,
              transactionEntityId: "6741f536d877c06a82d7e751", //unique ID for trial - just add once
              balanceAfterTransaction: this.userBalance + 50000,
              timestamp: Math.floor(Date.now() / 1000),
              _id: new Types.ObjectId()
            });
            this.userBalance = await this.balanceService.getUserBalance(this.userId, this.curId);
            await this.bot.sendMessage(
              chatId,
              `🎉 <b>تبریک می‌گوییم!</b> 🎉\n\n✨ شما <b>۵۰,۰۰۰ تومان</b> اعتبار هدیه به عنوان کاربر جدید دریافت کرده‌اید! 🚀\n\n💡 همین حالا شروع کنید و از امکانات فوق‌العاده <b>ربات معامله‌گر هوشمند</b> لذت ببرید!`,
              {
                parse_mode: 'HTML',
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: '✨ از اسپانسر ما دیدن کنید',
                        url: 'https://trade-ai.bot/',
                      },
                    ],
                  ],
                },
              }
            );
          }
          catch (err) {
            this.logger.warn('trial added once', err.message);
          }
        }
        var userCh = await this.iamService.getUser(this.userId);
        
        //console.log('userCh.mobile', userCh.mobile);
        if (!userCh.mobile) {
          //Ask the user to share their contact
          await this.bot.sendMessage(chatId, 'برای دسترسی به سیگنال‌های سیستم معاملاتی و دستیار هوش مصنوعی شماره تماست رو واسم بفرست. کافیه از منوی پایین دگمه ارسال شماره موبایل رو بزنی', {
            reply_markup: {
              keyboard: [
                [
                  {
                    text: '📞 ارسال شماره موبایل',
                    request_contact: true, // Requests the user's contact information
                  },
                ],
              ],
              resize_keyboard: true, // Adjust keyboard size for better display
              one_time_keyboard: true, // Hides the keyboard after interaction
            },
          });
          // await this.bot.sendPhoto(chatId, 'https://yourdomain.com/path-to-image.jpg', {
          //     caption: `برای استفاده از ربات نبضار شماره موبایل خود را به اشتراک بگذارید.\n\n📸 برای اشتراک شماره موبایل مطابق تصویر از دکمه منو استفاده کنید.`,
          //     reply_markup: {
          //       keyboard: [
          //         [
          //           {
          //             text: '📞 اشتراک شماره موبایل',
          //             request_contact: true,
          //           },
          //         ],
          //       ],
          //       resize_keyboard: true,
          //       one_time_keyboard: true,
          //     },
          //   });
          return;
        } 

        //if (msg.contact?.phone_number) {
          //await this.pushKeyboardSilently(chatId, this.getMainMenuMarkup());
        //}

      } catch (error) {
        this.logger.error('Error during user registration/login:', error.message);
        return;
      }

      const adminTelegramIds = process.env.TELEGRAM_ADMIN_IDS?.split(',').map(id => id.trim()) || [];

  //console.log('adminTelegramIds :', adminTelegramIds);
  if (adminTelegramIds.includes(this.currentTelegramId)) {

    let adminChatId = null;
    const adminLogin = await this.iamService.findLatestLoginByTelegramId(this.currentTelegramId);
    if (adminLogin?.chatId) 
      adminChatId=adminLogin.chatId;
  
    // Pattern matching
    let commandMatch = null;

    //console.log('admin text :', text);
    if (text.toLowerCase() === '/adminhelp') {
      const helpMessage = `
    🛠 *Admin Commands Help / راهنمای دستورات ادمین* 🛠
    
    📤 *Broadcast Analysis / ارسال تحلیل برای کاربران*
    \`send users:"12345,67890" BTC en\`
    ➤ Sends BTC analysis in English to listed Telegram IDs  
    ➤ ارسال تحلیل BTC به زبان انگلیسی برای آی‌دی‌های مشخص‌شده
    
    📋 *Get Last N Registered Users / دریافت N کاربر آخر ثبت‌نامی*
    \`get 10 lastusers\`
    ➤ Lists the last 10 registered users  
    ➤ لیست ۱۰ کاربر آخری که ثبت‌نام کرده‌اند
    
    💰 *Get Balance of a User / دریافت موجودی یک کاربر*
    \`get balance 12345\`
    ➤ Shows current balance for user 12345  
    ➤ نمایش موجودی فعلی برای کاربر با آی‌دی 12345
    
    📅 *Get N Expired Users / دریافت N کاربر منقضی‌شده*
    \`get 5 expired\`
    ➤ Lists 5 users whose balance is expired  
    ➤ لیست ۵ کاربر که اشتراک آنها منقضی شده است
    
    🔒 *Make User Expired / منقضی کردن یک کاربر*
    \`make expired 12345\`
    ➤ Sets balance of user 12345 to 100 (mark as expired)  
    ➤ تنظیم موجودی کاربر به ۱۰۰ و منقضی کردن وی
    
    💬 *Get Last N Chats of a User / دریافت N پیام آخر کاربر*
    \`get 5 chat 12345\`
    ➤ Shows last 5 chat messages from user 12345  
    ➤ نمایش ۵ پیام آخری کاربر مشخص‌شده
    
    🗣 *Get N Users with At Least M Chats / دریافت N کاربر با حداقل M پیام*
    \`get 5 users with min 10 chat\`
    ➤ Lists 5 users who have sent at least 10 messages  
    ➤ لیست ۵ کاربری که حداقل ۱۰ پیام ارسال کرده‌اند
    
    💵 *Get Last N Users Who Made Deposit / دریافت N کاربر اخیر که واریز داشته‌اند*
    \`get 10 user deposit\`
    ➤ Returns last 10 users who made deposit-type transactions  
    ➤ لیست ۱۰ کاربر آخری که تراکنش واریز داشته‌اند
    
    📨 *Send Custom Message / ارسال پیام سفارشی*
    \`send 'Hello my friend' 12345\`
    ➤ Sends message to user with Telegram ID 12345  
    ➤ ارسال پیام سفارشی به کاربر با آی‌دی مشخص‌شده
    
    ℹ️ *Show Help / نمایش راهنما*
    \`/adminhelp\`
    ➤ Shows this help message  
    ➤ نمایش این پیام راهنما
      `;
    
      await this.bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
      return;
    }
    
    
    
  
    // Command cases
    if (commandMatch = text.match(/^send users:"([^"]+)"\s+(\w+)\s+(\w+)/)) {
      const idsString = commandMatch[1];
      const symbol = commandMatch[2];
      const language = commandMatch[3];
    
      const telegramIDs = idsString.split(',').map(id => id.trim());
      const successList: string[] = [];
      const analysis = await this.analyzeAndCreateSignals([symbol], language,'1h', '');
    
      const messages: string[] = [];
    
      for (const id of telegramIDs) {
        const loginInfo = await this.iamService.findLatestLoginByTelegramId(id);
        if (loginInfo?.chatId) {
          await this.bot.sendMessage(loginInfo.chatId, analysis, this.getMainMenuMarkup());
          successList.push(id);
    
          const chatLog: UserChatLogDto = {
            telegramId: telegramID,
            calledFunction: 'analyzeAndCreateSignals',
            query: `admin-cmd: send users: ${id} ${symbol} ${language}`,
            response: analysis,
            queryType: 'admin-broadcast',
            newParameters: [],
            save_at: Math.floor(Date.now() / 1000),
          };
          await this.dataRepository.saveUserChatLog(chatLog);
    
          messages.push(`✅ Sent to ${id}`);
        } else {
          messages.push(`❌ Failed: No chatId for ${id}`);
        }
      }
    
      const summary = `📤 Broadcast Result for ${symbol.toUpperCase()}:\n\n${messages.join('\n')}`;
      await this.sendChunkedMessage(this.bot, adminChatId, summary);
      return;
    } else if (commandMatch = text.match(/^get (\d+) lastusers/)) {
      const n = parseInt(commandMatch[1]);
      console.log("commandMatch", n );
      // Handle get n lastUsers
      const result = await this.handleGetLastUsers(n);
      const header = '📋 *Last Users:*';
      const fullText = [header, ...result].join('\n\n');
      await this.sendChunkedMessage(this.bot, adminChatId, fullText);
      return;
  
    } else if (commandMatch = text.match(/^get balance (\d+)/)) {
      const telegramId = commandMatch[1];
      // Handle get balance
      var result = await this.handleGetBalance(telegramId);
      await this.sendChunkedMessage(this.bot, adminChatId, result);
      return;
  
    } else if (commandMatch = text.match(/^get (\d+) expired/)) {
      const n = parseInt(commandMatch[1]);
      // Handle get n expired
      const expires = await this.handleGetExpiredUsers(n);
      console.log("expires :", expires );
      if (!expires.length) {
        await this.bot.sendMessage(adminChatId, `No expired users found.`, this.getMainMenuMarkup() );
        return;
      }
    
      const header = '📋 *Expired Users:*';
      const fullText = [header, ...expires].join('\n\n');
      await this.sendChunkedMessage(this.bot, adminChatId, fullText);
      return;
  
    } else if (commandMatch = text.match(/^make expired (\d+)/)) {
      const telegramId = commandMatch[1];
      // Handle make expired
      const loginInfo = await this.iamService.findLatestLoginByTelegramId(telegramId);
      const result = await this.handleMakeExpired(loginInfo.chatId, telegramId);
      if (result) {
        await this.bot.sendMessage(adminChatId, `User ${telegramId} marked as expired.`, this.getMainMenuMarkup());
      } else {
        await this.bot.sendMessage(adminChatId, `Failed to mark ${telegramId} as expired.`, this.getMainMenuMarkup());
      }
      return;
  
    } else if (commandMatch = text.match(/^get (\d+) chat (\d+)/)) {
      const n = parseInt(commandMatch[1]);
      const telegramId = commandMatch[2];
      // Handle get n chat for a user
      const result = await this.handleGetChatLogs(msg.chat.id, telegramId, n);
      const header = '📋 *User Chats:*';
      const fullText = [header, ...result].join('\n\n');
      await this.sendChunkedMessage(this.bot, adminChatId, fullText);
      return;
  
    } else if (commandMatch = text.match(/^get (\d+) users with min (\d+) chat/)) {
      const minchat = parseInt(commandMatch[2]);
      const limit = parseInt(commandMatch[1]);
      // get limit user that has minimum minchat rows of chat
      const result = await this.handleGetUserMChats(minchat, limit);
      const header = '📋 *Result Users:*';
      const fullText = [header, ...result].join('\n\n');
      await this.sendChunkedMessage(this.bot, adminChatId, fullText);
      return;
  
    } else if (commandMatch = text.match(/^get (\d+) user deposit/)) {
      const n = parseInt(commandMatch[1]);
      // Handle get n user deposit
      const result = await this.handleGetUserDeposits(n);
      const header = '📋 *Result Users:*';
      const fullText = [header, ...result].join('\n\n');
      await this.sendChunkedMessage(this.bot, adminChatId, fullText);
      return;
  
    }
    else if (commandMatch = text.match(/^send\s+'([^']+)'\s+(\d+)/)) {
      const message = commandMatch[1];
      const telegramId = commandMatch[2];
    
      const loginInfo = await this.iamService.findLatestLoginByTelegramId(telegramId);
    
      if (loginInfo?.chatId) {
        await this.bot.sendMessage(loginInfo.chatId, message, this.getMainMenuMarkup());
    
        // Save to user chat log
        const chatLog: UserChatLogDto = {
          telegramId: telegramID,
          calledFunction: 'sendCustomMessage',
          query: `admin-cmd: send '${message}' ${telegramId}`,
          response: message,
          queryType: 'admin-send-msg',
          newParameters: [],
          save_at: Math.floor(Date.now() / 1000),
        };
        await this.dataRepository.saveUserChatLog(chatLog);
    
        await this.bot.sendMessage(adminChatId, `✅ Message sent to ${telegramId}`, this.getMainMenuMarkup());
      } else {
        await this.bot.sendMessage(adminChatId, `❌ User ${telegramId} not found or no active chatId.`, this.getMainMenuMarkup());
      }
      return;
    }    
    //  else {
    //   await this.bot.sendMessage(adminChatId, 'Invalid admin command.');
    //   return;
    // }

  }

  
      


      // General message handling
      if (msg.text) {
        //this.logger.log('Received text message:', msg.text);
        //check balance 
        // Get the last ask for this user (if any)
        // Handle /help command

        if (this.userBalance < 10000) {
          await this.bot.sendMessage(chatId, 'اعتبار شما رو به پایان است٫ لطفا اعتبار خود را شارژ کنید.', this.getMainMenuMarkup());
        }

        if (this.userBalance < 1000) {
          return;
        }

        //   //help text handler
        // if (text === '/help') {
        //   await this.sendMenu(chatId);
        //   return;
        // }
        
        

              if (text && (text === '/menu')) {
                await this.bot.sendMessage(
                chatId,
                '✅ منوی سریع به‌روزرسانی شد. از گزینه‌های زیر استفاده کنید:',
                this.getMainMenuMarkup()
              );
                return;
              }

              // 2) /help button (reply-keyboard label or slash command)
              if (text === 'ℹ️ /help' || text === '/help') {
                await this.sendMenu(chatId);
                return;
              }

              // 3) Goto support button
              if (text === '🆘 goto support' || text === 'goto support' || text === 'support') {
                const supportHandle = //process.env.TELEGRAM_SUPPORT_HANDLE || 
                'Ganjool';
                await this.bot.sendMessage(
                  chatId,
                  `برای ارتباط با پشتیبانی، روی دکمه زیر بزنید یا به @${supportHandle} پیام دهید.`,
                  {
                    reply_markup: {
                      inline_keyboard: [
                        [{ text: 'ارتباط با پشتیبانی', url: `https://t.me/${supportHandle}` }],
                      ],
                    },
                  }
                );
                return;
              }

        // Retrieve chat history
        const chatHistory = await this.getUserChatHistory(telegramID, 1); // Retrieve last 5 messages

        const formattedChatHistory = chatHistory.map(log => {
          // Truncate query and response if necessary
          const truncatedQuery = truncateText(log.query, 200);
          let truncatedResponse = '';
          if (log.response)
            truncatedResponse = truncateText(log.response, 100);

          return `ask: ${truncatedQuery} -> response: ${truncatedResponse}`;
        }).join('\n');

        const systemPrompt = this.constructSystemPrompt(this.currentUserAlias);
        // Create a prompt with only the last and current asks
        const prompt = ` {${systemPrompt}}
    The user asked this previously: "${formattedChatHistory || 'None'}".
    'Note: The chat history may has been truncated for brevity.'
    The user is now asking: "${text}".
    Based on this, please infer the user's intent and provide a 
    relevant response in detected user's language.
  `;

        // let last;
        //       if (this.currentUserAlias) {
        //         last = `${prompt} 
        // The user alias is "${this.currentUserAlias}" please always call them by their alias .
        // `;
        //       }
        //       else { last = `${prompt}`; }



        let responseText = await this.getChatGptResponse(prompt, chatId);
        let totalCostInIRT;
        if (responseText.responseText) {
          // Calculate token counts for prompt and response
          const inputTokens = Math.ceil(prompt.length / 4); // Approx 4 chars per token
          const outputTokens = Math.ceil(responseText.responseText.length / 4);

          // Calculate costs in USD
          const inputCost = (inputTokens / 1_000_000) * 0.15; // $0.15 per 1M tokens
          const outputCost = (outputTokens / 1_000_000) * 0.60; // $0.60 per 1M tokens

          const totalCost = inputCost + outputCost; // Total cost in USD

          // Convert to IRT
          const conversionRateToIRT = 5_000_000; // Example conversion rate
          totalCostInIRT = Math.ceil(totalCost * conversionRateToIRT);
        } else {
          responseText.responseArray.forEach(element => {
            // Calculate token counts for prompt and response
            const inputTokens = Math.ceil(prompt.length / 4); // Approx 4 chars per token
            const outputTokens = Math.ceil(element.length / 4);

            // Calculate costs in USD
            const inputCost = (inputTokens / 1_000_000) * 0.15; // $0.15 per 1M tokens
            const outputCost = (outputTokens / 1_000_000) * 0.60; // $0.60 per 1M tokens

            const totalCost = inputCost + outputCost; // Total cost in USD

            // Convert to IRT
            const conversionRateToIRT = 5_000_000; // Example conversion rate
            totalCostInIRT = Math.ceil(totalCost * conversionRateToIRT);
          });
        }
        // Check user balance
        if (this.userBalance < totalCostInIRT) {
          await this.bot.sendMessage(chatId, 'Insufficient balance for this request. Please recharge to continue.', this.getMainMenuMarkup());
          return;
        }

        //Deduct the cost
        const remainingBalance = this.userBalance - totalCostInIRT;
        await this.balanceService.addTransaction({
          userId: this.userId,
          transactionType: 'payment',
          amount: -totalCostInIRT,
          currency: this.curId,
          transactionEntityId: new Types.ObjectId().toString(), // Generate a unique ID for this transaction
          balanceAfterTransaction: remainingBalance,
          timestamp: Math.floor(Date.now() / 1000),
          _id: new Types.ObjectId()
        });
        //const timestamp1 = new Date(effectiveDate).getTime() / 1000;

        //reduce balance by response lenth 
        // Save user chat log
        const chatLog: UserChatLogDto = {
          telegramId: this.currentTelegramId,
          calledFunction: responseText.calledFunc,
          query: text,
          response: Array.isArray(responseText.responseArray) ? responseText.responseArray.join(' ') : responseText.responseText,
          queryType: responseText.queryType,
          newParameters: responseText.newParameters || [],
          save_at: Math.floor(Date.now() / 1000),
        };

        try {
          await this.dataRepository.saveUserChatLog(chatLog);
          this.logger.log('User chat log saved successfully.');
        } catch (error) {
          this.logger.error('Failed to save user chat log:', error);
        }


        if (responseText.advertingMsgId != '')
          await this.bot.deleteMessage(chatId, responseText.advertingMsgId.toString());

        const newsFunctions = new Set(['getHighSentimentNewsByTitle', 'searchNewsByTitle'
          , 'getLatestNewsBySymbol', 'getTopNewsByInteractionsAndTitle', 'getLatestNewsByTitle']);
        if (newsFunctions.has(responseText.calledFunc)) {
          if (Array.isArray(responseText.responseArray)) {
            
            let first = true;
            for (const newsItem of responseText.responseArray) {
              const extra = first ? this.getMainMenuMarkup() : {};
              await this.bot.sendMessage(chatId, newsItem, extra).catch((err) => {
                
                  if (err.code === 'ETELEGRAM' && err.message.includes('message is too long')) {
                    this.logger.error('Message too long, splitting and sending in parts.');

                    const maxLength = 1000; // Telegram's max message length
                    const messageParts = splitTelegramMessage(newsItem, maxLength);

                    // Send each part sequentially
                    messageParts.reduce((promise, part) => {
                      return promise.then(() => this.bot.sendMessage(chatId, part));
                    }, Promise.resolve()).catch((err) => {
                      this.logger.error('Failed to send split messages', err);
                    });
                  } else {
                    this.logger.error('Failed to send message', err);
                  }
              });
              first = false;
            }
            // // Iterate through each news item
            // responseText.responseArray.forEach((newsItem) => {
            //   this.bot.sendMessage(chatId, newsItem)
            //     .catch((err) => {
            //       if (err.code === 'ETELEGRAM' && err.message.includes('message is too long')) {
            //         this.logger.error('Message too long, splitting and sending in parts.');

            //         const maxLength = 1000; // Telegram's max message length
            //         const messageParts = splitTelegramMessage(newsItem, maxLength);

            //         // Send each part sequentially
            //         messageParts.reduce((promise, part) => {
            //           return promise.then(() => this.bot.sendMessage(chatId, part));
            //         }, Promise.resolve()).catch((err) => {
            //           this.logger.error('Failed to send split messages', err);
            //         });
            //       } else {
            //         this.logger.error('Failed to send message', err);
            //       }
            //     });
            // });
          } else {
            this.logger.error('responseText.responseText is not an array of news items.');
          }

        }
        else {

          this.bot.sendMessage(chatId, responseText.responseText, this.getMainMenuMarkup())
            .catch((err) => {
              if (err.code === 'ETELEGRAM' && err.message.includes('message is too long')) {
                this.logger.error('Message too long, splitting and sending in parts.');

                const maxLength = 1000; // Telegram's max message length
                const messageParts = splitTelegramMessage(responseText.responseText, maxLength);

                // Send each part sequentially
                messageParts.reduce((promise, part) => {
                  
                  return promise.then(() => this.bot.sendMessage(chatId, part));
                }, Promise.resolve()).catch((err) => {
                  this.logger.error('Failed to send split messages', err);
                });
              } else {
                this.logger.error('Failed to send message', err);
              }
            });

        }


        // this.bot.sendMessage(chatId, responseText.responseText)
        //   .catch((err) => {
        //     if (err.code === 'ETELEGRAM' && err.message.includes('message is too long')) {
        //       this.logger.error('Message too long, splitting and sending in parts.');

        //       // Split the response text into chunks of 1000 characters
        //       const maxLength = 1000;
        //       const messageParts = responseText.responseText.match(new RegExp(`.{1,${maxLength}}`, 'g'));

        //       if (messageParts) {
        //         // Send each part sequentially
        //         messageParts.reduce((promise, part) => {
        //           return promise.then(() => this.bot.sendMessage(chatId, part));
        //         }, Promise.resolve()).catch((err) => {
        //           this.logger.error('Failed to send split messages', err);
        //         });
        //       }
        //     } else {
        //       this.logger.error('Failed to send message', err);
        //     }
        //   });
      }
    });

    this.bot.on('callback_query', async (callbackQuery) => {
      console.log('Callback query received:', callbackQuery.data);
      const msg = callbackQuery.message;
      const data = callbackQuery.data;
      const from = callbackQuery.from;
      const chatId = msg.chat.id;
      console.log('Before registering user from callback_query ', this.currentTelegramId);
      //if (!this.currentTelegramId) {
        console.log('Registering user from callback_query ', this.currentTelegramId);
        this.currentTelegramId = from.id?.toString();
        const telegramUserName = from.username || 'Unknown';
        const telegramFirstName = from.first_name || '';
        const telegramLastName = from.last_name || '';
        const telegramLanCode = from.language_code || 'en';



        // Register or login the user
        const userInsertDto = {
          telegramID: this.currentTelegramId,
          mobile: msg.contact ? msg.contact.phone_number : '',
          chatId: chatId,
          telegramUserName,
          telegramFirstName,
          telegramLastName,
          telegramLanCode,
          clientSecret: process.env.NEXT_PUBLIC_APP_SECRET,
          alias: ''
          // Add this to .env if not already present
        };


        try {
          const { token, isNewToken, userId, alias } = await this.iamService.registerOrLogin(userInsertDto);
          this.userId = new Types.ObjectId(userId);
          this.currentUserAlias = alias;
          // this.logger.log(
          //   `User ${isNewToken ? 'registered' : 'logged in'} successfully with userId: ${userId}. Token: ${token}`
          // );        

          this.curId = (await this.balanceService.getCurrencyByName('Toman'))._id;
          this.userBalance = await this.balanceService.getUserBalance(this.userId, this.curId);
          
          // Check user balance
          if (this.userBalance < 10000) {
            await this.bot.sendMessage(chatId, 'اعتبار شما رو به پایان است٫ لطفا اعتبار خود را شارژ کنید.', this.getMainMenuMarkup());
          }

          if (this.userBalance < 1000) {
            return;
          }

        } catch (error) {
          this.logger.error('Error during user registration/login:', error.message);
          return;
        }

      
      // Extract user info from the Telegram message
      //console.log('start');
      //
      

      // Handle category selection
      if (data.startsWith('category_')) {
        console.log('Category selected:', data);
        const selectedCategory = data.split('_')[1];
        const prompts = this.categories[selectedCategory];

        // Create inline keyboard for prompts in the selected category
        const promptKeyboard = prompts.map((prompt, index) => [
          {
            text: prompt.length > 150 ? `${prompt.slice(0, 147)}...` : prompt,
            callback_data: `prompt_${index}_${selectedCategory}`,
          },
        ]);

        // Add "برگشت به طبقه بندی ها" button at the bottom
        promptKeyboard.push([
          {
            text: 'برگشت به طبقه بندی ها',
            callback_data: 'back_to_categories',
          },
        ]);

        await this.bot.sendMessage(chatId, `دسته‌بندی: ${selectedCategory}`, {
          reply_markup: {
            inline_keyboard: promptKeyboard,
          },
        });
      }

      // Handle prompt selection
      else if (data.startsWith('prompt_') || data.startsWith('qm2_')) {
        console.log('Prompt selected:', data);
        const parts = data.split('_');
        // parts[0] is "prompt" or "qm2"
        const promptIndex = parts[1];         // for qm2_: this is the FULL PROMPT; for prompt_: this is the index
        const category = parts[2];            // only exists for legacy prompt_

        let selectedPrompt: string | undefined = undefined;

        if (category && this.categories?.[category]) {
          const i = parseInt(promptIndex, 10);
          selectedPrompt = this.categories[category][i];
        }

        // 👇 اضافه کن: اگر qm2_ بود، از مپ کوتاه بخون
      if (!selectedPrompt && data.startsWith('qm2_')) {
        selectedPrompt = this.hunterPromptMap[promptIndex] || promptIndex;
      }

        if (!selectedPrompt) {
        selectedPrompt = promptIndex; 
      }
        // Fetch user chat history
        const chatHistory = await this.getUserChatHistory(this.currentTelegramId, 1); // Retrieve last 3 messages
        const formattedChatHistory = chatHistory.map(log => {
          const truncatedQuery = truncateText(log.query, 200);
          const truncatedResponse = log.response ? truncateText(log.response, 100) : '';
          return `ask: ${truncatedQuery} -> response: ${truncatedResponse}`;
        }).join('\n');

        // Create a prompt with chat history and the selected prompt
        const promptWithHistory = `
          The user asked this previously: "${formattedChatHistory || 'None'}".
          'Note: The chat history may have been truncated for brevity.'
          The user is now asking: "${selectedPrompt}".
          Based on this, please infer the user's intent and provide a relevant response in the detected user's language.
        `;

        // Add user alias to the prompt if available
        let finalPrompt = promptWithHistory;
        if (this.currentUserAlias) {
          finalPrompt = `${promptWithHistory} 
          The user alias is "${this.currentUserAlias}". Please always call them by their alias.
          `;
        }

        // Get ChatGPT response
        const chatGptResponse = await this.getChatGptResponse(finalPrompt, chatId);

        // Remove advertising message if it exists
        if (chatGptResponse.advertingMsgId) {
          await this.bot.deleteMessage(chatId, chatGptResponse.advertingMsgId.toString());
        }

        let totalCostInIRT;
        if (chatGptResponse.responseText) {
          // Calculate token counts for prompt and response
          const inputTokens = Math.ceil(finalPrompt.length / 4); // Approx 4 chars per token
          const outputTokens = Math.ceil(chatGptResponse.responseText.length / 4);

          // Calculate costs in USD
          const inputCost = (inputTokens / 1_000_000) * 0.15; // $0.15 per 1M tokens
          const outputCost = (outputTokens / 1_000_000) * 0.60; // $0.60 per 1M tokens

          const totalCost = inputCost + outputCost; // Total cost in USD

          // Convert to IRT
          const conversionRateToIRT = 5_000_000; // Example conversion rate
          totalCostInIRT = Math.ceil(totalCost * conversionRateToIRT);
        } else {
          chatGptResponse.responseArray.forEach(element => {
            // Calculate token counts for prompt and response
            const inputTokens = Math.ceil(finalPrompt.length / 4); // Approx 4 chars per token
            const outputTokens = Math.ceil(element.length / 4);

            // Calculate costs in USD
            const inputCost = (inputTokens / 1_000_000) * 0.15; // $0.15 per 1M tokens
            const outputCost = (outputTokens / 1_000_000) * 0.60; // $0.60 per 1M tokens

            const totalCost = inputCost + outputCost; // Total cost in USD

            // Convert to IRT
            const conversionRateToIRT = 5_000_000; // Example conversion rate
            totalCostInIRT = Math.ceil(totalCost * conversionRateToIRT);
          });
        }

        // Check user balance
        if (this.userBalance < totalCostInIRT) {
          await this.bot.sendMessage(chatId, 'موجودی شما برای این درخواست کافی نیست. لطفاً حساب خود را شارژ کنید.', this.getMainMenuMarkup());
          return;
        }

        // Deduct the cost
        const remainingBalance = this.userBalance - totalCostInIRT;
        await this.balanceService.addTransaction({
          userId: this.userId,
          transactionType: 'payment',
          amount: -totalCostInIRT,
          currency: this.curId,
          transactionEntityId: new Types.ObjectId().toString(), // Generate a unique ID for this transaction
          balanceAfterTransaction: remainingBalance,
          timestamp: Math.floor(Date.now() / 1000),
          _id: new Types.ObjectId()
        });

        // Update user balance
        this.userBalance = remainingBalance;

        // Save user chat log
        const chatLog: UserChatLogDto = {
          telegramId: this.currentTelegramId,
          calledFunction: chatGptResponse.calledFunc,
          query: selectedPrompt,
          response: Array.isArray(chatGptResponse.responseArray) ? chatGptResponse.responseArray.join(' ') : chatGptResponse.responseText,
          queryType: chatGptResponse.queryType,
          newParameters: chatGptResponse.newParameters || [],
          save_at: Math.floor(Date.now() / 1000),
        };

        try {
          await this.dataRepository.saveUserChatLog(chatLog);
          this.logger.log('User chat log saved successfully.');
        } catch (error) {
          this.logger.error('Failed to save user chat log:', error);
        }

        const newsFunctions = new Set(['getHighSentimentNewsByTitle', 'searchNewsByTitle'
          , 'getLatestNewsBySymbol', 'getTopNewsByInteractionsAndTitle', 'getLatestNewsByTitle']);
        if (newsFunctions.has(chatGptResponse.calledFunc)) {
          if (Array.isArray(chatGptResponse.responseArray)) {
            // Iterate through each news item
            chatGptResponse.responseArray.forEach((newsItem) => {
              this.bot.sendMessage(chatId, newsItem)
                .catch((err) => {
                  if (err.code === 'ETELEGRAM' && err.message.includes('message is too long')) {
                    this.logger.error('Message too long, splitting and sending in parts.');

                    const maxLength = 1000; // Telegram's max message length
                    const messageParts = splitTelegramMessage(newsItem, maxLength);

                    // Send each part sequentially
                    messageParts.reduce((promise, part) => {
                      return promise.then(() => this.bot.sendMessage(chatId, part));
                    }, Promise.resolve()).catch((err) => {
                      this.logger.error('Failed to send split messages', err);
                    });
                  } else {
                    this.logger.error('Failed to send message', err);
                  }
                });
            });
          } else {
            this.logger.error('responseText.responseText is not an array of news items.');
          }

        }
        else {

          this.bot.sendMessage(chatId, chatGptResponse.responseText)
            .catch((err) => {
              if (err.code === 'ETELEGRAM' && err.message.includes('message is too long')) {
                this.logger.error('Message too long, splitting and sending in parts.');

                const maxLength = 1000; // Telegram's max message length
                const messageParts = splitTelegramMessage(chatGptResponse.responseText, maxLength);

                // Send each part sequentially
                messageParts.reduce((promise, part) => {
                  return promise.then(() => this.bot.sendMessage(chatId, part));
                }, Promise.resolve()).catch((err) => {
                  this.logger.error('Failed to send split messages', err);
                });
              } else {
                this.logger.error('Failed to send message', err);
              }
            });

        }

        const allowedFunctions = new Set(["getUserAlias", "setUserAlias", "getUserBalance"]);
        if (!allowedFunctions.has(chatGptResponse.calledFunc) && data.startsWith('prompt_')) {
          await this.sendChildMenu(chatId, category);
        }

      }

      // Handle "برگشت به طبقه بندی ها" button
      else if (data === 'back_to_categories') {
        // Create inline keyboard for categories
        const inlineKeyboard = Object.keys(this.categories).map((category) => [
          {
            text: category,
            callback_data: `category_${category}`,
          },
        ]);

        await this.bot.sendMessage(chatId, 'لطفاً یک دسته‌بندی را انتخاب کنید:', {
          reply_markup: {
            inline_keyboard: inlineKeyboard,
          },
        });
      }
    //}
  });


    // Callback query handler
    // this.bot.on('callback_query', async (callbackQuery) => {
    //   const chatId = callbackQuery.message.chat.id;
    //   const data = callbackQuery.data;

    //   if (data.startsWith('prompt_')) {
    //     const promptIndex = parseInt(data.split('_')[1], 10);
    //     const selectedPrompt = this.prompts[promptIndex];

    //     await this.bot.sendMessage(chatId, `پرسش انتخابی شما: ${selectedPrompt}`);

    //     const chatGptResponse = await this.getChatGptResponse(selectedPrompt, chatId);
    //     this.bot.sendMessage(chatId, chatGptResponse.responseText).catch((err) => {
    //       this.logger.error('Failed to send message', err);
    //     });
    //   }
    // });
  }

  private async sendChildMenu(chatId: number, category: string) {
    const prompts = this.categories[category];

    // Create inline keyboard for prompts in the selected category
    const promptKeyboard = prompts.map((prompt, index) => [
      {
        text: prompt.length > 150 ? `${prompt.slice(0, 147)}...` : prompt,
        callback_data: `prompt_${index}_${category}`,
      },
    ]);

    // Add "برگشت به طبقه بندی ها" button at the bottom
    promptKeyboard.push([
      {
        text: 'برگشت به طبقه بندی ها',
        callback_data: 'back_to_categories',
      },
    ]);

    await this.bot.sendMessage(chatId, `دسته‌بندی: ${category}`, {
      reply_markup: {
        inline_keyboard: promptKeyboard,
      },
    });
  }

  private async sendMenu(chatId: number) {
    // Create inline keyboard for categories
    const inlineKeyboard = Object.keys(this.categories).map((category) => [
      {
        text: category,
        callback_data: `category_${category}`,
      },
    ]);

    await this.bot.sendMessage(chatId, 'لطفاً یک دسته‌بندی را انتخاب کنید:', {
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
    });
  }
}


function splitTelegramMessage(message: string, maxLength: number): string[] {
  const parts: string[] = [];
  let remainingMessage = message;

  while (remainingMessage.length > 0) {
    if (remainingMessage.length <= maxLength) {
      parts.push(remainingMessage);
      break;
    }

    // Find the best split point (prefer newlines or logical breaks)
    const splitIndex = remainingMessage.lastIndexOf('\n', maxLength);
    const index = splitIndex > 0 ? splitIndex : maxLength;

    parts.push(remainingMessage.slice(0, index).trim());
    remainingMessage = remainingMessage.slice(index).trim();
  }

  return parts;
}