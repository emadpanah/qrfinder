// src/modules/data/service/data.service.ts
import { Injectable } from '@nestjs/common';
import { DataRepository } from '../database/repositories/data.repository';
import { FngData } from '../database/schema/fng.schema';
import { TradingViewAlertDto } from '../database/dto/traidingview-alert.dto';

@Injectable()
export class DataService {
  constructor(private readonly dataRepository: DataRepository) {}

  

  // Save new ticker data received from TradingView
  async saveTickerData(tickerData: TradingViewAlertDto): Promise<void> {
    // Convert `time` field to a numeric timestamp
    const timestamp = new Date(tickerData.timestamp).getTime();

    await this.dataRepository.createTickerData({
      symbol: tickerData.symbol,
      exchange: tickerData.exchange,
      price: tickerData.price,
      timestamp,
    });
    console.log('Ticker data saved successfully');
  }

  // Calculate a moving average for data analysis
  private calculateMovingAverage(data: number[], period: number): number[] {
    const movingAverages = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data
        .slice(i - period + 1, i + 1)
        .reduce((acc, val) => acc + val, 0);
      movingAverages.push(sum / period);
    }
    return movingAverages;
  }
}
