import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { DataRepository } from '../database/repositories/data.repository';
import * as TelegramBot from 'node-telegram-bot-api';


@Injectable()
export class LunarCrushService {
  private readonly apiUrl = 'https://lunarcrush.com/api4/public/coins/list/v2';
  private readonly sorts = [
    'volume_24h',
    'volatility',
    'percent_change_24h',
    'market_cap',
    'interactions_24h',
    'social_dominance',
    'market_dominance',
    'galaxy_score',
    'alt_rank',
    'sentiment',
  ];


  private readonly telegramBot = new TelegramBot(process.env.
    //NABZAR_BOT_TOKEN
    NABZAR_X_BOT
    , { polling: false });
  private readonly telegramChatId = process.env.TELEGRAM_SIGNAL_GROUP_ID;

  constructor(private readonly repository: DataRepository) { }

  //   //@Cron('0 */20 * * * *') // Run every 20 minutes
  //   @Cron('* * * * *') //Run every minute
  //   async fetchAndStoreAllSorts(): Promise<void> {
  //     console.log('Fetching data for all sorts...');

  //     for (const sort of this.sorts) {
  //       try {
  //         const response = await axios.get(this.apiUrl, {
  //           params: {
  //             sort,
  //             limit: 100, // Fetch only the first 100 results
  //           },
  //           headers: {
  //             Authorization: `Bearer ${process.env.LUNARCRUSH_API_KEY}`,
  //           },
  //         });

  //         const data = response.data.data;

  //         // Save each coin's data to the database
  //         for (const coin of data) {
  //           await this.repository.createLunarPubCoin({
  //             ...coin,
  //             fetched_sort: sort, // Track which sort this data came from
  //           });
  //         }

  //         console.log(`Fetched and saved ${data.length} items for sort "${sort}".`);
  //       } catch (error) {
  //         console.error(`Error fetching data for sort "${sort}":`, error.message);
  //       }
  //     }

  //     console.log('Fetching data for all sorts completed.');
  //   }

  //@Cron('0 */28 * * * *') // Every 28 minutes
  // @Cron('0 0 1 1 *') //run every year
  // async fetchAndStoreAllSorts(): Promise<void> {
  //   console.log(`Fetching all sorts at ${new Date().toISOString()}...`);
  //   await this.fetchBatchData(this.sorts);
  //   console.log(`Completed fetching all sorts.`);
  // }


  // private async fetchBatchData(sorts: string[]): Promise<void> {
  //   for (const sort of sorts) {
  //     try {
  //       // Wait between requests to stay under the limit
  //       await new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay between requests

  //       const response = await this.fetchDataWithRetry(this.apiUrl, {
  //         params: {
  //           sort,
  //           limit: 100,
  //         },
  //         headers: {
  //           Authorization: `Bearer ${process.env.LUNARCRUSH_API_KEY}`,
  //         },
  //       });

  //       const data = response.data.data;
  //       const time = Date.now() / 1000;
  //       for (const coin of data) {
  //         await this.repository.createLunarPubCoin({
  //           ...coin,
  //           fetched_sort: sort,
  //           fetched_at: time,
  //         });
  //       }

  //       console.log(`Fetched and saved ${data.length} items for sort "${sort}".`);
  //     } catch (error) {
  //       console.error(`Error fetching data for sort "${sort}":`, error.message);
  //     }
  //   }
  // }

  // private async fetchBatchData(sorts: string[]): Promise<void> {
  //   for (const sort of sorts) {
  //     try {
  //       await new Promise((resolve) => setTimeout(resolve, 2000)); // 2s delay
  //       const response = await this.fetchDataWithRetry(this.apiUrl, {
  //         params: { sort, limit: 100 },
  //         headers: { Authorization: `Bearer ${process.env.LUNARCRUSH_API_KEY}` },
  //       });

