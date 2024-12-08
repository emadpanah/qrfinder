import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { OpenAI } from 'openai';
import { ProductService } from '../product/services/product.service';
import { DataRepository } from '../data/database/repositories/data.repository'; // Import DataRepository
import { isEmpty } from 'validator';
import { DominanceDto } from '../data/database/dto/dominance.dto';




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

  // private readonly validCategories = [
  //   'DeFi', 'Layer 1', 'Layer 2', 'MemeCoin', 'Gaming & Metaverse', 'AI', 
  //   'NFTs', 'SocialFi', 'Stablecoin', 'Real-World Assets', 'Bitcoin Ecosystem',
  //   'Liquid Staking Derivatives', 'Exchange Tokens', 'DAO', 'Analytics', 'Sports',
  //   'Run', 'Gambling', 'Real Estate', 'Fan Tokens',
  // ];

  //
  private readonly validCategories = ['liquid-staking-tokens','runes',
'analytics','stablecoin','fan','bitcoin-ecosystem','sports','desci','real-estate','real-world-assets',
'ai','exchange-tokens','wallets','brc20','events','defi','layer-1','base-ecosystem','meme','dao',
'layer-2','lending-borrowing','nft','gaming','gambling','depin','socialfi', 'stacks-ecosystem'];

  private readonly validSorts =[
  'price',
    //'price_btc',
    'volume_24h',
    'volatility',
    //'circulating_supply',
    //'max_supply',
    //'percent_change_1h',
    //'percent_change_24h',
    //'percent_change_7d',
    'market_cap',
    //'market_cap_rank',
    //'interactions_24h',
    //'social_volume_24h',
    //'social_dominance',
    'market_dominance',
    'galaxy_score',
    'galaxy_score_previous',
    'alt_rank',
    'alt_rank_previous',
    'sentiment'];
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

  
  async getChatGptResponse(prompt: string): Promise<string> {

   
  
    const functions = [
      {
        name: 'getRSIForDate',
        description: 'Fetches the RSI data for a specific symbol on a specific date.',
        parameters: {
          type: 'object',
          properties: {
            symbol: {
              type: 'string',
              description: 'The symbol of the cryptocurrency, e.g., BTCUSDT.',
            },
            date: {
              type: 'string',
              description: 'The date for which to retrieve the RSI data, in YYYY-MM-DD format.',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            },
          },
          required: ['symbol', 'date', 'language'],
        },
      },
      // {
      //   name: 'getDominanceForSymbol',
      //   description: 'Fetches the dominance data for a specific symbol on a specific date.',
      //   parameters: {
      //     type: 'object',
      //     properties: {
      //       symbol: {
      //         type: 'string',
      //         description: 'The cryptocurrency symbol (e.g., BTCUSDT).',
      //       },
      //       date: {
      //         type: 'string',
      //         description: 'The date for which to retrieve dominance data, in YYYY-MM-DD format.',
      //       },
      //       language: {
      //         type: 'string',
      //         description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
      //       },
      //     },
      //     required: ['symbol', 'date', 'language'],
      //   },
      // },
      // {
      //   name: 'getTopCoinsByCategoryAndSort',
      //   description: 'Fetches the top coins by category and sort from LunarCrush data.',
      //   parameters: {
      //     type: 'object',
      //     properties: {
      //       category: {
      //         type: 'string',
      //         description: 'The category of the coins, e.g., DeFi, Layer 1, MemeCoin.',
      //       },
      //       sort: {
      //         type: 'string',
      //         description: 'The sorting parameter, e.g., market_cap, price, volume_24h.',
      //       },
      //       limit: {
      //         type: 'integer',
      //         description: 'The number of top coins to fetch (default is 10).',
      //       },
      //       language: {
      //         type: 'string',
      //         description: 'The language of the user query, e.g., "en" for English, "fa" for Persian.',
      //       },
      //     },
      //     required: ['category', 'sort', 'language'],
      //   },
      // },      
      // {
      //   name: 'getTopCoinsBySort',
      //   description: 'Fetches the top coins by sort from LunarCrush data.',
      //   parameters: {
      //     type: 'object',
      //     properties: {
      //       sort: {
      //         type: 'string',
      //         description: 'The sorting parameter, e.g., market_cap, price, volume_24h.',
      //       },
      //       limit: {
      //         type: 'integer',
      //         description: 'The number of top coins to fetch (default is 10).',
      //       },
      //       language: {
      //         type: 'string',
      //         description: 'The language of the user query, e.g., "en" for English, "fa" for Persian.',
      //       },
      //     },
      //     required: ['sort', 'language'],
      //   },
      // },  
      {
        name: 'getMACDForDate',
        description: 'Fetches the MACD data for a specific symbol on a specific date.',
        parameters: {
          type: 'object',
          properties: {
            symbol: {
              type: 'string',
              description: 'The symbol of the cryptocurrency, e.g., BTCUSDT.',
            },
            date: {
              type: 'string',
              description: 'The date for which to retrieve the MACD data, in YYYY-MM-DD format.',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            },
          },
          required: ['symbol', 'date', 'language'],
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
          required: ['timestamp', 'language'],
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
            date: {
              type: 'string',
              description: 'The date for which to retrieve the price, in YYYY-MM-DD format.',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            },
          },
          required: ['symbol', 'date', 'language'],
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
            date: {
              type: 'string',
              description: 'The date for which to retrieve the prices, in YYYY-MM-DD format.',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            },
          },
          required: ['symbols', 'date', 'language'],
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
              description: 'The date for which to retrieve the prices, in YYYY-MM-DD format.',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            },
          },
          required: ['limit', 'language'],
        },
      },
      {
        name: 'getTopCryptosByVolatility',
        description: 'Fetches the top N cryptocurrencies sorted by volatility.',
        parameters: {
          type: 'object',
          properties: {
            limit: {
              type: 'integer',
              description: 'The number of top cryptocurrencies to fetch.',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            },
          },
          required: ['limit', 'language'],
        },
      },
      {
        name: 'getTopCryptosByGalaxyScore',
        description: 'Fetches the top N cryptocurrencies sorted by social trent.',
        parameters: {
          type: 'object',
          properties: {
            limit: {
              type: 'integer',
              description: 'The number of top cryptocurrencies to fetch.',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            },
          },
          required: ['limit', 'language'],
        },
      },
      {
        name: 'getTopCryptosByAltRank',
        description: 'Fetches the top N altcoin cryptocurrencies',
        parameters: {
          type: 'object',
          properties: {
            limit: {
              type: 'integer',
              description: 'The number of top cryptocurrencies to fetch.',
            },
            language: {
              type: 'string',
              description: 'The language of the user query, e.g., "en" for English, "fa" for Persian, etc.',
            },
          },
          required: ['limit', 'language'],
        },
      },
    ];
  
    //const systemMessage = this.generateSystemMessage();

    const today = new Date().toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
  });
  
