import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { DataRepository } from '../database/repositories/data.repository';

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

//@Cron('0 */55 * * * *') // Run every minute
// Fetch sort data every 15 minutes
@Cron('*/15 * * * *') // Runs every 15 minutes
async fetchAndStoreAllSorts(): Promise<void> {
  console.log(`Fetching all sorts at ${new Date().toISOString()}...`);
  await this.fetchBatchData(this.sorts);
  console.log(`Completed fetching all sorts.`);
}


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

private async fetchBatchData(sorts: string[]): Promise<void> {
  for (const sort of sorts) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2s delay
      const response = await this.fetchDataWithRetry(this.apiUrl, {
        params: { sort, limit: 100 },
        headers: { Authorization: `Bearer ${process.env.LUNARCRUSH_API_KEY}` },
      });

      const data = response.data?.data;
      const timestamp = Math.floor(Date.now() / 1000);
      for (const coin of data) {
        await this.repository.createLunarPubCoin({
          ...coin,
          fetched_sort: sort,
          fetched_at: timestamp,
        });
      }
      console.log(`Fetched sort "${sort}" successfully.`);
    } catch (error) {
      console.error(`Error fetching sort "${sort}":`, error.message);
    }
  }
}

//@Cron('*/30 * * * *') // Runs every 30 minutes
@Cron('* * * * *') //Run every minute
//@Cron('0 0 1 1 *') //run every year
async fetchAndStoreNews(): Promise<void> {
  console.log(`Fetching news at ${new Date().toISOString()}...`);
  try {
    const response = await this.fetchDataWithRetry(
      'https://lunarcrush.com/api4/public/topic/cryptocurrency/news/v1',
      {
        headers: {
          Authorization: `Bearer ${process.env.LUNARCRUSH_API_KEY}`,
        },
      }
    );

    const data = response.data?.data;
    if (data && Array.isArray(data)) {
      const timestamp = Math.floor(Date.now() / 1000);
      for (const newsItem of data) {
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
      }
      console.log(`Fetched and stored ${data.length} news items.`);
    } else {
      console.log('No news data available.');
    }
  } catch (error) {
    console.error('Error fetching LunarCrush news:', error.message);
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