  //       const data = response.data?.data;
  //       const timestamp = Math.floor(Date.now() / 1000);
  //       for (const coin of data) {
  //         await this.repository.createLunarPubCoin({
  //           ...coin,
  //           fetched_sort: sort,
  //           fetched_at: timestamp,
  //         });
  //       }
  //       console.log(`Fetched sort "${sort}" successfully.`);
  //     } catch (error) {
  //       console.error(`Error fetching sort "${sort}":`, error.message);
  //     }
  //   }
  // }

  //@Cron('0 */30 * * * *') // Every 30 minutes
  @Cron('0 0 1 1 *') //run every year
  //@Cron('* * * * *')
  async fetchAndStoreCoinsNewApi(): Promise<void> {
    console.log(`Fetching new LunarCrush coins at ${new Date().toISOString()}...`);
  
    try {
      const response = await this.fetchDataWithRetry(
        'https://lunarcrush.com/api4/public/coins/list/v1',
        {
          headers: {
            Authorization: `Bearer ${process.env.LUNARCRUSH_API_KEY}`,
          },
        }
      );
  
      const data = response.data?.data;
      if (data && Array.isArray(data)) {
        const timestamp = Math.floor(Date.now() / 1000);
  
        // Sort by market cap DESC and limit to 200 items
        const sortedData = data
          .sort((a, b) => b.market_cap - a.market_cap)
          .slice(0, 1000);
  
        for (const coin of sortedData) {
          await this.repository.createLunarPubCoin({
            ...coin,
            market_dominance_prev: coin.market_dominance_prev || 0,
            last_updated_price_by: coin.last_updated_price_by || '',
            blockchains: (coin.blockchains || []).map((b: any) => ({
              type: b.type || '',
              network: b.network || '',
              address: b.address || '',
              decimals: b.decimals || 0,
            })),
            fetched_sort: '', // EMPTY STRING for new API
            fetched_at: timestamp,
          });
        }
  
        console.log(`Saved top 1000 market cap coins.`);
      } else {
        console.log('No coin data returned.');
      }
    } catch (error) {
      console.error('Error fetching coins from new API:', error.message);
    }
  }
  


  //@Cron('0 */20 * * * *') // Every 20 minutes
  // @Cron('0 0 1 1 *') //run every year
  // async fetchAndStoreNews(): Promise<void> {
  //   console.log(`Fetching news at ${new Date().toISOString()}...`);
  //   try {
  //     const response = await this.fetchDataWithRetry(
  //       //'https://lunarcrush.com/api4/public/topic/cryptocurrency/news/v1',
  //       'https://lunarcrush.com/api4/public/category/cryptocurrencies/news/v1',
  //       {
  //         headers: {
  //           Authorization: `Bearer ${process.env.LUNARCRUSH_API_KEY}`,
  //         },
  //       }
  //     );

  //     const data = response.data?.data;
  //     if (data && Array.isArray(data)) {
  //       const timestamp = Math.floor(Date.now() / 1000);
  //       const twentyFourHoursAgo = Math.floor(Date.now() / 1000) - 86400; // 24 hours ago
  //       for (const newsItem of data) {
  //         if (newsItem.post_created >= twentyFourHoursAgo) {

  //           try {
  //             await this.repository.createLunarNews({
  //               id: newsItem.id,
  //               post_title: newsItem.post_title,
  //               post_link: newsItem.post_link,
  //               post_image: newsItem.post_image,
  //               post_created: newsItem.post_created,
  //               post_sentiment: newsItem.post_sentiment,
  //               interactions_24h: newsItem.interactions_24h,
  //               interactions_total: newsItem.interactions_total,
  //               fetched_at: timestamp,
  //             });
  //             // Send to Telegram only if interactions_24h > 1000
  //             if (newsItem.interactions_24h > 1000 ||
  //               newsItem.interactions_total>10000 || newsItem.post_sentiment > 3.4 ) {
  //               await this.sendNewsToTelegram(newsItem);
  //             }
  //           } catch (error) {
  //             if (error.code === 11000) {
  //               console.log(`Duplicate news item: ${newsItem.id}`);
  //             } else {
  //               console.error(`Error saving news item: ${error.message}`);
  //             }
  //           }
  //         }
  //       }
  //       console.log(`Fetched and stored ${data.length} news items.`);
  //     } else {
  //       console.log('No news data available.');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching LunarCrush news:', error.message);
  //   }
  // }

