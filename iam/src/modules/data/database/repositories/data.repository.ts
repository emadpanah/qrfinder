// src/modules/data/database/repositories/data.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { FngData } from '../schema/fng.schema';
import { TradingViewAlertDto } from '../dto/traidingview-alert.dto';

@Injectable()
export class DataRepository {
  private readonly fngCollectionName = '_fngdata';
  private readonly tickerCollectionName = '_tickerdata';
  private readonly logger = new Logger(DataRepository.name);

  constructor(@InjectConnection('service') private readonly connection: Connection) {}

  // Save FNG data point in MongoDB
  async create(fngData: Partial<FngData>): Promise<FngData> {
    const collection = this.connection.collection(this.fngCollectionName);
    await collection.insertOne(fngData);
    return fngData as FngData;
  }

  // Save ticker data received from TradingView
  async createTickerData(tickerData: Partial<{ symbol: string; exchange: string; price: number; timestamp: number }>): Promise<void> {
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
  async getLatestPriceBySymbol(symbol: string): Promise<TradingViewAlertDto | null> {
    const collection = this.connection.collection(this.tickerCollectionName);

    const result = await collection
      .find({ symbol })
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();

      if (result.length > 0) {
        const { symbol, price, time, exchange, _id } = result[0];
        // Return as TradingViewAlertDto, excluding _id
        return { symbol, price, time, exchange };
      }

    return null;
  }

  // Get top N cryptos by price in USDT
  async getTopCryptosByPrice(limit: number): Promise<TradingViewAlertDto[]> {
    const collection = this.connection.collection(this.tickerCollectionName);

    const results = await collection
      .find({ symbol: /USDT$/ })
      .sort({ price: -1 })
      .limit(limit)
      .toArray();

    // Map results to TradingViewAlertDto, excluding _id
  return results.map(({ symbol, price, time, exchange }) => ({ symbol, price, time, exchange }));
  }
  

  // Check if a data point with a specific timestamp already exists
  async existsFng(timestamp: number): Promise<boolean> {
    const collection = this.connection.collection(this.fngCollectionName);
    const count = await collection.countDocuments({ timestamp });
    return count > 0;
  }
}
