import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { DataRepository } from '../database/repositories/data.repository';

@Injectable()
export class LunarCrushService {
  private readonly apiUrl = 'https://lunarcrush.com/api4/public/coins/list/v2';
  private readonly sorts = [
    'price',
    //'price_btc',
    'volume_24h',
    'volatility',
    //'circulating_supply',
    //'max_supply',
    //'percent_change_1h',
    'percent_change_24h',
    //'percent_change_7d',
    'market_cap',
    //'market_cap_rank',
    //'interactions_24h',
    //'social_volume_24h',
    'social_dominance',
    'market_dominance',
    'galaxy_score',
    'galaxy_score_previous',
    'alt_rank',
    'alt_rank_previous',
    'sentiment',
  ];

  constructor(private readonly repository: DataRepository) {}

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

@Cron('0 */55 * * * *') // Run every minute
async fetchAndStoreAllSorts(): Promise<void> {
  const sortsPerBatch = 10; // 10 requests per minute
  const minute = new Date().getMinutes();
  const batchIndex = minute % Math.ceil(this.sorts.length / sortsPerBatch); // Determine the batch for the current minute
  const batchSorts = this.sorts.slice(batchIndex * sortsPerBatch, (batchIndex + 1) * sortsPerBatch);

  console.log(`Fetching data for batch ${batchIndex + 1}...`);
  await this.fetchBatchData(batchSorts);
  console.log(`Fetching data for batch ${batchIndex + 1} completed.`);
}


private async fetchBatchData(sorts: string[]): Promise<void> {
    await Promise.all(
      sorts.map(async (sort) => {
        try {
          const response = await this.fetchDataWithRetry(this.apiUrl, {
            params: {
              sort,
              limit: 100, // Fetch only the first 100 results
            },
            headers: {
              Authorization: `Bearer ${process.env.LUNARCRUSH_API_KEY}`,
            },
          });
  
          const data = response.data.data;
  
          const time = new Date().getTime() / 1000;
          for (const coin of data) {
            await this.repository.createLunarPubCoin({
              ...coin,
              fetched_sort: sort, // Track the source sort
              fetched_at: time,
            });
          }
  
          console.log(`Fetched and saved ${data.length} items for sort "${sort}".`);
        } catch (error) {
          console.error(`Error fetching data for sort "${sort}":`, error.message);
        }
      })
    );
  }
  
  private async fetchDataWithRetry(url: string, options: any, retries = 3): Promise<any> {
    try {
      const response = await axios.get(url, options);
      return response;
    } catch (error) {
      if (error.response?.status === 429 && retries > 0) {
        const retryAfter = parseInt(error.response.headers['retry-after'] || '1', 10) * 1000;
        console.warn(`Rate limit exceeded. Retrying after ${retryAfter}ms...`);
        await new Promise((resolve) => setTimeout(resolve, retryAfter));
        return this.fetchDataWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }
  

  // Fetch data based on category and sort
  async getByCategoryAndSort(category: string, sort: string, limit: number): Promise<any[]> {
    // Call the repository method to fetch data
    return await this.repository.findLunarPubCoinByCategoryAndSort(category, sort, limit);
  }

  // Fetch data based on sort only
  async getBySort(sort: string, limit: number): Promise<any[]> {
    // Call the repository method to fetch data
    return await this.repository.findLunarPubCoinBySort(sort, limit);
  }

}