  @Cron('0 */45 * * * *')
  async fetchAndStoreNews(): Promise<void> {
    console.log(`🟢 [START] Full news fetch run at ${new Date().toISOString()}...`);
  
    const endpoints = [
      'https://lunarcrush.com/api4/public/category/cryptocurrencies/news/v1',
      'https://lunarcrush.com/api4/public/topic/bitcoin/news/v1',
      'https://lunarcrush.com/api4/public/topic/sol/news/v1',
      'https://lunarcrush.com/api4/public/topic/memecoin/news/v1',
      'https://lunarcrush.com/api4/public/topic/doge/news/v1',
      'https://lunarcrush.com/api4/public/topic/US100/news/v1',
      'https://lunarcrush.com/api4/public/topic/xau/news/v1',
      'https://lunarcrush.com/api4/public/topic/forex/news/v1',
      'https://lunarcrush.com/api4/public/topic/stocks/news/v1',
      'https://lunarcrush.com/api4/public/topic/cryptonews/news/v1',
      'https://lunarcrush.com/api4/public/topic/ethereum/news/v1',
      'https://lunarcrush.com/api4/public/topic/altcoins/news/v1',
      'https://lunarcrush.com/api4/public/category/stocks/news/v1',
    ];
  
    for (let i = 0; i < endpoints.length; i++) {
      const endpoint = endpoints[i];
      console.log(`🔄 [${i + 1}/${endpoints.length}] Fetching from: ${endpoint}`);
  
      try {
        const response = await this.fetchDataWithRetry(endpoint, {
          headers: {
            Authorization: `Bearer ${process.env.LUNARCRUSH_API_KEY}`,
          },
        });
  
        const data = response.data?.data;
        const timestamp = Math.floor(Date.now() / 1000);
        const twentyFourHoursAgo = timestamp - 86400;
  
        if (!Array.isArray(data)) {
          console.warn(`⚠️ No valid array from ${endpoint}`);
          continue;
        }
  
        let storedCount = 0;
        for (const newsItem of data) {
          if (newsItem.post_created >= twentyFourHoursAgo) {
            try {
              await this.repository.createLunarNews({
                id: newsItem.id,
                post_title: newsItem.post_title,
                post_link: newsItem.post_link,
                post_image: newsItem.post_image,
                post_created: newsItem.post_created,
                post_sentiment: newsItem.post_sentiment,
                interactions_24h: newsItem.interactions_24h,
                interactions_total: newsItem.interactions_total,
                fetched_at: timestamp,
              });
  
              storedCount++;
  
              if (
                newsItem.interactions_24h > 1000 ||
                newsItem.interactions_total > 10000 ||
                newsItem.post_sentiment > 3.4
              ) {
                await this.sendNewsToTelegram(newsItem);
              }
            } catch (error) {
              if (error.code === 11000) {
                console.log(`🟡 Duplicate news item: ${newsItem.id}`);
              } else {
                console.error(`❌ Save error [${newsItem.id}]: ${error.message}`);
              }
            }
          }
        }
  
        console.log(`✅ Stored ${storedCount} news items from: ${endpoint}`);
      } catch (error) {
        console.error(`❌ Fetch failed from ${endpoint}: ${error.message}`);
      }
  
      // Wait 3 minutes if not the last endpoint
      if (i < endpoints.length - 1) {
        console.log(`⏳ Waiting 1 minutes before next endpoint...`);
        await this.sleep(1 * 60 * 1000); // 180000ms
      }
    }
  
    console.log(`🟢 [END] Full run complete at ${new Date().toISOString()}`);
  }
  //@Cron('0 */40 * * * *') // Every 40 minutes
   //@Cron('0 0 1 1 *') //run every year
// async fetchAndStoreNews(): Promise<void> {
//   console.log(`Fetching news at ${new Date().toISOString()}...`);

//   // Define the two endpoints
//   const endpoints = [
//     'https://lunarcrush.com/api4/public/category/cryptocurrencies/news/v1',
//     'https://lunarcrush.com/api4/public/topic/bitcoin/news/v1',
//     'https://lunarcrush.com/api4/public/topic/memecoin/news/v1',
//     'https://lunarcrush.com/api4/public/category/stocks/news/v1'
//   ];

//   try {
//     for (let i = 0; i < endpoints.length; i++) {
//       const endpoint = endpoints[i];

//       // Fetch data from the current endpoint
//       const response = await this.fetchDataWithRetry(endpoint, {
//         headers: {
//           Authorization: `Bearer ${process.env.LUNARCRUSH_API_KEY}`,
//         },
//       });

//       const data = response.data?.data;
//       if (data && Array.isArray(data)) {
//         const timestamp = Math.floor(Date.now() / 1000);
//         const twentyFourHoursAgo = Math.floor(Date.now() / 1000) - 86400; // 24 hours ago

//         for (const newsItem of data) {
//           if (newsItem.post_created >= twentyFourHoursAgo) {
//             try {
//               await this.repository.createLunarNews({
//                 id: newsItem.id,
//                 post_title: newsItem.post_title,
//                 post_link: newsItem.post_link,
//                 post_image: newsItem.post_image,
//                 post_created: newsItem.post_created,
//                 post_sentiment: newsItem.post_sentiment,
//                 interactions_24h: newsItem.interactions_24h,
//                 interactions_total: newsItem.interactions_total,
//                 fetched_at: timestamp,
//               });

//               // Send to Telegram only if interactions_24h > 1000 or other conditions
//               if (
//                 newsItem.interactions_24h > 1000 ||
//                 newsItem.interactions_total > 10000 ||
//                 newsItem.post_sentiment > 3.4
//               ) {
//                 await this.sendNewsToTelegram(newsItem);
//               }
//             } catch (error) {
//               if (error.code === 11000) {
//                 console.log(`Duplicate news item: ${newsItem.id}`);
//               } else {
//                 console.error(`Error saving news item: ${error.message}`);
//               }
//             }
//           }
//         }
//         console.log(`Fetched and stored ${data.length} news items from ${endpoint}.`);
//       } else {
//         console.log(`No news data available from ${endpoint}.`);
//       }

//       // Add a 3-minute delay between the two queries (except after the last query)
//       if (i < endpoints.length - 1) {
//         console.log('Waiting 3 minutes before the next query...');
//         await this.sleep(180000); // 3 minutes in milliseconds
//       }
//     }
//   } catch (error) {
//     console.error('Error fetching LunarCrush news:', error.message);
//   }
// }



// Utility function to introduce a delay
sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

