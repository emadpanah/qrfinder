// src/modules/data/database/repositories/data.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { FngData } from '../schema/fng.schema';
import { TradingViewAlertDto } from '../dto/traidingview-alert.dto';
import { PriceData } from '../schema/price.schema';
import { RSIData } from '../schema/rsi.schema';
import { MACDData } from '../schema/macd.schema';
import { DominanceData } from '../schema/dominance.schema';
import { ST1Data } from '../schema/st1.schema';
import { ObjectId } from 'mongodb';
import { LunarCrushData } from '../schema/lunarcrush.schema';
import { LunarCrushPublicCoinDto } from '../dto/lunarcrush.dto';

@Injectable()
export class DataRepository {
  private readonly fngCollectionName = '_fngdata';
  private readonly tickerCollectionName = '_tickerdata';
  private readonly rsiCollectionName = '_rsidata';
  private readonly macdCollectionName = '_macddata';
  private readonly st1CollectionName = '_st1data';
  private readonly dominanceCollectionName = '_dominancedata';
  private readonly lunarPubCoinCollectionName = '_lunarpublicoindata';
  private readonly logger = new Logger(DataRepository.name);

  constructor(@InjectConnection('service') private readonly connection: Connection) {}

  // Save FNG data point in MongoDB
  async create(fngData: Partial<FngData>): Promise<FngData> {
    const collection = this.connection.collection(this.fngCollectionName);
    await collection.insertOne(fngData);
    return fngData as FngData;
  }

  // Save ticker data received from TradingView
  async createTickerData(tickerData: Partial<PriceData>): Promise<void> {
    const collection = this.connection.collection(this.tickerCollectionName);
    await collection.insertOne(tickerData);
  }


  async findFngByDate(targetDate?: number): Promise<FngData | null> {
    const collection = this.connection.collection(this.fngCollectionName);
  
    //this.logger.log(`Fetching FNG data for closest date on or before: ${targetDate}`);
  
    const query: any = {};
    if (targetDate) {
      query.timestamp = { $lte: targetDate };
    }
  
    // If no date is provided, this simply returns the latest FNG data
    const result = await collection
      .find(query)
      .sort({ timestamp: -1 }) // Sort by most recent
      .limit(1)
      .toArray();
  
    if (result.length > 0) {
      const fngRecord = result[0];
      this.logger.debug(`Found FNG data: ${JSON.stringify(fngRecord)}`);
      return {
        value: fngRecord.value ?? '0',
        value_classification: fngRecord.value_classification ?? 'Neutral',
        timestamp: fngRecord.timestamp ?? 0,
        metadata: fngRecord.metadata ?? {},
      } as FngData;
    } else {
      this.logger.warn(`No FNG data found.`);
      return null;
    }
  }
  
  
    // Get latest price by symbol in USDT
    async getLatestPriceBySymbol(symbol: string, date: number): Promise<TradingViewAlertDto | null> {
      const collection = this.connection.collection(this.tickerCollectionName);
    
      // Convert `date` to a timestamp if needed
      const targetTimestamp = new Date(date).getTime() / 1000;  // Assuming `date` is passed as a UNIX timestamp in seconds

      const result = await collection
        .find({
          symbol,
          time: { $gte: targetTimestamp } // Filter by date, only records on or before the given date
        })
        .sort({ time: -1 }) // Sort by timestamp in descending order to get the latest record before or on the date
        .limit(1)
        .toArray();
    
      if (result.length > 0) {
        const { symbol, price, time, exchange, _id } = result[0];
        // Return as TradingViewAlertDto, excluding _id
        return { symbol, price, time, exchange };
      }
    
      return null;
    }
    

    async createST1Data(st1Data: Partial<ST1Data>): Promise<void> {
      const collection = this.connection.collection(this.st1CollectionName);
      await collection.insertOne(st1Data);
    }

