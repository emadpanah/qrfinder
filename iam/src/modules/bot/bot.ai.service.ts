import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { OpenAI } from 'openai';
import { ProductService } from '../product/services/product.service';
import { DataRepository } from '../data/database/repositories/data.repository'; // Import DataRepository
import { isEmpty } from 'validator';
import { DominanceDto } from '../data/database/dto/dominance.dto';
import { UserChatLogDto } from '../data/database/dto/userchatlog.dto';
import { IamService } from '../iam/services/iam.service';
import { Types } from 'mongoose';
import { BalanceService } from '../iam/services/iam-balance.service';
import { Balance } from '../iam/database/schemas/iam-balance.schema';




@Injectable()
export class BotAIService implements OnModuleInit {
  private readonly bot: TelegramBot;
  private readonly apiKey = process.env.CHATGPT_API_KEY;
  private readonly logger = new Logger(BotAIService.name);
  private openai = new OpenAI({ apiKey: this.apiKey });
  private botUsername: string;
  private currentTelegramId: string;
  private userId: Types.ObjectId;
  private userLastAsk: Record<string, string> = {};
  private curId: Types.ObjectId;
  private userBalance: number;


  private prompts = [
    // Existing prompts...
  ];

  constructor(
    private readonly iamService: IamService,
    private readonly balanceService: BalanceService,
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
  private readonly validCategories = ['liquid-staking-tokens', 'runes',
    'analytics', 'stablecoin', 'fan', 'bitcoin-ecosystem', 'sports', 'desci', 'real-estate', 'real-world-assets',
    'ai', 'exchange-tokens', 'wallets', 'brc20', 'events', 'defi', 'layer-1', 'base-ecosystem', 'meme', 'dao',
    'layer-2', 'lending-borrowing', 'nft', 'gaming', 'gambling', 'depin', 'socialfi', 'stacks-ecosystem'];

  private readonly validSorts = [
    //'price', 
    //'price_btc',
    'volume_24h',
    'volatility',
    //'circulating_supply',
    //'max_supply',
    //'percent_change_1h',
    'percent_change_24h',
    //'percent_change_7d',
    //'percent_change_30d',
    'market_cap',
    //'market_cap_rank',
    'interactions_24h',
    //'social_volume_24h',
    'social_dominance',
    'market_dominance',
    //'market_dominance_prev',
    'galaxy_score',
    //'galaxy_score_previous',
    'alt_rank',
    //'alt_rank_previous',
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


  async getChatGptResponse(prompt: string): Promise<{ responseText: string; queryType: string; newParameters?: string[]; languague: string }> {

    let queryType = 'in-scope'; // Default to in-scope
    let newParameters: string[] = [];


    const functions = [
      // {
      //   name: 'getRSIForDate',
      //   description: 'Fetches the RSI data for a specific symbol on a specific date.',
      //   parameters: {
      //     type: 'object',
      //     properties: {
      //       symbol: {
      //         type: 'string',
      //         description: 'The symbol of the cryptocurrency, e.g., BTCUSDT.',
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
        "name": "getRSIForDate",
        "description": "Fetches the RSI data for a specific symbol on a specific date.",
        "parameters": {
          "type": "object",
          "properties": {
            "symbol": { "type": "string", "description": "The cryptocurrency symbol." },
            "date": { "type": "string", "description": "The date in YYYY-MM-DD format. if date is not given use today." },
            "language": { "type": "string", "description": "The response language." },
          },
          "required": ["symbol", "language"]
        }
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
                description: 'A cryptocurrency symbol, e.g., BTCUSDT.'
              },
              description: 'An array of symbols for which RSI data is requested.'
            },
            date: {
              type: 'string',
              description: 'The date (YYYY-MM-DD) for which to retrieve the RSI data. if date is not given use today.',
            },
            language: {
              type: 'string',
              description: 'The language of the response, using ISO 639-1 codes (e.g., "en" for English, "fa" for Persian, "es" for Spanish, etc.).',
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
              description: 'The language of the response, using ISO 639-1 codes (e.g., "en" for English, "fa" for Persian, "es" for Spanish, etc.).',
            }
          },
          required: ['n', 'language'],
        },
      }, {
        name: 'getSortForSymbol',
        description: 'Fetches the requested sort metric value and the categories for a given symbol from the LunarCrush data.',
        parameters: {
          type: 'object',
          properties: {
            symbol: {
              type: 'string',
              description: 'The symbol of the cryptocurrency, e.g., BTC, ETH, BTCUSDT.',
            },
            sort: {
              type: 'string',
              description: 'The sorting parameter. Must be one of the allowed sorts: volume_24h, volatility, percent_change_24h, market_cap, interactions_24h, social_dominance, market_dominance, galaxy_score, alt_rank, sentiment.',
            },
            language: {
              type: 'string',
              description: 'The language of the response, using ISO 639-1 codes (e.g., "en" for English, "fa" for Persian, "es" for Spanish, etc.).',
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
              description: 'The language of the response, using ISO 639-1 codes (e.g., "en" for English, "fa" for Persian, "es" for Spanish, etc.).',
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
              description: 'The language of the response, using ISO 639-1 codes (e.g., "en" for English, "fa" for Persian, "es" for Spanish, etc.).',
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
              description: 'The symbol of the cryptocurrency, e.g., BTCUSDT.',
            },
            date: {
              type: 'string',
              description: 'The date for which to retrieve the MACD data, in YYYY-MM-DD format. if date is not given use today.',
            },
            language: {
              type: 'string',
              description: 'The language of the response, using ISO 639-1 codes (e.g., "en" for English, "fa" for Persian, "es" for Spanish, etc.).',
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
                description: 'A cryptocurrency symbol, e.g. BTCUSDT.'
              },
              description: 'An array of symbols for which MACD data is requested.'
            },
            date: {
              type: 'string',
              description: 'The date (YYYY-MM-DD) for which to retrieve MACD data. if date is not given use today.'
            },
            language: {
              type: 'string',
              description: 'The language of the response, using ISO 639-1 codes (e.g., "en" for English, "fa" for Persian, "es" for Spanish, etc.).',
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
              description: 'The language of the response, using ISO 639-1 codes (e.g., "en" for English, "fa" for Persian, "es" for Spanish, etc.).',
            }
          },
          required: ['n', 'language'],
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
              description: 'The date for which to retrieve the price, in YYYY-MM-DD format. if date is not given use today.',
            },
            language: {
              type: 'string',
              description: 'The language of the response, using ISO 639-1 codes (e.g., "en" for English, "fa" for Persian, "es" for Spanish, etc.).',
            },
          },
          required: ['symbol', 'language'],
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
              description: 'The date for which to retrieve the prices, in YYYY-MM-DD format. if date is not given use today.',
            },
            language: {
              type: 'string',
              description: 'The language of the response, using ISO 639-1 codes (e.g., "en" for English, "fa" for Persian, "es" for Spanish, etc.).',
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
              description: 'The language of the response, using ISO 639-1 codes (e.g., "en" for English, "fa" for Persian, "es" for Spanish, etc.).',
            },
          },
          required: ['limit', 'language'],
        },
      },
      {
        name: 'analyzeAndCreateSignals',
        description: 'Analyzes RSI, MACD, and FNG data for up to 10 given symbols on a specified date and generates trading signals (e.g., Buy, Sell, Hold).',
        parameters: {
          type: 'object',
          properties: {
            symbols: {
              type: 'array',
              items: { type: 'string' },
              maxItems: 10,
              description: 'A list of cryptocurrency symbols to analyze. For example: ["BTCUSDT", "ETHUSDT"]. Maximum is 10 symbols.',
            },
            language: {
              type: 'string',
              description: 'The language of the response, using ISO 639-1 codes (e.g., "en" for English, "fa" for Persian, "es" for Spanish, etc.).',
            },
          },
          required: ['symbols', 'language'],
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
              description: 'The language of the response, using ISO 639-1 codes (e.g., "en" for English, "fa" for Persian, "es" for Spanish, etc.).',
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
        name: 'getLatestNews',
        description: 'Fetches the latest N news articles about cryptocurrencies.',
        parameters: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of news articles to retrieve (default 5, max 50).'
            },
            language: {
              type: 'string',
              description: 'The language of the response, using ISO 639-1 codes (e.g., "en" for English, "fa" for Persian, "es" for Spanish, etc.).',
            }
          },
          required: ['language']
        }
      },
      {
        name: 'getTopNewsByInteractions',
        description: 'Fetches the top N news articles sorted by interactions in the last 24 hours.',
        parameters: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of news articles to retrieve (default 5, max 50).'
            },
            language: {
              type: 'string',
              description: 'The language of the response, using ISO 639-1 codes (e.g., "en" for English, "fa" for Persian, "es" for Spanish, etc.).',
            }
          },
          required: ['language']
        }
      },
      {
        name: 'searchNewsByTitle',
        description: 'Fetches the latest N news articles containing a specific keyword in the title.',
        parameters: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Keyword to search for in the news titles.'
            },
            limit: {
              type: 'number',
              description: 'Number of news articles to retrieve (default 5, max 50).'
            },
            language: {
              type: 'string',
              description: 'The language of the response, using ISO 639-1 codes (e.g., "en" for English, "fa" for Persian, "es" for Spanish, etc.).',
            }
          },
          required: ['title', 'language']
        }
      },
      {
        name: 'getHighSentimentNews',
        description: 'Fetch the top N news articles with high sentiment (positive sentiment >= 4).',
        parameters: {
          type: 'object',
          properties: {
            n: {
              type: 'integer',
              description: 'The number of news articles to fetch (default 4, max 10).',
            },
            language: {
              type: 'string',
              description: 'The language of the response, using ISO 639-1 codes (e.g., "en" for English, "fa" for Persian, "es" for Spanish, etc.).',
            },
          },
          required: ['language'],
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
          {
            role: "system", content:
              "You are personal asistance for crypto and blockchain," +
              " if user ask question in persian you must answer in persian and if user ask in english you answer english." +
              " as personal asistance you are very helpful and intractive with customer." +
              "if user ask question in persian but with english characters that called" +
              " finglish you answer customer with persian language." +
              + "" + datePrompt
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


          // case 'getTopCryptosByVolatility': {
          //   const response = await this.getTopCryptosByVolatility(parameters.limit);
          //   this.conversationHistory.push({ role: 'function', name: functionName, content: response });
          //   return response;
          // }

          // case 'getTopCryptosByGalaxyScore': {
          //   return await this.getTopCryptosByGalaxyScore(parameters.limit);
          // }
          // case 'getTopCryptosByAltRank': {
          //   return await this.getTopCryptosByAltRank(parameters.limit);
          // }

          case 'getTopCryptosByCategoryAndSort': {
            const { category, sort, limit = 10, language } = parameters;
            // Validate category
            if (!this.validCategories.includes(category)) {
              const errorMsg = `Invalid category: "${category}". Please choose from: ${this.validCategories.join(', ')}.`;
              return {
                responseText: errorMsg,
                queryType,
                newParameters,
                languague: language,
              };
            }

            // Validate sort
            if (!this.validSorts.includes(sort)) {
              const errorMsg = `Invalid sort parameter: "${sort}". Please choose from: ${this.validSorts.join(', ')}.`;
              return {
                responseText: errorMsg,
                queryType,
                newParameters,
                languague: language,
              };
            }

            const response = await this.getTopCoinsByCategoryAndAnySort(category, sort, limit, language);
            return {
              responseText: response,
              queryType,
              newParameters,
              languague: language,
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
                queryType,
                newParameters,
                languague: language,
              };
            }

            // Now retrieve data from the repository
            const response = await this.getTopCryptosByAnySort(sort, limit, language);
            return {
              responseText: response,
              queryType,
              newParameters,
              languague: language,
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
              queryType,
              newParameters,
              languague: language,
            };
          }

          case 'getRSIForDate': {
            // Set the default date if not provided
            const effectiveDate = parameters.date || new Date().toISOString().split('T')[0];
            const timestamp1 = new Date(effectiveDate).getTime() / 1000;

            // Call the actual function
            functionResponse = await this.getRSIForDate(parameters.symbol, timestamp1);

            // // Identify new or unexpected parameters
            // const allowedParameters = ['symbol', 'date', 'language'];
            // const newParameters = Object.keys(parameters).filter(
            //   (key) => !allowedParameters.includes(key)
            // );

            // Generate AI response using getDynamicInterpretation
            const aiResponse = await this.getDynamicInterpretation(
              functionResponse,
              'RSI',
              parameters.symbol,
              effectiveDate,
              parameters.language
            );

            return {
              responseText: aiResponse,
              queryType,
              newParameters,
              languague: parameters.language,
            };
          }

          case 'getMACDForDate':
            const ddd = parameters.date || new Date().toISOString().split('T')[0];
            const timestamp2 = new Date(ddd).getTime() / 1000;
            functionResponse = await this.getMACDForDate(parameters.symbol, timestamp2);
            return {
              responseText: await this.getDynamicInterpretation(functionResponse, 'MACD', parameters.symbol, parameters.date, parameters.language),
              queryType,
              newParameters,
              languague: parameters.language,
            };

          case 'getFngForDate':
            const dd = parameters.date || new Date().toISOString().split('T')[0];
            const timesta = new Date(dd).getTime() / 1000;
            functionResponse = await this.getFngForDate(timesta);
            return {
              responseText: await this.getDynamicInterpretation(functionResponse, 'FNG', "", parameters.timestamp, parameters.language),
              queryType,
              newParameters,
              languague: parameters.language,
            };

          case 'getCryptoPrice':
            const effectiveDate = parameters.date || new Date().toISOString().split('T')[0];
            const timestamp1 = new Date(effectiveDate).getTime() / 1000;
            functionResponse = await this.getCryptoPrice(parameters.symbol, timestamp1);
            return {
              responseText: await this.getDynamicInterpretation(functionResponse, 'Crypto Price', parameters.symbol, parameters.date, parameters.language),
              queryType,
              newParameters,
              languague: parameters.language,
            };


          case 'getTopCryptosByPrice': {
            const effectiveDate = parameters.date || new Date().toISOString().split('T')[0];
            const timestamp1 = new Date(effectiveDate).getTime() / 1000;
            functionResponse = await this.getTopCryptosByPrice(parameters.limit, timestamp1);
            return {
              responseText: functionResponse,
              queryType,
              newParameters,
              languague: parameters.language,
            };
          }

          //we need to handel multiple comparing 
          case 'getCryptoPrices': {
            const effectiveDate = parameters.date || new Date().toISOString().split('T')[0];
            const timestamp1 = new Date(effectiveDate).getTime() / 1000;
            functionResponse = await this.getCryptoPrices(parameters.symbols, timestamp1);
            return {
              responseText: functionResponse,
              queryType,
              newParameters,
              languague: parameters.language,
            };
          }

          case 'getRSIForMultipleSymbolsOnDate': {
            const effectiveDate = parameters.date || new Date().toISOString().split('T')[0];
            const timestamp1 = new Date(effectiveDate).getTime() / 1000;
            const { symbols, language } = parameters;
            functionResponse = await this.getRSIForMultipleSymbolsOnDate(symbols, timestamp1, language);
            return {
              responseText: functionResponse,
              queryType,
              newParameters,
              languague: parameters.language,
            };
          }

          case 'getTopNRSICryptos': {
            const effectiveDate = parameters.date || new Date().toISOString().split('T')[0];
            const timestamp = new Date(effectiveDate).getTime() / 1000;
            const { n, language } = parameters;
            functionResponse = await this.getTopNRSICryptos(n, timestamp, language);
            return {
              responseText: functionResponse,
              queryType,
              newParameters,
              languague: parameters.language,
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
              queryType,
              newParameters,
              languague: parameters.language,
            };
          }

          case 'getTopNMACDCryptos': {
            const { n, date, language } = parameters;
            const effectiveDate = date || new Date().toISOString().split('T')[0];
            const timestamp = new Date(effectiveDate).getTime() / 1000;
            functionResponse = await this.getTopNMACDCryptos(n, timestamp, language);
            return {
              responseText: functionResponse,
              queryType,
              newParameters,
              languague: parameters.language,
            };
          }

          case 'analyzeAndCreateSignals':
            functionResponse = await this.analyzeAndCreateSignals(parameters.symbols, parameters.language);
            return {
              responseText: functionResponse,
              queryType,
              newParameters,
              languague: parameters.language,
            };

          case 'getSortForSymbol': {
            const { symbol, sort, language } = parameters;

            // Validate sort
            if (!this.validSorts.includes(sort)) {
              const errorMsg = `Invalid sort parameter: "${sort}". Please choose from: ${this.validSorts.join(', ')}.`;
              return {
                responseText: errorMsg,
                queryType,
                newParameters,
                languague: parameters.language,
              };
            }

            const { categories, sortValue } = await this.dataRepository.getSortValueForSymbol(symbol, sort);

            if (!categories && sortValue === null) {
              const errorMas = `No data found for symbol ${symbol} with the requested sort parameter.`;
              return {
                responseText: errorMas,
                queryType,
                newParameters,
                languague: parameters.language,
              };
            }

            const err = `Category for ${symbol}: ${categories}\n${sort} value for this symbol: ${sortValue}`;
            return {
              responseText: err,
              queryType,
              newParameters,
              languague: parameters.language,
            };
          }

          case 'getLatestNews': {

            const { limit = 5, language } = parameters; // Include language
            const news = await this.dataRepository.getLatestNews(limit);
            return {
              responseText: await this.formatNewsResponse(news, language),
              queryType,
              newParameters,
              languague: parameters.language,
            };
          }

          case 'getTopNewsByInteractions': {
            const { limit = 5, language } = parameters; // Include language
            const news = await this.dataRepository.getTopNewsByInteractions(limit);
            return {
              responseText: await this.formatNewsResponse(news, language),
              queryType,
              newParameters,
              languague: parameters.language,
            };
          }

          case 'searchNewsByTitle': {
            const { title, limit = 5, language } = parameters; // Include language
            const news = await this.dataRepository.searchNewsByTitle(title, limit);
            return {
              responseText: await this.formatNewsResponse(news, language),
              queryType,
              newParameters,
              languague: parameters.language,
            };
          }


          case 'getHighSentimentNews': {
            const { n = 5, language } = parameters;
            const response = await this.getHighSentimentNews(n, language);
            return {
              responseText: response,
              queryType,
              newParameters,
              languague: parameters.language,
            };
          }


          default:
            {
              queryType = 'out-of-scope';
              return { responseText: 'Requested function is not available.', queryType, languague: "en" };
            }
        }
      }
      else {
        const responseMessage = message.content?.trim();

        if (responseMessage) {
          this.logger.log(`Response from ChatGPT: ${responseMessage}`);
          return { responseText: responseMessage || 'Invalid response from ChatGPT.', queryType, languague: "en" };

        } else {
          this.logger.error('Received an empty response from ChatGPT', { stream });
          return { responseText: 'Sorry, I didn’t receive a valid response from ChatGPT. Please try again.', queryType, languague: "en" };
        }
      }
    } catch (error) {
      console.error('Error fetching response from ChatGPT:', error);
      return { responseText: 'Error fetching response from ChatGPT.', queryType, languague: "en" };

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

  async analyzeAndCreateSignals(symbols: string[], language: string): Promise<string> {
    if (symbols.length > 1) {
      return `Please provide a single symbol. You provided ${symbols.length}.`;
    }
  
    const fngData = await this.dataRepository.findFngByDate();
    const fng = fngData
      ? { value: fngData.value || "0", value_classification: fngData.value_classification || "Neutral" }
      : { value: "0", value_classification: "Neutral" };
  
    let responseText = `🔍 **Trading Analysis Results** 📊\n\n`;
  
    for (const symbol of symbols) {
      const [indicators, sorts, macdData, adx] = await Promise.all([
        this.dataRepository.getRSIBySymbolAndDate(symbol),
        this.dataRepository.getAllSortsForSymbol(symbol),
        this.dataRepository.getMACDBySymbolAndDate(symbol),
        this.dataRepository.getADXBySymbolAndDate(symbol),
      ]);
  
      if (!indicators || Object.keys(sorts).length === 0 || !macdData || !adx) {
        return `⚠️ Insufficient data (RSI, MACD, ADX, or sorts) for ${symbol}.`;
      }
  
      const indicatorsWithADX = { ...indicators, MACD: macdData, ADX: adx.adx_value };
  
      // Generate dynamic analyze prompt
      const prompt = await this.generateDynamicAnalyzePrompt(symbol, sorts, indicatorsWithADX, fng, language);
  
      try {
        const response = await this.openai.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `You are a crypto assistant that provides detailed technical analysis and trading insights based on the given data.`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          model: "gpt-4o-mini-2024-07-18",
        });
  
        const analysis = response.choices[0].message.content.trim();
  
        // Append the formatted analysis to the response text
        responseText += `💡 **${symbol} Analysis**:\n${this.formatAnalysis(analysis)}\n\n`;
      } catch (error) {
        console.error("Error fetching analysis from ChatGPT:", error);
        responseText += `❌ **${symbol}**: Error generating analysis. Please try again later.\n\n`;
      }
    }
  
    return responseText;
  }
  
  private formatAnalysis(rawAnalysis: string): string {
    return rawAnalysis
      .replace(/###/g, "🔹") // Replace section headers with a bullet icon
      .replace(/\*\*(.*?)\*\*/g, "🌟 $1") // Highlight bolded text with a star emoji
      .replace(/- /g, "➡️ "); // Use an arrow for list items
      
  }
  
  

  async generateDynamicAnalyzePrompt(
    symbol: string,
    sorts: Record<string, any>,
    indicators: { RSI?: number; MACD?: { MACD: number; Signal: number; Histogram: number }; ADX?: number },
    fng: { value: string; value_classification: string },
    language: string
  ): Promise<string> {
    const prompt = `
  You are a trading assistant specializing in cryptocurrency analysis. Use the following methodologies, indicators, and data points to generate a comprehensive trading signal for the symbol ${symbol}:
  
   ### **Analysis Instructions**
  1. **RSI**: Evaluate for overbought (>70) or oversold (<30) conditions.
  2. **MACD**: Identify bullish or bearish crossovers.
  3. **ADX**: Assess the trend's strength (e.g., ADX > 25 indicates a strong trend).
  4. **FNG**: Factor in market sentiment (e.g., "Fear" indicates cautious trading; "Greed" suggests optimism).
  5. **Sorts**: Use price, volume_24h, volatility, circulating_supply, max_supply, percent_change_1h, percent_change_24h, 
  percent_change_7d, percent_change_30d, market_cap, market_cap_rank, interactions_24h, 
  social_volume_24h, social_dominance, market_dominance, market_dominance_prev, galaxy_score, 
  galaxy_score_previous, alt_rank, alt_rank_previous and sentiment, to refine the signal.
  6. Combine these indicators to suggest a trading action: "Buy", "Sell", "Hold", or "Strong Buy/Sell".
  7. Provide a detailed explanation for the signal, considering the above data points.
  8. Respond in ${language} language.
  
  ### **Objective**
  Deliver actionable insights to traders using these data points. Include a summary of the analysis and a clear recommendation.

  ### **Indicators**
  - **RSI**: ${indicators.RSI ? `Value: ${indicators.RSI}` : "No data available"}
  - **MACD**: ${
      indicators.MACD
        ? `MACD: ${indicators.MACD.MACD}, Signal: ${indicators.MACD.Signal}, Histogram: ${indicators.MACD.Histogram}`
        : "No data available"
    }
  - **ADX**: ${indicators.ADX ? `Value: ${indicators.ADX}` : "No data available"}
  
  ### **Sentiment**
  - **Fear and Greed Index (FNG)**: ${fng.value} (${fng.value_classification})
  
  ### **Sorts**
- **Price**: ${sorts.price || "No data"}
  - **Volume (24h)**: ${sorts.volume_24h || "No data"}
- **Volatility**: ${sorts.volatility || "No data"}
- **Circulating Supply**: ${sorts.circulating_supply || "No data"}
- **Max Supply**: ${sorts.max_supply || "No data"}
- **Percent Change (1h)**: ${sorts.percent_change_1h || "No data"}
- **Percent Change (24h)**: ${sorts.percent_change_24h || "No data"}
- **Percent Change (7d)**: ${sorts.percent_change_7d || "No data"}
- **Percent Change (30d)**: ${sorts.percent_change_30d || "No data"}
- **Market Cap**: ${sorts.market_cap || "No data"}
- **Market Cap Rank**: ${sorts.market_cap_rank || "No data"}
- **Interactions (24h)**: ${sorts.interactions_24h || "No data"}
- **Social Volume (24h)**: ${sorts.social_volume_24h || "No data"}
- **Social Dominance**: ${sorts.social_dominance || "No data"}
- **Market Dominance**: ${sorts.market_dominance || "No data"}
- **Market Dominance (Prev)**: ${sorts.market_dominance_prev || "No data"}
- **Galaxy Score**: ${sorts.galaxy_score || "No data"}
- **Galaxy Score (Prev)**: ${sorts.galaxy_score_previous || "No data"}
- **Alt Rank**: ${sorts.alt_rank || "No data"}
- **Alt Rank (Prev)**: ${sorts.alt_rank_previous || "No data"}
- **Sentiment**: ${sorts.sentiment || "No data"} 
`;
  
    return prompt;
  }
  
  

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
      const data = await this.dataRepository.getRSIBySymbolAndDate(sym, date);
      if (data && data.RSI) {
        return `${sym}: RSI ${data.RSI}`;
      } else {
        return `${sym}: No RSI data.`;
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
      const data = await this.dataRepository.getMACDBySymbolAndDate(sym, date);
      if (data) {
        return `${sym}: MACD: ${data.MACD}, Signal: ${data.Signal}, Histogram: ${data.Histogram}`;
      } else {
        return `${sym}: No MACD data.`;
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
  ): Promise<string> {
    if (!news || news.length === 0) return 'No news found.';

    const formattedNews = await Promise.all(
      news.map(async (item, index) => {
        const source = item.id.split('-')[0];
        const sentimentIcon = this.getSentimentIcon(item.post_sentiment);
        const sentimentTitle = this.getSentimentTitle(item.post_sentiment);

        const translatedTitle = language === 'en'
          ? item.post_title
          : await this.getTranslatedText(item.id, item.post_title, language);

        return `
    ${index + 1}. ${translatedTitle} ${sentimentIcon} (${sentimentTitle}, ${item.post_sentiment})
    🔗 (${item.post_link})
    📰 Source: ${source}`;
      }),
    );

    return `📢 Latest Crypto News\n${formattedNews.join('\n')}`;
  }


  async getHighSentimentNews(n = 5, language: string): Promise<string> {
    const results = await this.dataRepository.getNewsWithHighSentiment(n);

    if (!results || results.length === 0) {
      return language === 'fa'
        ? 'هیچ خبری با احساس مثبت بالا پیدا نشد.'
        : 'No news found with high sentiment.';
    }

    return await this.formatNewsResponse(results, language);
  }




  async onModuleInit() {
    const me = await this.bot.getMe();
    this.botUsername = me.username;
    this.logger.log(`Bot username: @${this.botUsername}`);

    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text?.toLowerCase();

      // Extract user info from the Telegram message
      console.log('start');
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
      console.log('telegramID :', telegramID);
      // Save the Telegram ID locally for chat saving
      this.currentTelegramId = telegramID;

      // Register or login the user
      const userInsertDto = {
        telegramID,
        mobile: '',
        chatId: chatId,
        telegramUserName,
        telegramFirstName,
        telegramLastName,
        telegramLanCode,
        clientSecret: process.env.NEXT_PUBLIC_APP_SECRET, // Add this to .env if not already present
      };

      try {
        const { token, isNewToken, userId } = await this.iamService.registerOrLogin(userInsertDto);
        this.userId = new Types.ObjectId(userId);
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
              amount: 5000,
              currency: this.curId,
              transactionEntityId: "6741f536d877c06a82d7e751", //unique ID for trial - just add once
              balanceAfterTransaction: this.userBalance + 5000,
              timestamp: Math.floor(Date.now() / 1000),
              _id: new Types.ObjectId()
            });
            this.userBalance = await this.balanceService.getUserBalance(this.userId, this.curId);
            await this.bot.sendMessage(
              chatId,
              `🎉 <b>Congratulations!</b> 🎉\n\n✨ You have received <b>5000 Tomans</b> as a welcome credit to explore the amazing <b>Trading AI Bot</b> features! 🚀\n\n💡 Start your trading journey now!`,
              { parse_mode: 'HTML' }
            );
          }
          catch (err) {
            this.logger.warn('trial added once', err.message);
          }
          await this.bot.sendMessage(
            chatId,
            `*Welcome to Trade AI Bot!* 🎉\n\nYour current balance is: *${this.userBalance.toLocaleString()} Tomans* 💰`,
            { parse_mode: 'Markdown' }
          );
        }

      } catch (error) {
        this.logger.error('Error during user registration/login:', error.message);
        return;
      }

      
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
        //check balance 
        // Get the last ask for this user (if any)
        const lastAsk = this.userLastAsk[chatId] || null;

        // Update the last ask to the current one for the next iteration
        this.userLastAsk[chatId] = text;


        console.log("userBalance", this.userBalance);
        // Check user balance
        if (this.userBalance < 100) {
          await this.bot.sendMessage(chatId, 'Insufficient balance for this request. Please recharge to continue.');
        }

        if (this.userBalance < 20) {
          await this.bot.sendMessage(chatId, 'Insufficient balance for this request. Please recharge to continue.');
          return;
        }

        // Create a prompt with only the last and current asks
        const prompt = `
    The user asked this previously: "${lastAsk || 'None'}".
    The user is now asking: "${text}".
    Based on this, please infer the user's intent and provide a 
    relevant response in detected user's language.
  `;

        let responseText = await this.getChatGptResponse(prompt);

        // Calculate token counts for prompt and response
        const inputTokens = Math.ceil(prompt.length / 4); // Approx 4 chars per token
        const outputTokens = Math.ceil(responseText.responseText.length / 4);

        // Calculate costs in USD
        const inputCost = (inputTokens / 1_000_000) * 0.15; // $0.15 per 1M tokens
        const outputCost = (outputTokens / 1_000_000) * 0.60; // $0.60 per 1M tokens

        const totalCost = inputCost + outputCost; // Total cost in USD

        // Convert to IRT
        const conversionRateToIRT = 130_000; // Example conversion rate
        const totalCostInIRT = Math.ceil(totalCost * conversionRateToIRT);

        // Check user balance
        if (this.userBalance < totalCostInIRT) {
          await this.bot.sendMessage(chatId, 'Insufficient balance for this request. Please recharge to continue.');
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
          query: text,
          response: responseText.responseText,
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


        this.bot.sendMessage(chatId, responseText.responseText).catch((err) => {
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
        this.bot.sendMessage(chatId, chatGptResponse.responseText).catch((err) => {
          this.logger.error('Failed to send message', err);
        });
      }
    });
  }
}