  private async sendNewsToTelegram(newsItem: any): Promise<void> {
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

    const sentiment = newsItem.post_sentiment;
    let sentimentIcon = '⚪ Neutral';
    if (sentiment > 3.1) {
      sentimentIcon = '🟢 Positive';
    } else if (sentiment < 2) {
      sentimentIcon = '🔴 Negative';
    }

    const timeAgo = getTimeAgo(newsItem.post_created);

    const message = `
📰 *New Crypto News*:
*Title:* ${newsItem.post_title}
*Source:* ${newsItem.creator_name || 'Unknown'}
*Time:* ${timeAgo}
*Sentiment:* ${sentimentIcon}
*Link:* [Read more](${newsItem.post_link})
  `;

    try {
      await this.telegramBot.sendMessage(this.telegramChatId, message, { parse_mode: 'Markdown' });
      console.log(`News item sent to Telegram: ${newsItem.id}`);
    } catch (error) {
      console.error(`Failed to send news to Telegram: ${error.message}`);
    }
  }

  private async fetchDataWithRetry(
    url: string,
    options: any,
    retries = 3,
    delay = 1000
  ): Promise<any> {
    try {
      return await axios.get(url, options); // Try the request
    } catch (error) {
      const statusCode = error.response?.status || null;

      if (retries > 0) {
        let retryDelay = delay; // Default retry delay

        // If 429 Rate Limit Exceeded
        if (statusCode === 429) {
          const retryAfterHeader = error.response?.headers['retry-after'];
          const retryAfter = retryAfterHeader
            ? parseInt(retryAfterHeader, 10) * 1000 // Convert retry-after to ms
            : delay * 2; // Fallback to exponential backoff if header not present
          retryDelay = Math.max(retryAfter, 1000); // Minimum 1s delay
          console.warn(`Rate limit hit. Retrying after ${retryDelay}ms...`);
        } else {
          console.warn(
            `Request failed with status ${statusCode}. Retrying after ${delay}ms...`
          );
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, retryDelay));

        // Retry the request
        return this.fetchDataWithRetry(url, options, retries - 1, retryDelay * 2);
      }

      // Log the final failure
      console.error(
        `Request failed after multiple retries. URL: ${url}, Error: ${error.message}`
      );
      throw error; // Propagate the error after all retries fail
    }
  }

 // @Cron('* * * * *')