    async getLastST1BySymbol(symbol: string): Promise<ST1Data | null> {
      const collection = this.connection.collection(this.st1CollectionName);
      const result = await collection
        .find({ symbol })
        .sort({ time: -1 }) // Sort by time descending to get the most recent signal
        .limit(1)
        .toArray();
        
        if (result.length > 0) {
          const { signal, exchange, symbol, price, time, target, stop, isDone, _id } = result[0];
          return { signal, exchange, symbol, price, time, target, stop, isDone }; // Map only the required fields
        }
      
        return null;
    }
    
    async updateST1IsDone(id: string, isDone: boolean): Promise<void> {
      const collection = this.connection.collection(this.st1CollectionName);
      const objectId = new ObjectId(id);
      await collection.updateOne({ _id: objectId }, { $set: { isDone } });
    }
    

    async getRSIBySymbolAndDate(symbol: string, date?: number): Promise<RSIData | null> {
      const collection = this.connection.collection(this.rsiCollectionName);
    
      const query: Record<string, any> = { symbol };
      if (date) {
        // If date is provided, fetch RSI data on or before that date
        query.time = { $lte: date };
      }
    
      const result = await collection
        .find(query)
        .sort({ time: -1 }) // Most recent data first
        .limit(1)
        .toArray();
    
      if (result.length > 0) {
        const { symbol: sym, RSI, time } = result[0];
        return { symbol: sym, RSI, time };
      }
    
      return null;
    }

  async getTopCryptosByVolatility(limit: number): Promise<any[]> {
    const collection = this.connection.collection(this.lunarPubCoinCollectionName);
  
    const results = await collection
      .find({ fetched_sort: 'volatility' }) // Filter by fetched_sort: galaxy_score
      .sort({ fetched_at: -1, volatility: -1 }) // Sort by latest fetched_at first, then by galaxy_score in descending order
      .limit(limit)
      .toArray();
  
    return results.map(({ _id, ...rest }) => rest); // Exclude the _id field
  }

   async getTopCryptosByGalaxyScore(limit: number): Promise<any[]> {
    const collection = this.connection.collection(this.lunarPubCoinCollectionName);

    const results = await collection
      .find({ fetched_sort: 'galaxy_score' }) // Filter by fetched_sort: galaxy_score
      .sort({ fetched_at: -1, galaxy_score: -1 }) // Sort by latest fetched_at first, then by galaxy_score in descending order
      .limit(limit)
      .toArray();

    return results.map(({ _id, ...rest }) => rest); // Exclude the _id field
  }
  
  async getTopCryptosByAltRank(limit: number): Promise<any[]> {
    const collection = this.connection.collection(this.lunarPubCoinCollectionName);

    const results = await collection
      .find({ fetched_sort: 'alt_rank' }) // Filter by fetched_sort: alt_rank
      .sort({ fetched_at: -1, alt_rank: -1 }) // Sort by latest fetched_at first, then by alt_rank in descending order
      .limit(limit)
      .toArray();

    return results.map(({ _id, ...rest }) => rest); // Exclude the _id field
  }

  async getMACDBySymbolAndDate(symbol: string, date?: number): Promise<MACDData | null> {
    const collection = this.connection.collection(this.macdCollectionName);
  
    const query: Record<string, any> = { symbol };
    if (date) {
      // If a date is provided, fetch the closest MACD data on or before that date
      query.time = { $lte: date };
    }
  
    const result = await collection
      .find(query)
      .sort({ time: -1 }) // Sort by most recent
      .limit(1)
      .toArray();
  
    if (result.length > 0) {
      const { symbol: sym, MACD, Signal, Histogram, time } = result[0];
      return { symbol: sym, MACD, Signal, Histogram, time };
    }
  
    return null;
  }
  

