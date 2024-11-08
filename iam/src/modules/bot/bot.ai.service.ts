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

  private conversationHistory: { role: string; content: string; name?: string }[] = [];

  private prompts = [
    // Existing prompts...
  ];

  constructor(
    private readonly productService: ProductService,
    private readonly dataRepository: DataRepository // Inject DataRepository
  ) {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
  }

  
  async getChatGptResponse(prompt: string): Promise<string> {

    const today = new Date().toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
  });
  
  // Include the current date in the initial message
  const updatedPrompt = `Today's date is ${today}. ${prompt}`;
    this.conversationHistory.push({ role: 'user', content: updatedPrompt });
  
    const functions = [
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
          },
          required: ['timestamp'],
        },
      },
      {
        name: 'getCryptoPrice',
        description: 'Fetches the latest price for a specific cryptocurrency symbol.',
        parameters: {
          type: 'object',
          properties: {
            symbol: {
              type: 'string',
              description: 'The symbol of the cryptocurrency, e.g., BTCUSDT.',
            },
          },
          required: ['symbol'],
        },
      },
      {
        name: 'getCryptoPrices',
        description: 'Fetches the latest prices for multiple cryptocurrency symbols.',
        parameters: {
          type: 'object',
          properties: {
            symbols: {
              type: 'array',
              items: { type: 'string' },
              description: 'The list of cryptocurrency symbols, e.g., ["BTCUSDT", "ETHUSDT"].',
            },
          },
          required: ['symbols'],
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
          },
          required: ['limit'],
        },
      },
    ];
  
    try {
      const stream = await this.openai.chat.completions.create({
        messages: [
          { role: "system", content: "You are an investment advisor specializing in Forex and crypto markets." },
          { role: "user", content: updatedPrompt }
        ],
        model: "gpt-4o-mini-2024-07-18",
        functions: functions,
      });
  
      const message = stream.choices[0].message;
  
      // Check if ChatGPT suggested a function call
      if (message.function_call) {
        // const functionName = message.function_call.name;
        // const parameters = JSON.parse(message.function_call.arguments || '{}');
  
        // // Log the parsed parameters for debugging
        
  
        // // Check if the function exists on the service
        // if (typeof this[functionName] === 'function') {

        //    // Convert the date string to a Unix timestamp
  
        //    //const timestamp =  Math.floor(Date.now() / 1000);
        //   const timestamp = new Date(parameters.timestamp).getTime() / 1000;
        //   const functionResponse = await this[functionName](timestamp);
        //   this.conversationHistory.push({ role: 'function', name: functionName, content: functionResponse });
        //   return functionResponse;

        
        // } else {
        //   this.logger.error(`Function ${functionName} is not defined.`);
        //   return 'Requested function is not available.';
        // }

        const functionName = message.function_call.name;
      const parameters = JSON.parse(message.function_call.arguments || '{}');

      this.logger.log(`Parsed function call: ${functionName} with parameters: ${JSON.stringify(parameters)}`);

      if (functionName === 'getFngForDate' && parameters.timestamp) {
        const tamp = new Date(parameters.timestamp).getTime() / 1000;
        const functionResponse = await this.getFngForDate(tamp);
        this.conversationHistory.push({ role: 'function', name: functionName, content: functionResponse });
        return functionResponse;
      }

      if (functionName === 'getCryptoPrice' && parameters.symbol) {
        const functionResponse = await this.getCryptoPrice(parameters.symbol);
        this.conversationHistory.push({ role: 'function', name: functionName, content: functionResponse });
        return functionResponse;
      }

      if (functionName === 'getTopCryptosByPrice' && parameters.limit) {
        const functionResponse = await this.getTopCryptosByPrice(parameters.limit);
        this.conversationHistory.push({ role: 'function', name: functionName, content: functionResponse });
        return functionResponse;
      }

      if (functionName === 'getCryptoPrices' && parameters.symbols) {
        const functionResponse = await this.getCryptoPrices(parameters.symbols);
        this.conversationHistory.push({ role: 'function', name: functionName, content: functionResponse });
        return functionResponse;
      }


      } else {
        const responseMessage = message.content?.trim();
  
        if (responseMessage) {
          this.conversationHistory.push({ role: 'assistant', content: responseMessage });
          this.logger.log(`Response from ChatGPT: ${responseMessage}`);
          return responseMessage;
        } else {
          this.logger.error('Received an empty response from ChatGPT', { stream });
          return 'Sorry, I didn’t receive a valid response from ChatGPT. Please try again.';
        }
      }
    } catch (error) {
      console.error('Error fetching response from ChatGPT:', error);
      return 'Error fetching response from ChatGPT.';
    }
  }
  
  // Fetch prices for multiple symbols
async getCryptoPrices(symbols: string[]): Promise<string> {
  if (!symbols || symbols.length === 0) {
    return "Please provide at least one cryptocurrency symbol.";
  }

  console.log("symbols -- ", symbols);
  // Fetch the latest price for each symbol
  const prices = await Promise.all(
    symbols.map(async (symbol) => {
      const latestPrice = await this.dataRepository.getLatestPriceBySymbol(symbol);
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
  
  async getCryptoPrice(symbol: string): Promise<string> {
    // Map common names to symbols
    const symbolMapping: { [key: string]: string } = {
      bitcoin: 'BTCUSDT',
      ethereum: 'ETHUSDT',
      ripple: 'XRPUSDT',
      binancecoin: 'BNBUSDT',
      cardano: 'ADAUSDT',
      solana: 'SOLUSDT',
      dogecoin: 'DOGEUSDT',
      polkadot: 'DOTUSDT',
      tron: 'TRXUSDT',
      shiba: 'SHIBUSDT',
      litecoin: 'LTCUSDT',
      uniswap: 'UNIUSDT',
      chainlink: 'LINKUSDT',
      toncoin: 'TONUSDT',
      floki: 'FLOKIUSDT',
      pepe: 'PEPEUSDT',
      cosmos: 'ATOMUSDT',
      dai: 'DAIUSDT',
      wrappedbitcoin: 'WBTCUSDT',
      usdcoin: 'USDC',
      //1mbabydoge: '1MBABYDOGEUSDT'
      // Add more mappings as needed based on other entries in your collection
    };
    const mappedSymbol = symbolMapping[symbol.toLowerCase()] || symbol;

    const priceData = await this.dataRepository.getLatestPriceBySymbol(mappedSymbol);
    return priceData ? `The latest price of ${mappedSymbol} is ${priceData.price} USDT` : `No data found for symbol ${symbol}`;
  }

  async getTopCryptosByPrice(limit: number): Promise<string> {
    const topCryptos = await this.dataRepository.getTopCryptosByPrice(limit);
    return topCryptos.length > 0
      ? topCryptos.map((crypto, index) => `${index + 1}. ${crypto.symbol}: ${crypto.price} USDT`).join('\n')
      : 'No data available for top cryptocurrencies.';
  }

 

  async onModuleInit() {
    const me = await this.bot.getMe();
    this.botUsername = me.username;
    this.logger.log(`Bot username: @${this.botUsername}`);

    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text?.toLowerCase();

      // // Detect "/fng" command or keywords related to FNG
      // if (text === '/fng' || text.includes('fear and greed') || text.includes('شاخص ترس و طمع')) {
      //   const chatGptResponse = await this.getFngResponseWithChatGpt();
      //   await this.bot.sendMessage(chatId, chatGptResponse);
      //   return;
      // }

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