//@Cron('0 */40 * * * *') // Every 40 minutes
@Cron('0 0 1 1 *') // adjust as needed
async fetchAndStoreStocks(): Promise<void> {
  console.log(`Fetching LunarCrush stock data at ${new Date().toISOString()}...`);

  try {
    const response = await this.fetchDataWithRetry(
      'https://lunarcrush.com/api4/public/stocks/list/v1',
      {
        headers: {
          Authorization: `Bearer ${process.env.LUNARCRUSH_API_KEY}`,
        },
      }
    );

    const data = response.data?.data;
    if (data && Array.isArray(data)) {
      const timestamp = Math.floor(Date.now() / 1000);
      const topStocks = data
        .sort((a, b) => b.market_cap - a.market_cap)
        .slice(0, 1000);

      for (const stock of topStocks) {
        await this.repository.createLunarPubStock({
          ...stock,
          market_dominance_prev: stock.market_dominance_prev || 0,
          last_updated_price_by: stock.last_updated_price_by || '',
          fetched_at: timestamp,
        });
      }

      console.log(`Saved top ${topStocks.length} stocks.`);
    } else {
      console.log('No stock data returned.');
    }
  } catch (error) {
    console.error('Error fetching stock data:', error.message);
  }
}


  // private async fetchDataWithRetry(url: string, options: any, retries = 3, delay = 1000): Promise<any> {
  //   try {
  //     return await axios.get(url, options);
  //   } catch (error) {
  //     if (error.response?.status === 429 && retries > 0) {
  //       const retryAfter = parseInt(error.response.headers['retry-after'] || '1', 10) * 1000;
  //       // Increase delay exponentially
  //       const newDelay = delay * 2;
  //       console.warn(`Rate limit exceeded. Retrying after ${newDelay}ms...`);
  //       await new Promise((resolve) => setTimeout(resolve, newDelay));
  //       return this.fetchDataWithRetry(url, options, retries - 1, newDelay);
  //     }
  //     throw error;
  //   }
  // }


  // private async fetchDataWithRetry(url: string, options: any, retries = 3): Promise<any> {
  //   try {
  //     const response = await axios.get(url, options);
  //     return response;
  //   } catch (error) {
  //     if (error.response?.status === 429 && retries > 0) {
  //       const retryAfter = parseInt(error.response.headers['retry-after'] || '1', 10) * 1000;
  //       console.warn(`Rate limit exceeded. Retrying after ${retryAfter}ms...`);
  //       await new Promise((resolve) => setTimeout(resolve, retryAfter));
  //       return this.fetchDataWithRetry(url, options, retries - 1);
  //     }
  //     throw error;
  //   }
  // }


  // Fetch data based on category and sort
  async getByCategoryAndSort(category: string, sort: string, limit: number): Promise<any[]> {
    // Call the repository method to fetch data
    return await this.repository.getTopCoinsByCategoryAndSort(category, sort, limit);
  }

  // Fetch data based on sort only
  async getBySort(sort: string, limit: number): Promise<any[]> {
    // Call the repository method to fetch data
    return await this.repository.getTopCoinsBySort(sort, limit);
  }

}