//   // Include the current date in the initial message
   const datePrompt = `Today's date is ${today}.`;
    try {
      const stream = await this.openai.chat.completions.create({
        messages: [
          { role: "system", content: 
            "You are personal asistance for crypto and blockchain,"+
            " if user ask question in persian you must answer in persian and if user ask in english you answer english."+
            " as personal asistance you are very helpful and intractive with customer."+
            "if user ask question in persian but with english characters that called"+
            " finglish you answer customer with persian language."+
            + ""+ datePrompt },
//          { role: 'system', content: systemMessage },
         { role: "user", content: prompt }
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

      let functionResponse;

      switch (functionName) { 
        //  case 'getDominanceForSymbol':
        //     const dominanceData = await this.getDominanceForSymbol(parameters.symbol, parameters.date); 
        //     return this.getDynamicInterpretation(dominanceData, 'Dominance', parameters.symbol, parameters.date, parameters.language);

        // case 'getTopCoinsByCategoryAndSort': {
        //   const { category, sort, limit = 10, language } = parameters;
        //   const response = await this.getTopCoinsByCategoryAndSort(
        //     category,
        //     sort,
        //     limit,
        //     language
        //   );
        //   this.conversationHistory.push({ role: 'function', name: functionName, content: response });
        //   return response;
        // }
        
        // case 'getTopCoinsBySort': {
        //   const { sort, limit = 10, language } = parameters;
        //   const response = await this.getTopCoinsBySort(sort, limit, language);
        //   this.conversationHistory.push({ role: 'function', name: functionName, content: response });
        //   return response;
        // }

        case 'getTopCryptosByVolatility': {
          const response = await this.getTopCryptosByVolatility(parameters.limit);
          this.conversationHistory.push({ role: 'function', name: functionName, content: response });
          return response;
        }

        case 'getTopCryptosByGalaxyScore': {
          return await this.getTopCryptosByGalaxyScore(parameters.limit);
        }
        case 'getTopCryptosByAltRank': {
          return await this.getTopCryptosByAltRank(parameters.limit);
        }
    

        case 'getRSIForDate':
          functionResponse = await this.getRSIForDate(parameters.symbol, parameters.date);
          return this.getDynamicInterpretation(functionResponse, 'RSI', parameters.symbol, parameters.date, parameters.language);

        case 'getMACDForDate':
          functionResponse = await this.getMACDForDate(parameters.symbol, parameters.date);
          return this.getDynamicInterpretation(functionResponse, 'MACD', parameters.symbol, parameters.date, parameters.language);

        case 'getFngForDate':
          const timestamp = new Date(parameters.timestamp).getTime() / 1000;
          functionResponse = await this.getFngForDate(timestamp);
          return this.getDynamicInterpretation(functionResponse, 'FNG',"", parameters.timestamp, parameters.language);

        case 'getCryptoPrice':
          const dateTimestamp = new Date(parameters.date).getTime() / 1000;
          functionResponse = await this.getCryptoPrice(parameters.symbol, dateTimestamp);
          return this.getDynamicInterpretation(functionResponse, 'Crypto Price', parameters.symbol, parameters.date, parameters.language);


          case 'getTopCryptosByPrice': {
              functionResponse = await this.getTopCryptosByPrice(parameters.limit, parameters.date);
              this.conversationHistory.push({ role: 'function', name: functionName, content: functionResponse });
              return functionResponse; 
            }

            //we need to handel multiple comparing 
          case 'getCryptoPrices': {
              functionResponse = await this.getCryptoPrices(parameters.symbols, parameters.date);
              this.conversationHistory.push({ role: 'function', name: functionName, content: functionResponse });
              return functionResponse;
            }
          default:
              return 'Requested function is not available.';
      }
      }
      else
      {
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

  async getDominanceForSymbol(symbol: string, date: string): Promise<DominanceDto> {
    const timestamp = new Date(date).getTime() / 1000;
    const dominanceData = await this.dataRepository.getDominanceBySymbolAndDate(symbol, timestamp);
    if (!dominanceData) {
      throw new Error(`No dominance data found for ${symbol} on ${date}.`);
    }
    return dominanceData;
  }

  async getDynamicInterpretation(data: any, topic: string, symbol: string, date: string, language: string): Promise<string> {
    const additionalPrompt = `
      Provide an discription of the following ${topic} data for ${symbol} on ${date}:
      ${JSON.stringify(data)}
      Please include an explanation of what this ${topic} data implies in terms of market conditions and trading strategy.
       Answer in ${language}.
    `;
  
    try {
      const response = await this.openai.chat.completions.create({
        messages: [
          { role: "system", content: "You are a crypto assistant that provides insights based on given data and context. " +
            "You must respond in the language specified by the user. If the user specifies Persian, respond in Persian. " +
            "For English or other languages, respond accordingly."
           },
          { role: "user", content: additionalPrompt }
        ],
        model: "gpt-4o-mini-2024-07-18",
      });
  
      const detailedInterpretation = response.choices[0].message.content.trim();
      this.conversationHistory.push({ role: 'assistant', content: detailedInterpretation });
      return detailedInterpretation;
    } catch (error) {
      console.error('Error fetching dynamic interpretation from ChatGPT:', error);
      return `Here is the raw ${topic} data: ${JSON.stringify(data)}`;
    }
  }
  
  
  // Fetch prices for multiple symbols
async getCryptoPrices(symbols: string[], date: number): Promise<string> {
  if (!symbols || symbols.length === 0) {
    return "Please provide at least one cryptocurrency symbol.";
  }

  console.log("symbols -- ", symbols);
  // Fetch the latest price for each symbol
  const prices = await Promise.all(
    symbols.map(async (symbol) => {
      const latestPrice = await this.dataRepository.getLatestPriceBySymbol(symbol, date);
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

    const priceData = await this.dataRepository.getLatestPriceBySymbol(mappedSymbol, date);
    return priceData ? `The latest price of ${mappedSymbol} is ${priceData.price} USDT` : `No data found for symbol ${symbol}`;
  }

  async getTopCryptosByPrice(limit: number, date: number): Promise<string> {
    const targetDate = new Date(date).setHours(0, 0, 0, 0) / 1000; // Adjust for your timestamp format
    const topCryptos = await this.dataRepository.getTopCryptosByPrice(limit, targetDate);
    return topCryptos.length > 0
      ? topCryptos.map((crypto, index) => `${index + 1}. ${crypto.symbol}: ${crypto.price} USDT`).join('\n')
      : 'No data available for top cryptocurrencies.';
  }

  async getTopCryptosByVolatility(limit: number): Promise<string> {
    const MAX_LIMIT = 50; // Maximum allowed limit for results
  
    // If the limit is 0 or greater than MAX_LIMIT, use MAX_LIMIT
    const finalLimit = limit === 0 || limit > MAX_LIMIT ? MAX_LIMIT : 10;
  
    const topCryptos = await this.dataRepository.getTopCryptosByVolatility(finalLimit);
  
    if (topCryptos.length === 0) {
      return 'No data available for top cryptocurrencies sorted by volatility.';
    }
  
    // Append a message if the returned limit is MAX_LIMIT
    const limitMessage =
      finalLimit === MAX_LIMIT
        ? ` (Returning the top ${MAX_LIMIT} most volatile cryptocurrencies.)`
        : '';
  
    return (
      `Top ${finalLimit} cryptocurrencies by volatility${limitMessage}:\n` +
      topCryptos
        .map((crypto, index) => `${index + 1}. ${crypto.symbol} - volatility: ${crypto.volatility}, Price:  ${parseFloat(crypto.price).toFixed(6)} USDT`)
        .join('\n')
    );
  }

    // Method to get the top cryptocurrencies by galaxy score
    async getTopCryptosByGalaxyScore(limit: number): Promise<string> {
      const MAX_LIMIT = 50; // Maximum allowed limit for results
  
    // If the limit is 0 or greater than MAX_LIMIT, use MAX_LIMIT
    const finalLimit = limit === 0 || limit > MAX_LIMIT ? MAX_LIMIT : 10;
      const topCryptos = await this.dataRepository.getTopCryptosByGalaxyScore(finalLimit);
      if (topCryptos.length === 0) return 'No data available for top cryptocurrencies by galaxy score.';
  
      return (
        `Top ${finalLimit} cryptocurrencies by social score:\n` +
        topCryptos
          .map(
            (crypto, index) =>
              `${index + 1}. ${crypto.symbol} - Social Score: ${crypto.galaxy_score}, Price:  ${parseFloat(crypto.price).toFixed(6)} USDT`
          )
          .join('\n')
      );
    }
  
    // Method to get the top cryptocurrencies by alt rank
    async getTopCryptosByAltRank(limit: number): Promise<string> {
      const MAX_LIMIT = 50; // Maximum allowed limit for results
  
    // If the limit is 0 or greater than MAX_LIMIT, use MAX_LIMIT
    const finalLimit = limit === 0 || limit > MAX_LIMIT ? MAX_LIMIT : 10;
      const topCryptos = await this.dataRepository.getTopCryptosByAltRank(finalLimit);
      if (topCryptos.length === 0) return 'No data available for top cryptocurrencies by alt rank.';
  
  
      return `Top ${finalLimit} altcoin cryptocurrencies \n` + 
             topCryptos.map((crypto, index) => `${index + 1}. ${crypto.symbol} - Rank Score: ${crypto.alt_rank}, Price:  ${parseFloat(crypto.price).toFixed(6)} USDT`).join('\n');
    }
  
  
  async getRSIForDate(symbol: string, date: string) {
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

  async getTopCoinsByCategoryAndSort(
    category: string,
    sort: string,
    limit: number,
    language: string
  ): Promise<string> {

    if (!this.validCategories.includes(category)) {
      const errorMessage = await this.generateErrorMessage(
        `Invalid category. Please choose from: ${this.validCategories.join(', ')}`,
        language
      );
      return errorMessage;
    }
    
    if (!this.validSorts.includes(sort)) {
      const errorMessage = await this.generateErrorMessage(
        `Invalid sort parameter. Please choose from: ${this.validSorts.join(', ')}`,
        language
      );
      return errorMessage;
    }

    const coins = await this.dataRepository.getTopCoinsByCategoryAndSort(category, sort, limit);
  
    // If no coins are returned, handle the error message in the `lunarCrushService`.
    if (!coins || coins.length === 0) {
      return `No data available for category "${category}" and sort "${sort}".`;
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

  async getMACDForDate(symbol: string, date: string) {
    const functionResponse = await this.dataRepository.getMACDBySymbolAndDate(symbol, date);
    if (functionResponse) {
      return `The MACD data for ${symbol} on ${date}:\n- MACD: ${functionResponse.MACD}\n- Signal: ${functionResponse.Signal}\n- Histogram: ${functionResponse.Histogram}.`;
    } else {
      return `No MACD data found for ${symbol} on ${date}.`;
    } }

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
