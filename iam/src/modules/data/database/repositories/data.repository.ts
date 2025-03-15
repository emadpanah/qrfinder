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
import { LunarCrushNewsDto } from '../dto/lunarcrush-news.dto';
import { UserChatLogDto } from '../dto/userchatlog.dto';
import { ADXData } from '../schema/adx.schema';
import { StochasticData } from '../schema/stochastic.schema';
import { EMAData } from '../schema/ema.schema';
import { SMAData } from '../schema/sma.schema';
import { CCIData } from '../schema/cci.schema';
import { CCIDto, EMADto, RSIDto, StochasticDto } from '../dto/rsi.dto';
import { MACDDto } from '../dto/macd.dto';
import { ADXDto } from '../dto/adx.dto';
import { isValidUnixTimestamp, sanitizeString } from 'src/shared/helper';
import { ST1Dto } from '../dto/st1.dto';

@Injectable()
export class DataRepository {
  private readonly emaCollectionName = '_emadata';
  private readonly smaCollectionName = '_smadata';
  private readonly stochasticCollectionName = '_stochasticdata';
  private readonly cciCollectionName = '_ccidata';
  private readonly userchatlogCollectionName = '_userchatlogdata';
  private readonly adxCollectionName = '_adxdata';
  private readonly fngCollectionName = '_fngdata';
  private readonly tickerCollectionName = '_tickerdata';
  private readonly rsiCollectionName = '_rsidata';
  private readonly macdCollectionName = '_macddata';
  private readonly st1CollectionName = '_st1data';
  private readonly dominanceCollectionName = '_dominancedata';
  private readonly lunarPubCoinCollectionName = '_lunarpublicoindata';
  private readonly lunarNewsCollectionName = "_lunarpublicnewsdata";
  private readonly translationCollectionName = '_translationsdata';
  private readonly logger = new Logger(DataRepository.name);

  constructor(@InjectConnection('service') private readonly connection: Connection) { }


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


  // async getLast7DaysFngData(endDate: number): Promise<FngData[]> {
  //   const collection = this.connection.collection(this.fngCollectionName);
  //   const results: FngData[] = [];

  //   for (let i = 0; i < 7; i++) {
  //     const targetDateStart = endDate - i * 24 * 60 * 60; // Start of the target day
  //     const targetDateEnd = targetDateStart + 24 * 60 * 60; // End of the target day

  //     // Query the latest FNG value within the day
  //     const result = await collection
  //       .find({
  //         timestamp: { $gte: targetDateStart, $lt: targetDateEnd },
  //       })
  //       .sort({ timestamp: -1 }) // Sort by timestamp descending
  //       .limit(1) // Get only the latest record for the day
  //       .toArray();

  //     if (result.length > 0) {
  //       const fngRecord = result[0];
  //       results.push({
  //         value: fngRecord.value ?? '0',
  //         value_classification: fngRecord.value_classification ?? 'Neutral',
  //         timestamp: fngRecord.timestamp ?? 0,
  //         metadata: fngRecord.metadata ?? {},
  //       } as FngData);
  //     }
  //   }

  //   return results;
  // }

