// src/modules/data/controller/data.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { TradingViewAlertDto } from '../database/dto/traidingview-alert.dto';
import { DataService } from '../service/data.service';
import { RSIDto } from '../database/dto/rsi.dto';
import { MACDDto } from '../database/dto/macd.dto';

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post('tvticker')
  async tradingviewTicker(@Body() alertData: TradingViewAlertDto) {
    //console.log('Received TradingView Ticker:', alertData);
    await this.dataService.saveTickerData(alertData); // Use DataService to save data
    return { message: 'Ticker data received and saved successfully' };
  }

   // RSI Ticker webhook
   @Post('RSIticker')
   async rsiTicker(@Body() rsiData: RSIDto) {
    console.log('Received RSI Data:', rsiData);
    await this.dataService.saveRSIData(rsiData);
    return { message: 'RSI data received and saved successfully' };
  }

  @Post('MACDticker')
  async macdTicker(@Body() macdData: MACDDto) {
    console.log('Received MACD Data:', macdData);
    await this.dataService.saveMACDData(macdData);
    return { message: 'MACD data received and saved successfully' };
  }


}