  async getTopCryptosByPrice(limit: number, date: number): Promise<TradingViewAlertDto[]> {
    const collection = this.connection.collection(this.tickerCollectionName);
  
    const results = await collection.aggregate([
      {
        $match: {
          symbol: /USDT$/, // Match symbols ending in USDT
          time: { $lte: date } // Filter by date, only records on or before the specified date
        }
      },
      { $sort: { time: -1 } }, // Sort by time descending to get the latest record for each date
      {
        $group: {
          _id: "$symbol",
          symbol: { $first: "$symbol" },
          exchange: { $first: "$exchange" },
          price: { $first: "$price" },
          time: { $first: "$time" }
        }
      },
      { $sort: { price: -1 } }, // Sort by price in descending order after grouping
      { $limit: limit } // Limit to the top `limit` cryptos by price
    ]).toArray();
  
    // Map results to TradingViewAlertDto
    return results.map(({ symbol, price, time, exchange }) => ({
      symbol,
      price,
      time,
      exchange,
    }));
  }
  
  async getTopCoinsBySort(sort: string, limit: number): Promise<LunarCrushPublicCoinDto[]> {
    const collection = this.connection.collection(this.lunarPubCoinCollectionName);
  
      const results = await collection
    .find({ fetched_sort: sort })
    .sort({ fetched_at: -1, [sort]: -1 })
    .limit(limit)
    .toArray();
  
    // Map results to exclude `_id` and ensure type consistency
    return results.map((doc) => {
      const { _id, ...rest } = doc;
      return rest as LunarCrushPublicCoinDto;
    });
  }
  
  async getTopCoinsByCategoryAndSort(category: string, sort: string, limit: number): Promise<LunarCrushPublicCoinDto[]> {
    const collection = this.connection.collection(this.lunarPubCoinCollectionName);
  
    const results = await collection
      //.find({ categories: category, fetched_sort: sort }) // Match the category and sort
      .find({ categories: { $in: [category] }, fetched_sort: sort })
      .sort({ [sort]: -1, fetched_at: -1 }) // Sort by the sort field and the latest fetch time
      .limit(limit) // Limit the number of results
      .toArray();
  
    // Map results to exclude `_id` and ensure type consistency
    return results.map((doc) => {
      const { _id, ...rest } = doc;
      return rest as LunarCrushPublicCoinDto;
    });
  }
  

  async createDominanceData(dominanceData: Partial<DominanceData>): Promise<void> {
    const collection = this.connection.collection(this.dominanceCollectionName);
    await collection.insertOne(dominanceData);
  }

  async getDominanceBySymbolAndDate(symbol: string, date: number): Promise<DominanceData | null> {
    const collection = this.connection.collection(this.dominanceCollectionName);

    const result = await collection
      .find({ symbol, time: { $lte: date } }) // Filter by date and symbol
      .sort({ time: -1 }) // Get the latest record before or on the specified date
      .limit(1)
      .toArray();

    if (result.length > 0) {
      const { symbol, dominance, time } = result[0];
      return { symbol, dominance, time } as DominanceData;
    }

    return null;
  }

  

  // Check if a data point with a specific timestamp already exists
  async existsFng(timestamp: number): Promise<boolean> {
    const collection = this.connection.collection(this.fngCollectionName);
    const count = await collection.countDocuments({ timestamp });
    return count > 0;
  }

  async createRSIData(rsiData: Partial<RSIData>): Promise<void> {
    const collection = this.connection.collection(this.rsiCollectionName);
    await collection.insertOne(rsiData);
  }

  async createMACDData(macdData: Partial<MACDData>): Promise<void> {
    const collection = this.connection.collection(this.macdCollectionName);
    await collection.insertOne(macdData);
  }

  async createLunarPubCoin(data: Partial<LunarCrushPublicCoinDto>): Promise<void> {
    const collection = this.connection.collection(this.lunarPubCoinCollectionName);

  // Upsert data to avoid duplicates for the same sort and symbol
  await collection.updateOne(
      { id: data.id, fetched_sort: data.fetched_sort },
      {
        $set: {
          ...data,
          fetched_sort: data.fetched_sort,
          fetched_at: data.fetched_at, // Store the exact fetch time
        },
      },
      { upsert: true }
    );
  }