  async getLast7DaysFngDataOptimized(endDate: number): Promise<FngData[]> {
    const collection = this.connection.collection(this.fngCollectionName);

    const startOfRange = endDate - 6 * 24 * 60 * 60; // Calculate the start of the range (7 days back)
    const data = await collection
      .aggregate([
        {
          $match: {
            timestamp: { $gte: startOfRange, $lte: endDate }, // Filter records in the last 7 days
          },
        },
        {
          $group: {
            _id: {
              day: { $dayOfYear: { $toDate: { $multiply: ['$timestamp', 1000] } } },
            },
            latestTimestamp: { $max: '$timestamp' }, // Get the latest timestamp for each day
          },
        },
        {
          $lookup: {
            from: '_fngdata',
            localField: 'latestTimestamp',
            foreignField: 'timestamp',
            as: 'data',
          },
        },
        {
          $unwind: '$data', // Flatten the result
        },
        {
          $replaceRoot: { newRoot: '$data' }, // Replace the root with the actual data
        },
        {
          $sort: { timestamp: -1 }, // Sort the results by timestamp (optional)
        },
      ])
      .toArray();

    // Map the data to match the FngData structure
    return data.map((doc) => ({
      value: doc.value || '0',
      value_classification: doc.value_classification || 'Neutral',
      timestamp: doc.timestamp || 0,
    }));
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

  async createEMAData(emaData: Partial<EMAData>): Promise<void> {
    const collection = this.connection.collection(this.emaCollectionName);
    await collection.insertOne(emaData);
  }

  async createSMAData(smaData: Partial<SMAData>): Promise<void> {
    const collection = this.connection.collection(this.smaCollectionName);
    await collection.insertOne(smaData);
  }

  async createStochasticData(stochasticData: Partial<StochasticData>): Promise<void> {
    const collection = this.connection.collection(this.stochasticCollectionName);
    await collection.insertOne(stochasticData);
  }

  async createCCIData(cciData: Partial<CCIData>): Promise<void> {
    const collection = this.connection.collection(this.cciCollectionName);
    await collection.insertOne(cciData);
  }

  async getEMABySymbolAndDate(symbol: string, date?: number): Promise<EMAData | null> {
    const collection = this.connection.collection(this.emaCollectionName);
    return this.getIndicatorBySymbolAndDate<EMAData>(collection, symbol, date);
  }

  async getSMABySymbolAndDate(symbol: string, date?: number): Promise<SMAData | null> {
    const collection = this.connection.collection(this.smaCollectionName);
    return this.getIndicatorBySymbolAndDate<SMAData>(collection, symbol, date);
  }

  async getStochasticBySymbolAndDate(symbol: string, date?: number): Promise<StochasticData | null> {
    const collection = this.connection.collection(this.stochasticCollectionName);
    return this.getIndicatorBySymbolAndDate<StochasticData>(collection, symbol, date);
  }

  async getCCIBySymbolAndDate(symbol: string, date?: number): Promise<CCIData | null> {
    const collection = this.connection.collection(this.cciCollectionName);
    return this.getIndicatorBySymbolAndDate<CCIData>(collection, symbol, date);
  }

  // Helper for common fetch logic
  private async getIndicatorBySymbolAndDate<T>(
    collection: any,
    symbol: string,
    date?: number
  ): Promise<T | null> {
    const query: Record<string, any> = { symbol };
    if (date) query.time = { $lte: date };

    const result = await collection.find(query).sort({ time: -1 }).limit(1).toArray();
    return result.length > 0 ? result[0] : null;
  }

  // async getLast7DaysDailyPriceOptimized(symbol: string, endDate: number): Promise<TradingViewAlertDto[]> {
  //   const collection = this.connection.collection(this.tickerCollectionName);

  //   const startOfRange = endDate - 6 * 24 * 60 * 60; // 7 days in seconds

  //   // Fetch the latest record per day for the given symbol and time range
  //   const data = await collection
  //     .aggregate([
  //       {
  //         $match: {
  //           symbol,
  //           time: { $gte: startOfRange, $lte: endDate },
  //         },
  //       },
  //       {
  //         $addFields: {
  //           day: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: { $multiply: ["$time", 1000] } } } },
  //         },
  //       },
  //       {
  //         $sort: { time: -1 }, // Sort by time descending to get the latest record per day
  //       },
  //       {
  //         $group: {
  //           _id: "$day",
  //           latest: { $first: "$$ROOT" }, // Pick the first record for each group (latest)
  //         },
  //       },
  //       {
  //         $replaceRoot: { newRoot: "$latest" }, // Unwrap the latest field
  //       },
  //       {
  //         $sort: { time: 1 }, // Sort by time ascending for chronological order
  //       },
  //     ])
  //     .toArray();

  //   return data.map(({ symbol, price, time, exchange }) => ({
  //     symbol,
  //     price,
  //     time,
  //     exchange,
  //   }));
  // }

  async getLast7DaysDailyPriceOptimized(symbol: string, endDate: number): Promise<TradingViewAlertDto[]> {
    const collection = this.connection.collection(this.tickerCollectionName);

    const startOfRange = endDate - 6 * 24 * 60 * 60; // 7 days in seconds

    // Fetch the highest price per day for the given symbol and time range
    const data = await collection
      .aggregate([
        {
          $match: {
            symbol,
            time: { $gte: startOfRange, $lte: endDate }, // Filter for the given range
          },
        },
        {
          $addFields: {
            day: { 
              $dateToString: { 
                format: "%Y-%m-%d", 
                date: { $toDate: { $multiply: ["$time", 1000] } } // Extract day as string
              } 
            },
          },
        },
        {
          $sort: { price: -1 }, // Sort by price descending to get the highest price per day
        },
        {
          $group: {
            _id: "$day", // Group by the extracted day
            highestRecord: { $first: "$$ROOT" }, // Take the first record (highest price of the day)
          },
        },
        {
          $replaceRoot: { newRoot: "$highestRecord" }, // Replace root with the highest record
        },
        {
          $sort: { time: 1 }, // Sort by time ascending for chronological order
        },
      ])
      .toArray();

    // Map the results to the TradingViewAlertDto format
    return data.map(({ symbol, price, time, exchange }) => ({
      symbol,
      price,
      time,
      exchange,
    }));
}



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

  async getAllST1Signals(): Promise<ST1Data[]> {
    const collection = this.connection.collection(this.st1CollectionName);
    const signals = await collection.find().toArray();
    return signals.map(signal => ({
      _id: signal._id.toString(),
      signal: signal.signal,
      exchange: signal.exchange,
      symbol: signal.symbol,
      price: signal.price,
      time: signal.time,
      target: signal.target,
      stop: signal.stop,
      isDone: signal.isDone,
    }));
  }

  async createST1Data(st1Data: ST1Dto): Promise<void> {
    const collection = this.connection.collection(this.st1CollectionName);
    await collection.insertOne(st1Data);
  }

  async getLastST1BySymbol(symbol: string): Promise<ST1Dto | null> {
    const collection = this.connection.collection(this.st1CollectionName);
    const result = await collection
      .find({ symbol })
      .sort({ time: -1 }) // Sort by time descending to get the most recent signal
      .limit(1)
      .toArray();

    if (result.length > 0) {
      const { signal, exchange, symbol, price, time, target, stop, isDone, _id } = result[0];
      return { signal, exchange, symbol, price, time, target, stop, isDone, _id }; // Map only the required fields
    }

    return null;
  }

  async updateST1IsDone(id: string, isDone: boolean): Promise<void> {
    const collection = this.connection.collection(this.st1CollectionName);
    const objectId = new ObjectId(id);
    await collection.updateOne({ _id: objectId as any }, { $set: { isDone } });
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
      .find({ categories: { $regex: category }, fetched_sort: sort })
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
  async getSortValueForSymbol(symbol: string, sort: string): Promise<LunarCrushPublicCoinDto | null> {
    const collection = this.connection.collection(this.lunarPubCoinCollectionName);

    // Find the latest document for this symbol with the requested sort parameter
    const result = await collection
      .find({ symbol: symbol.toUpperCase(), fetched_sort: sort })
      .sort({ fetched_at: -1 })
      .limit(1)
      .toArray();

    if (result.length === 0) {
      return null;
    }

    const doc = result[0];

    return {
      id: doc.id,
      symbol: doc.symbol,
      name: doc.name,
      price: doc.price,
      price_btc: doc.price_btc,
      volume_24h: doc.volume_24h,
      volatility: doc.volatility,
      circulating_supply: doc.circulating_supply,
      max_supply: doc.max_supply,
      percent_change_1h: doc.percent_change_1h,
      percent_change_24h: doc.percent_change_24h,
      percent_change_7d: doc.percent_change_7d,
      market_cap: doc.market_cap,
      market_cap_rank: doc.market_cap_rank,
      interactions_24h: doc.interactions_24h,
      social_volume_24h: doc.social_volume_24h,
      social_dominance: doc.social_dominance,
      market_dominance: doc.market_dominance,
      galaxy_score: doc.galaxy_score,
      galaxy_score_previous: doc.galaxy_score_previous,
      alt_rank: doc.alt_rank,
      alt_rank_previous: doc.alt_rank_previous,
      sentiment: doc.sentiment,
      categories: doc.categories,
      blockchains: doc.blockchains,
      percent_change_30d: doc.percent_change_30d,
      last_updated_price: doc.last_updated_price,
      topic: doc.topic,
      logo: doc.logo,
      fetched_sort: doc.fetched_sort,
      fetched_at: doc.fetched_at,
    };
  }

  async getSortValueForSymbols(
    symbols: string[],
    sort: string
  ): Promise<(LunarCrushPublicCoinDto | null)[]> {
    const collection = this.connection.collection(this.lunarPubCoinCollectionName);

    // Convert symbols to uppercase for consistent querying
    const upperSymbols = symbols.map((s) => s.toUpperCase());

    // Query all symbols in one go, fetching the latest document for each symbol
    const pipeline = [
      { $match: { symbol: { $in: upperSymbols }, fetched_sort: sort } },
      { $sort: { symbol: 1, fetched_at: -1 } },
      {
        $group: {
          _id: "$symbol",
          doc: { $first: "$$ROOT" },
        },
      },
    ];

    const docs = await collection.aggregate(pipeline).toArray();

    // Create a map for quick lookup
    const docMap: { [symbol: string]: any } = {};
    docs.forEach((d) => {
      docMap[d._id] = d.doc;
    });

    // Map results to the required format
    return symbols.map((symbol) => {
      const upperSymbol = symbol.toUpperCase();
      const doc = docMap[upperSymbol];
      if (!doc) {
        return null;
      }
      return {
        id: doc.id,
        symbol: doc.symbol,
        name: doc.name,
        price: doc.price,
        price_btc: doc.price_btc,
        volume_24h: doc.volume_24h,
        volatility: doc.volatility,
        circulating_supply: doc.circulating_supply,
        max_supply: doc.max_supply,
        percent_change_1h: doc.percent_change_1h,
        percent_change_24h: doc.percent_change_24h,
        percent_change_7d: doc.percent_change_7d,
        market_cap: doc.market_cap,
        market_cap_rank: doc.market_cap_rank,
        interactions_24h: doc.interactions_24h,
        social_volume_24h: doc.social_volume_24h,
        social_dominance: doc.social_dominance,
        market_dominance: doc.market_dominance,
        galaxy_score: doc.galaxy_score,
        galaxy_score_previous: doc.galaxy_score_previous,
        alt_rank: doc.alt_rank,
        alt_rank_previous: doc.alt_rank_previous,
        sentiment: doc.sentiment,
        categories: doc.categories || '',
        blockchains: doc.blockchains || [],
        percent_change_30d: doc.percent_change_30d,
        last_updated_price: doc.last_updated_price,
        topic: doc.topic,
        logo: doc.logo,
        fetched_sort: doc.fetched_sort,
        fetched_at: doc.fetched_at,
      };
    });
  }

  //this method is for analyzing 
  async getAllSortsForSymbol(symbol: string): Promise<Record<string, any>> {
    const transformedSymbol = symbol.replace(/USDT$/, ''); // Remove 'USDT' from the symbol
    const collection = this.connection.collection(this.lunarPubCoinCollectionName);
    console.log("symbol : ", transformedSymbol);
    const results = await collection
      .find({ symbol: transformedSymbol.toUpperCase() }) // Use transformed symbol
      .sort({ fetched_at: -1 })
      .limit(1)
      .toArray();

    if (results.length === 0) {
      return {};
    }

    const data = results[0];
    return {
      price: data.price || 0,
      volume_24h: data.volume_24h || 0,
      volatility: data.volatility || 0,
      circulating_supply: data.circulating_supply || 0,
      max_supply: data.max_supply || 0,
      percent_change_1h: data.percent_change_1h || 0,
      percent_change_24h: data.percent_change_24h || 0,
      percent_change_7d: data.percent_change_7d || 0,
      percent_change_30d: data.percent_change_30d || 0,
      market_cap: data.market_cap || 0,
      market_cap_rank: data.market_cap_rank || 0,
      interactions_24h: data.interactions_24h || 0,
      social_volume_24h: data.social_volume_24h || 0,
      social_dominance: data.social_dominance || 0,
      market_dominance: data.market_dominance || 0,
      market_dominance_prev: data.market_dominance_prev || 0,
      galaxy_score: data.galaxy_score || 0,
      galaxy_score_previous: data.galaxy_score_previous || 0,
      alt_rank: data.alt_rank || 0,
      alt_rank_previous: data.alt_rank_previous || 0,
      sentiment: data.sentiment || 0,
    };
  }

  // async getLast7DaysDailyIndicator(
  //   symbol: string,
  //   indicator: 'RSI' | 'MACD' | 'ADX' | 'EMA' | 'SMA' | 'Stochastic' | 'CCI',
  //   endDate: number
  // ): Promise<{ value: number | object; time: number }[]> {
  //   let collectionName: string;

  //   // Determine the collection name based on the indicator type
  //   if (indicator === 'RSI') {
  //     collectionName = this.rsiCollectionName;
  //   } else if (indicator === 'MACD') {
  //     collectionName = this.macdCollectionName;
  //   } else if (indicator === 'ADX') {
  //     collectionName = this.adxCollectionName;
  //   } else if (indicator === 'EMA') {
  //     collectionName = this.emaCollectionName;
  //   } else if (indicator === 'SMA') {
  //     collectionName = this.smaCollectionName;
  //   } else if (indicator === 'Stochastic') {
  //     collectionName = this.stochasticCollectionName;
  //   } else if (indicator === 'CCI') {
  //     collectionName = this.cciCollectionName;
  //   } else {
  //     throw new Error(`Unsupported indicator: ${indicator}`);
  //   }

  //   const collection = this.connection.collection(collectionName);
  //   const results: { value: number | object; time: number }[] = [];

  //   // Loop through the last 7 days
  //   for (let i = 0; i < 7; i++) {
  //     const targetDateStart = endDate - i * 24 * 60 * 60; // Start of the target day
  //     const targetDateEnd = targetDateStart + 24 * 60 * 60; // End of the target day

  //     // Get the last recorded indicator value within the target day
  //     const result = await collection
  //       .find({
  //         symbol,
  //         time: { $gte: targetDateStart, $lt: targetDateEnd }, // Filter records within the target day
  //       })
  //       .sort({ time: -1 }) // Sort by time descending
  //       .limit(1) // Get only the latest record for the day
  //       .toArray();

  //     if (result.length > 0) {
  //       const { time, ...rest } = result[0]; // Exclude unnecessary fields
  //       results.push({ value: rest[indicator.toLowerCase()] || rest, time });
  //     }
  //   }

  //   return results;
  // }

  // async getLast7DaysDailyIndicator(
  //   symbol: string,
  //   indicator: 'RSI' | 'MACD' | 'ADX' | 'EMA' | 'SMA' | 'Stochastic' | 'CCI',
  //   endDate: number
  // ): Promise<{ value: number | object; time: number }[]> {
  //   const collectionMap: Record<string, string> = {
  //     RSI: this.rsiCollectionName,
  //     MACD: this.macdCollectionName,
  //     ADX: this.adxCollectionName,
  //     EMA: this.emaCollectionName,
  //     SMA: this.smaCollectionName,
  //     Stochastic: this.stochasticCollectionName,
  //     CCI: this.cciCollectionName,
  //   };

  //   const collectionName = collectionMap[indicator];
  //   if (!collectionName) {
  //     throw new Error(`Unsupported indicator: ${indicator}`);
  //   }

  //   const collection = this.connection.collection(collectionName);
  //   const startDate = endDate - 6 * 24 * 60 * 60; // Calculate start date for the range

  //   // MongoDB aggregation pipeline
  //   const results = await collection
  //     .aggregate([
  //       {
  //         $match: {
  //           symbol,
  //           time: { $gte: startDate, $lt: endDate + 24 * 60 * 60 }, // Range filter
  //         },
  //       },
  //       {
  //         $addFields: {
  //           day: {
  //             $dateToString: { format: "%Y-%m-%d", date: { $toDate: { $multiply: ["$time", 1000] } } },
  //           },
  //         },
  //       },
  //       {
  //         $sort: { time: -1 }, // Sort by time descending
  //       },
  //       {
  //         $group: {
  //           _id: "$day",
  //           latestRecord: { $first: "$$ROOT" }, // Get the latest record per day
  //         },
  //       },
  //       {
  //         $replaceRoot: { newRoot: "$latestRecord" }, // Flatten the result structure
  //       },
  //       {
  //         $project: {
  //           value: `$${indicator.toLowerCase()}`,
  //           time: 1,
  //         },
  //       },
  //       { $sort: { time: -1 } }, // Ensure results are sorted by time
  //     ])
  //     .toArray();

  //   return results;
  // }


  // async getLast7DaysDailyIndicator(
  //   symbol: string,
  //   indicator: 'RSI' | 'MACD' | 'ADX' | 'EMA' | 'SMA' | 'Stochastic' | 'CCI',
  //   endDate: number
  // ): Promise<IndicatorResult[]> {
  //   const collectionMap: Record<string, string> = {
  //     RSI: this.rsiCollectionName,
  //     MACD: this.macdCollectionName,
  //     ADX: this.adxCollectionName,
  //     EMA: this.emaCollectionName,
  //     SMA: this.smaCollectionName,
  //     Stochastic: this.stochasticCollectionName,
  //     CCI: this.cciCollectionName,
  //   };

  //   const collectionName = collectionMap[indicator];
  //   if (!collectionName) {
  //     throw new Error(`Unsupported indicator: ${indicator}`);
  //   }

  //   const collection = this.connection.collection(collectionName);
  //   const startDate = endDate - 6 * 24 * 60 * 60; // Calculate start date for the range

  //   const results = await collection
  //     .aggregate([
  //       {
  //         $match: {
  //           symbol,
  //           time: { $gte: startDate, $lt: endDate + 24 * 60 * 60 }, // Range filter
  //         },
  //       },
  //       {
  //         $addFields: {
  //           day: {
  //             $dateToString: { format: "%Y-%m-%d", date: { $toDate: { $multiply: ["$time", 1000] } } },
  //           },
  //         },
  //       },
  //       {
  //         $sort: { time: -1 }, // Sort by time descending
  //       },
  //       {
  //         $group: {
  //           _id: "$day",
  //           latestRecord: { $first: "$$ROOT" }, // Get the latest record per day
  //         },
  //       },
  //       {
  //         $replaceRoot: { newRoot: "$latestRecord" }, // Flatten the result structure
  //       },
  //       {
  //         $project: {
  //           value: `$${indicator.toLowerCase()}`,
  //           time: 1,
  //         },
  //       },
  //       { $sort: { time: -1 } }, // Ensure results are sorted by time
  //     ])
  //     .toArray();

  //   // Typecast results to match the expected type
  //   return results as IndicatorResult[];
  // }

  async getLast7DaysRSI(symbol: string, endDate: number): Promise<RSIDto[]> {
    const collection = this.connection.collection(this.rsiCollectionName);
    const startOfRange = endDate - 6 * 24 * 60 * 60; // 7 days in seconds

    const data = await collection
      .aggregate([
        {
          $match: {
            symbol,
            time: { $gte: startOfRange, $lte: endDate },
          },
        },
        {
          $addFields: {
            day: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: { $multiply: ["$time", 1000] } } } },
          },
        },
        {
          $sort: { time: -1 },
        },
        {
          $group: {
            _id: "$day",
            latest: { $first: "$$ROOT" },
          },
        },
        {
          $replaceRoot: { newRoot: "$latest" },
        },
        {
          $sort: { time: 1 },
        },
      ])
      .toArray();

