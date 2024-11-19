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

@Injectable()
export class DataRepository {
  private readonly fngCollectionName = '_fngdata';
  private readonly tickerCollectionName = '_tickerdata';
  private readonly rsiCollectionName = '_rsidata';
  private readonly macdCollectionName = '_macddata';
  private readonly st1CollectionName = '_st1data';
  private readonly dominanceCollectionName = '_dominancedata';
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


  async findFngByDate(targetDate: number): Promise<FngData | null> {
    const collection = this.connection.collection(this.fngCollectionName);
  
    // Convert the targetDate to a timestamp (at midnight UTC of that day)
    //const targetTimestamp = Math.floor(new Date(`${targetDate}T00:00:00Z`).getTime() / 1000);
  
    this.logger.log(`Fetching FNG data for closest date on or before: ${targetDate} (timestamp <= ${targetDate})`);
  
    // Find the closest record on or before the target date by sorting in descending order
    const result = await collection
      .find({ timestamp: { $lte: targetDate } })
      .sort({ timestamp: -1 }) // Sort in descending order to get the closest earlier date
      .limit(1) // Limit to the closest record found
      .toArray();
  
    if (result.length > 0) {
      const fngRecord = result[0];
      this.logger.debug(`Found FNG data for closest date to ${targetDate}: ${JSON.stringify(fngRecord)}`);
      return {
        value: fngRecord.value ?? '0',
        value_classification: fngRecord.value_classification ?? 'Neutral',
        timestamp: fngRecord.timestamp ?? 0,
        metadata: fngRecord.metadata ?? {},
      } as FngData;
    } else {
      this.logger.warn(`No FNG data found on or before ${targetDate}.`);
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
    

   // Get RSI for a specific date and symbol
   async getRSIBySymbolAndDate(symbol: string, date: string): Promise<RSIData | null> {
    const collection = this.connection.collection(this.rsiCollectionName);

    const targetTimestamp = new Date(date).getTime() / 1000; // Convert date to UNIX timestamp

    const result = await collection
      .find({ symbol, time: { $gte: targetTimestamp } })
      .sort({ time: -1 })
      .limit(1)
      .toArray();

    if (result.length > 0) {
      const { symbol, RSI, time, _id } = result[0];
      return { symbol, RSI, time }; // Returning only relevant fields
    }

    return null;
  }

  // Get MACD for a specific date and symbol
  async getMACDBySymbolAndDate(symbol: string, date: string): Promise<MACDData | null> {
    const collection = this.connection.collection(this.macdCollectionName);

    const targetTimestamp = new Date(date).getTime() / 1000; // Convert date to UNIX timestamp

    const result = await collection
      .find({ symbol, time: { $gte: targetTimestamp } })
      .sort({ time: -1 })
      .limit(1)
      .toArray();

    if (result.length > 0) {
      const { symbol, MACD, Signal, Histogram, time, _id } = result[0];
      return { symbol, MACD, Signal, Histogram, time }; // Returning only relevant fields
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

}