  async getSortValueForSymbol(symbol: string, sort: string): Promise<{ categories: string; sortValue: number | null }> {
    const collection = this.connection.collection(this.lunarPubCoinCollectionName);
  
    // Find the latest document for this symbol with the requested sort parameter
    const result = await collection
      .find({ symbol: symbol.toUpperCase(), fetched_sort: sort })
      .sort({ fetched_at: -1 })
      .limit(1)
      .toArray();
  
    if (result.length === 0) {
      return { categories: '', sortValue: null };
    }
  
    const doc = result[0];
    return {
      categories: doc.categories || '',
      sortValue: doc[sort] !== undefined ? doc[sort] : null,
    };
  }
  

  async getTopNByIndicator(indicator: 'RSI' | 'MACD', limit: number, date: number): Promise<any[]> {
    let collectionName: string;
    let sortField: string;
  
    // Decide which collection and field to query based on the indicator
    // If you have different indicators, add them here.
    if (indicator === 'RSI') {
      collectionName = this.rsiCollectionName;
      sortField = 'RSI';
    } else if (indicator === 'MACD') {
      collectionName = this.macdCollectionName;
      sortField = 'MACD';
    } else {
      throw new Error(`Unsupported indicator: ${indicator}`);
    }
  
    const collection = this.connection.collection(collectionName);
  
    // We assume you want the top N symbols by the given indicator as of 'date'.
    // Steps:
    // 1. Filter documents up to the given date.
    // 2. Sort by time descending to pick the latest entry per symbol.
    // 3. Group by symbol, picking the latest entry.
    // 4. Sort by the indicator descending.
    // 5. Limit to top N.
  
    const pipeline = [
      {
        $match: {
          time: { $lte: date }
        }
      },
      {
        $sort: {
          time: -1
        }
      },
      {
        $group: {
          _id: "$symbol",
          symbol: { $first: "$symbol" },
          time: { $first: "$time" },
          // Include fields you need. For RSI:
          ...(indicator === 'RSI' ? { RSI: { $first: "$RSI" } } : {}),
          // For MACD:
          ...(indicator === 'MACD' ? { MACD: { $first: "$MACD" }, Signal: { $first: "$Signal" }, Histogram: { $first: "$Histogram" } } : {})
        }
      },
      {
        $sort: {
          [sortField]: -1
        }
      },
      {
        $limit: limit
      }
    ];
  
    const results = await collection.aggregate(pipeline).toArray();
    return results;
  }
  

  /**
   * Get top N cryptos by RSI on or before the specified date.
   * Assumes RSIData collection has {symbol, RSI, time} and you want to sort by RSI descending.
   */
  async getTopNRSIByDate(n: number, date: string): Promise<RSIData[]> {
    const collection = this.connection.collection(this.rsiCollectionName);
    const targetTimestamp = new Date(date).getTime() / 1000;
    
    const results = await collection
      .find({ time: { $lte: targetTimestamp } })
      .sort({ RSI: -1, time: -1 }) // Sort by RSI descending, then by most recent time
      .limit(n)
      .toArray();

    return results.map(({ symbol, RSI, time }) => ({ symbol, RSI, time }));
  }

  /**
   * Get top N cryptos by MACD on or before the specified date.
   * Assumes MACDData collection has {symbol, MACD, Signal, Histogram, time} and you want to sort by MACD descending.
   */
  async getTopNMACDByDate(n: number, date: string): Promise<MACDData[]> {
    const collection = this.connection.collection(this.macdCollectionName);
    const targetTimestamp = new Date(date).getTime() / 1000;

    const results = await collection
      .find({ time: { $lte: targetTimestamp } })
      .sort({ MACD: -1, time: -1 }) // Sort by MACD descending, then by most recent time
      .limit(n)
      .toArray();
    
    return results.map(({ symbol, MACD, Signal, Histogram, time }) => ({
      symbol, MACD, Signal, Histogram, time
    }));
  }

  
  

}