    return data.map(({ time, RSI, symbol }) => ({
      time,
      RSI,
      symbol
    }));
  }

  async getLast7DaysMACD(symbol: string, endDate: number): Promise<MACDDto[]> {
    const collection = this.connection.collection(this.macdCollectionName);
    const startOfRange = endDate - 6 * 24 * 60 * 60;

    const data = await collection
      .aggregate([
        {
          $match: {
            symbol,
            time: { $gte: startOfRange, $lte: endDate },
          },
        },
        {
          $addFields: {
            day: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: { $multiply: ["$time", 1000] } } } },
          },
        },
        {
          $sort: { time: -1 },
        },
        {
          $group: {
            _id: "$day",
            latest: { $first: "$$ROOT" },
          },
        },
        {
          $replaceRoot: { newRoot: "$latest" },
        },
        {
          $sort: { time: 1 },
        },
      ])
      .toArray();

    return data.map(({ time, MACD, Signal, Histogram, symbol }) => ({
      time,
      MACD, Signal, Histogram, symbol
    }));
  }

  async getLast7DaysADX(symbol: string, endDate: number): Promise<ADXDto[]> {
    const collection = this.connection.collection(this.adxCollectionName);
    const startOfRange = endDate - 6 * 24 * 60 * 60;

    const data = await collection
      .aggregate([
        {
          $match: {
            symbol,
            time: { $gte: startOfRange, $lte: endDate },
          },
        },
        {
          $addFields: {
            day: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: { $multiply: ["$time", 1000] } } } },
          },
        },
        {
          $sort: { time: -1 },
        },
        {
          $group: {
            _id: "$day",
            latest: { $first: "$$ROOT" },
          },
        },
        {
          $replaceRoot: { newRoot: "$latest" },
        },
        {
          $sort: { time: 1 },
        },
      ])
      .toArray();

    return data.map(({ time, adx_value, price, symbol }) => ({
      time,
      adx_value,
      price,
      symbol
    }));
  }

  async getLast7DaysEMA(symbol: string, endDate: number): Promise<EMADto[]> {
    const collection = this.connection.collection(this.emaCollectionName);
    const startOfRange = endDate - 6 * 24 * 60 * 60;

    const data = await collection
      .aggregate([
        {
          $match: {
            symbol,
            time: { $gte: startOfRange, $lte: endDate },
          },
        },
        {
          $addFields: {
            day: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: { $multiply: ["$time", 1000] } } } },
          },
        },
        {
          $sort: { time: -1 },
        },
        {
          $group: {
            _id: "$day",
            latest: { $first: "$$ROOT" },
          },
        },
        {
          $replaceRoot: { newRoot: "$latest" },
        },
        {
          $sort: { time: 1 },
        },
      ])
      .toArray();

    return data.map(({ time, ema_value, symbol, price }) => ({
      time,
      ema_value,
      price,
      symbol
    }));
  }
  async getLast7DaysStochastic(symbol: string, endDate: number): Promise<StochasticDto[]> {
    const collection = this.connection.collection(this.stochasticCollectionName);
    const startOfRange = endDate - 6 * 24 * 60 * 60;

    const data = await collection
      .aggregate([
        {
          $match: {
            symbol,
            time: { $gte: startOfRange, $lte: endDate },
          },
        },
        {
          $addFields: {
            day: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: { $multiply: ["$time", 1000] } } } },
          },
        },
        {
          $sort: { time: -1 },
        },
        {
          $group: {
            _id: "$day",
            latest: { $first: "$$ROOT" },
          },
        },
        {
          $replaceRoot: { newRoot: "$latest" },
        },
        {
          $sort: { time: 1 },
        },
      ])
      .toArray();

    return data.map(({ time, k_value, d_value, symbol, price }) => ({
      time,
      k_value,
      d_value,
      symbol,
      price
    }));
  }


  async getLast7DaysCCI(symbol: string, endDate: number): Promise<CCIDto[]> {
    const collection = this.connection.collection(this.cciCollectionName);
    const startOfRange = endDate - 6 * 24 * 60 * 60; // 7 days in seconds

    const data = await collection
      .aggregate([
        {
          $match: {
            symbol,
            time: { $gte: startOfRange, $lte: endDate },
          },
        },
        {
          $addFields: {
            day: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: { $multiply: ["$time", 1000] } } } },
          },
        },
        {
          $sort: { time: -1 },
        },
        {
          $group: {
            _id: "$day",
            latest: { $first: "$$ROOT" },
          },
        },
        {
          $replaceRoot: { newRoot: "$latest" },
        },
        {
          $sort: { time: 1 },
        },
      ])
      .toArray();

    return data.map(({ time, cci_value, price, symbol }) => ({
      time,
      cci_value,
      price,
      symbol
    }));
  }


  async getTopNByIndicator(
    indicator: 'RSI' | 'MACD' | 'ADX' | 'EMA' | 'SMA' | 'Stochastic' | 'CCI',
    limit: number,
    date: number
  ): Promise<any[]> {
    let collectionName: string;
    let sortField: string;

    if (indicator === 'RSI') {
      collectionName = this.rsiCollectionName;
      sortField = 'RSI';
    } else if (indicator === 'MACD') {
      collectionName = this.macdCollectionName;
      sortField = 'MACD';
    } else if (indicator === 'ADX') {
      collectionName = this.adxCollectionName;
      sortField = 'ADX';
    } else if (indicator === 'EMA') {
      collectionName = this.emaCollectionName;
      sortField = 'ema_value';
    } else if (indicator === 'SMA') {
      collectionName = this.smaCollectionName;
      sortField = 'sma_value';
    } else if (indicator === 'Stochastic') {
      collectionName = this.stochasticCollectionName;
      sortField = 'k_value';
    } else if (indicator === 'CCI') {
      collectionName = this.cciCollectionName;
      sortField = 'cci_value';
    } else {
      throw new Error(`Unsupported indicator: ${indicator}`);
    }
    const lim = limit || 10; // Default limit to 10 if not provided
    const collection = this.connection.collection(collectionName);

    // Build the query
    const query = date ? { time: { $lte: date } } : {};

    // Fetch data, sorted by time (descending) and indicator value (descending)
    return collection
      .find(query)
      .sort({ time: -1, [sortField]: -1 })
      .limit(lim)
      .toArray();
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


  // Method to create LunarCrush news documents
  async createLunarNews(newsData: Partial<LunarCrushNewsDto>): Promise<void> {
    const collection = this.connection.collection(this.lunarNewsCollectionName);
    // // Upsert the news item by its id
    // await collection.updateOne(
    //   { id: newsData.id },
    //   { $set: { ...newsData } },
    //   { upsert: true }
    // );
    await collection.insertOne(newsData);
  }

  // src/modules/data/database/repositories/data.repository.ts
  async getLatestNews(limit = 50, title: string): Promise<any[]> {
    const collection = this.connection.collection(this.lunarNewsCollectionName);

    // Regular expression to match substrings within words, e.g., "doge" or "dogecoin"
    const regex = new RegExp(`\\b${title}`, 'i'); // '\\b' ensures word boundary matching

    return await collection
      .find({ post_title: { $regex: regex } }) // Case-insensitive search
      .sort({ post_created: -1 }) // Sort by creation date descending
      .limit(Math.min(limit, 10)) // Enforce max limit = 10
      .toArray();
  }

  async getTopNewsByInteractions(limit = 50, title: string): Promise<any[]> {
    const collection = this.connection.collection(this.lunarNewsCollectionName);

    // Regular expression to match substrings within words, e.g., "doge" or "dogecoin"
    const regex = new RegExp(`\\b${title}`, 'i'); // '\\b' ensures word boundary matching

    return await collection
      .find({ post_title: { $regex: regex } }) // Case-insensitive search
      .sort({ interactions_24h: -1 }) // Sort by interactions descending
      .limit(Math.min(limit, 10))
      .toArray();
  }

  async searchNewsByTitle(title: string, limit = 50): Promise<any[]> {
    const collection = this.connection.collection(this.lunarNewsCollectionName);

    // Regular expression to match substrings within words, e.g., "doge" or "dogecoin"
    const regex = new RegExp(`\\b${title}`, 'i'); // '\\b' ensures word boundary matching

    return await collection
      .find({ post_title: { $regex: regex } }) // Case-insensitive search
      .sort({ post_created: -1 }) // Sort by creation date descending
      .limit(Math.min(limit, 10)) // Cap at 10 results
      .toArray();
  }

  async getNewsWithHighSentiment(limit = 50, title: string): Promise<any[]> {
    const collection = this.connection.collection(this.lunarNewsCollectionName);
    // Regular expression to match substrings within words, e.g., "doge" or "dogecoin"
    const regex = new RegExp(`\\b${title}`, 'i'); // '\\b' ensures word boundary matching
    return await collection
      .find({ post_title: { $regex: regex } }) // Case-insensitive search
      .sort({ post_sentiment: -1 }) // Sort by sentiment descending
      .limit(Math.min(limit, 10)) // Limit results to 10 max
      .toArray();
  }

  async getTranslation(contentId: string, language: string): Promise<string | null> {
    const collection = this.connection.collection(this.translationCollectionName);
    const result = await collection.findOne({ contentId });
    if (result && result.translations && result.translations[language]) {
      this.logger.log(`Translation found in DB for contentId: ${contentId}, Language: ${language}`);
      return result.translations[language];
    }
    this.logger.warn(`No translation found in DB for contentId: ${contentId}, Language: ${language}`);
    return null;
  }

  // async saveUserChatLog(log: UserChatLogDto): Promise<void> {
  //   const collection = this.connection.collection(this.userchatlogCollectionName);
  //   await collection.insertOne(log);
  // }

  
async saveUserChatLog(log: UserChatLogDto): Promise<void> {
  // Validate all required fields
  if (!log.telegramId || typeof log.telegramId !== 'string') {
    throw new Error('Invalid telegramId');
  }
  if (!log.query || typeof log.query !== 'string') {
    throw new Error('Invalid query');
  }
  if (!log.response || typeof log.response !== 'string') {
    throw new Error('Invalid response');
  }
  if (!log.queryType || typeof log.queryType !== 'string') {
    throw new Error('Invalid queryType');
  }
  if (!isValidUnixTimestamp(log.save_at)) {
    throw new Error('Invalid save_at timestamp');
  }

  // Sanitize all string fields to prevent injection
  log.telegramId = sanitizeString(log.telegramId, 100);
  log.query = sanitizeString(log.query, 1000);
  log.response = sanitizeString(log.response, 2500);
  log.queryType = sanitizeString(log.queryType, 100);

  // Optional fields validation
  if (log.calledFunction && typeof log.calledFunction !== 'string') {
    throw new Error('Invalid calledFunction');
  }
  if (log.calledFunction) {
    log.calledFunction = sanitizeString(log.calledFunction, 100);
  }

  if (log.parameters && typeof log.parameters !== 'object') {
    throw new Error('Invalid parameters');
  }
  if (log.newParameters && typeof log.newParameters !== 'object') {
    throw new Error('Invalid newParameters');
  }

  // Proceed to save the sanitized and validated data
  const collection = this.connection.collection(this.userchatlogCollectionName);
  await collection.insertOne(log);
}


  async getChatHistory(telegramId: string, limit: number = 5): Promise<UserChatLogDto[]> {
    try {
      const collection = this.connection.collection(this.userchatlogCollectionName);
      const results = await collection
        .find({ telegramId })
        .sort({ save_at: -1 }) // Most recent chats first
        .limit(limit)
        .toArray();

      return results.map((result) => ({
        telegramId: result.telegramId as string,
        query: result.query as string,
        response: result.response as string,
        calledFunction: result.calledFunction as string,
        parameters: result.parameters as Record<string, any>,
        newParameters: result.newParameters as Record<string, any>,
        queryType: result.queryType as 'in-scope' | 'out-of-scope',
        save_at: result.save_at as number,
      }));
    } catch (error) {
      this.logger.error('Failed to retrieve chat history:', error);
      throw error;
    }
  }

  async createADXData(adxData: Partial<ADXData>): Promise<void> {
    const collection = this.connection.collection(this.adxCollectionName);
    await collection.insertOne(adxData);
  }

  async getADXBySymbolAndDate(symbol: string, date?: number): Promise<ADXData | null> {
    const collection = this.connection.collection(this.adxCollectionName);

    const query: Record<string, any> = { symbol };
    if (date) {
      query.time = { $lte: date };
    }

    const result = await collection
      .find(query)
      .sort({ time: -1 })
      .limit(1)
      .toArray();

    if (result.length > 0) {
      const { symbol, adx_value, price, time } = result[0];
      return { symbol, adx_value, price, time };
    }

    return null;
  }

  async saveTranslation(
    contentId: string,
    originalText: string,
    language: string,
    translatedText: string,
  ): Promise<void> {
    const collection = this.connection.collection(this.translationCollectionName);

    const existingRecord = await collection.findOne({ contentId });

    if (existingRecord) {
      // Update existing translation
      const translations = existingRecord.translations || {};
      translations[language] = translatedText;
      await collection.updateOne(
        { contentId },
        { $set: { translations, updatedAt: new Date() } },
      );
      this.logger.log(
        `Updated translation for contentId: ${contentId}, Language: ${language}`,
      );
    } else {
      // Create new translation record
      const newRecord = {
        contentId,
        originalText,
        translations: { [language]: translatedText },
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
      };
      await collection.insertOne(newRecord);
      this.logger.log(
        `Created new translation for contentId: ${contentId}, Language: ${language}`,
      );
    }
  }

}
