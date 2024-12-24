// src/modules/data/service/data.service.ts
import { Injectable } from '@nestjs/common';
import { DataRepository } from '../database/repositories/data.repository';
import { FngData } from '../database/schema/fng.schema';
import { TradingViewAlertDto } from '../database/dto/traidingview-alert.dto';
import { MACDDto } from '../database/dto/macd.dto';
import { RSIDto } from '../database/dto/rsi.dto';
import { RSIData } from '../database/schema/rsi.schema';
import { MACDData } from '../database/schema/macd.schema';
import { DominanceDto } from '../database/dto/dominance.dto';
import { ST1Dto } from '../database/dto/st1.dto';
import { ADXDto } from '../database/dto/adx.dto';
import { ADXData } from '../database/schema/adx.schema';

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

  async saveDominanceData(dominanceData: DominanceDto): Promise<void> {
    const timestamp = new Date(dominanceData.time).getTime() / 1000;
    const formattedData = {
      symbol: dominanceData.symbol,
      dominance: dominanceData.dominance,
      time: timestamp,
    };
    await this.dataRepository.createDominanceData(formattedData);
    //console.log('dominance data saved successfully');
  }

  async saveST1Data(st1Data: ST1Dto): Promise<void> {
    const timestamp = new Date(st1Data.time).getTime() / 1000;
    const formattedData = {
      symbol: st1Data.symbol,
      price : st1Data.price,
      singnal: st1Data.signal,
      time: timestamp,
      exchange: st1Data.exchange,
      stop: st1Data.stop,
      target: st1Data.target,
      isDone: st1Data.isDone
    };
    await this.dataRepository.createST1Data(formattedData);
  }

  async getLastST1BySymbol(symbol: string): Promise<ST1Dto | null> {
    return this.dataRepository.getLastST1BySymbol(symbol);
  }

  async updateST1IsDone(id: string, isDone: boolean): Promise<void> {
    await this.dataRepository.updateST1IsDone(id, isDone);
  }
  

  async getDominanceData(symbol: string, date: number): Promise<DominanceDto | null> {
    const timestamp = new Date(date).getTime() / 1000;
    return await this.dataRepository.getDominanceBySymbolAndDate(symbol, timestamp);
  }

  async saveADXData(adxData: ADXDto): Promise<void> {
    const timestamp = new Date(adxData.time).getTime() / 1000;
    const formattedData = {
      symbol: adxData.symbol,
      adx_value: adxData.adx_value,
      price: adxData.price,
      time: timestamp,
    };
    await this.dataRepository.createADXData(formattedData);
  }
  
  async getADXBySymbolAndDate(symbol: string, date?: number): Promise<ADXData | null> {
    return await this.dataRepository.getADXBySymbolAndDate(symbol, date);
  }

}
