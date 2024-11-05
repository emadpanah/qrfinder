// src/modules/data/controller/data.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { TradingViewAlertDto } from '../database/dto/traidingview-alert.dto';
import { DataService } from '../service/data.service';

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post('tvticker')
  async tradingviewTicker(@Body() alertData: TradingViewAlertDto) {
    console.log('Received TradingView Ticker:', alertData);
    await this.dataService.saveTickerData(alertData); // Use DataService to save data
    return { message: 'Ticker data received and saved successfully' };
  }
}
