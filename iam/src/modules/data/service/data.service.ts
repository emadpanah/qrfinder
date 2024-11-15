// src/modules/data/service/data.service.ts
import { Injectable } from '@nestjs/common';
import { DataRepository } from '../database/repositories/data.repository';
import { FngData } from '../database/schema/fng.schema';
import { TradingViewAlertDto } from '../database/dto/traidingview-alert.dto';
import { MACDDto } from '../database/dto/macd.dto';
import { RSIDto } from '../database/dto/rsi.dto';
import { RSIData } from '../database/schema/rsi.schema';
import { MACDData } from '../database/schema/macd.schema';

@Injectable()
export class DataService {
  constructor(private readonly dataRepository: DataRepository) {}

  

  // Save new ticker data received from TradingView
  async saveTickerData(tickerData: TradingViewAlertDto): Promise<void> {
    // Convert `time` field to a numeric timestamp
    const timestamp = new Date(tickerData.time).getTime() / 1000;
    
    await this.dataRepository.createTickerData({
      symbol: tickerData.symbol,
      exchange: tickerData.exchange,
      price:  parseFloat(tickerData.price.toString()) ,
      time: timestamp,
    });
    //console.log('Ticker data saved successfully');
  }

  async saveRSIData(rsiData: RSIDto): Promise<void> {
    const timestamp = new Date(rsiData.time).getTime() / 1000;
    const formattedData = {
      symbol: rsiData.symbol,
      RSI: rsiData.RSI,
      time: timestamp,
    };
    await this.dataRepository.createRSIData(formattedData);
  }

  async saveMACDData(macdData: MACDDto): Promise<void> {
    const timestamp = new Date(macdData.time).getTime() / 1000;
    const formattedData = {
      symbol: macdData.symbol,
      MACD: macdData.MACD,
      Signal: macdData.Signal,
      Histogram: macdData.Histogram,
      time: timestamp,
    };
    await this.dataRepository.createMACDData(formattedData);
  }

}
