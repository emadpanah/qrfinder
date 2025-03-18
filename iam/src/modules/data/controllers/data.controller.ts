// src/modules/data/controller/data.controller.ts
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TradingViewAlertDto } from '../database/dto/traidingview-alert.dto';
import { DataService } from '../service/data.service';
import { CCIDto, EMADto, RSIDto, SMADto, StochasticDto } from '../database/dto/rsi.dto';
import { MACDDto } from '../database/dto/macd.dto';
import { DominanceDto } from '../database/dto/dominance.dto';
import { ST1Dto } from '../database/dto/st1.dto';
import * as TelegramBot from 'node-telegram-bot-api';
import { LunarCrushService } from '../service/lunar.service';
import { ADXDto } from '../database/dto/adx.dto';

@Controller('data')
export class DataController {
  private readonly telegramBot: TelegramBot;
  constructor(private readonly dataService: DataService, private readonly lunarservice: LunarCrushService) {

    this.telegramBot = new TelegramBot(process.env.NABZAR_X_BOT, { polling: false });

  }

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

  @Post('ADXticker')
  async adxTicker(@Body() adxData: ADXDto) {
    console.log('Received ADX Data:', adxData);
    await this.dataService.saveADXData(adxData);
    return { message: 'ADX data received and saved successfully' };
  }

  @Post('EMAticker')
  async emaTicker(@Body() emaData: EMADto) {
    console.log('Received EMA Data:', emaData);
    await this.dataService.saveEMAData(emaData);
    return { message: 'EMA data received and saved successfully' };
  }

  @Post('SMAticker')
  async smaTicker(@Body() smaData: SMADto) {
    console.log('Received SMA Data:', smaData);
    await this.dataService.saveSMAData(smaData);
    return { message: 'SMA data received and saved successfully' };
  }

  @Post('STOCHASTICticker')
  async stochasticTicker(@Body() stochasticData: StochasticDto) {
    console.log('Received Stochastic Data:', stochasticData);
    await this.dataService.saveStochasticData(stochasticData);
    return { message: 'Stochastic data received and saved successfully' };
  }

  @Post('CCIticker')
  async cciTicker(@Body() cciData: CCIDto) {
    console.log('Received CCI Data:', cciData);
    await this.dataService.saveCCIData(cciData);
    return { message: 'CCI data received and saved successfully' };
  }


  // @Post('EMAticker')
  // @Post('SMAticker')
  // @Post('STOCHASTICticker')
  // @Post('CCIticker')

  @Post('ST1')
  async st1Ticker(@Body() st1Data: ST1Dto) {
    console.log('Received ST1 Data:', st1Data);

    // Programmatically set target and stop values
    const { signal, price } = st1Data;
    const multiplier = 0.12; // Example: 2% above/below the price

    st1Data.target = signal === 'Buy' ? price * (1 + multiplier) : price * (1 - multiplier);
    st1Data.stop = signal === 'Buy' ? price * (1 - multiplier) : price * (1 + multiplier);


    await this.dataService.saveST1Data(st1Data);
    // Send the data to the Telegram group
    const groupId = process.env.TELEGRAM_SIGNAL_GROUP_ID; // Add your group ID in .env
    const message = this.formatTelegramMessage(st1Data);

    try {
      await this.telegramBot.sendMessage(groupId, message, { parse_mode: 'Markdown' });
      console.log('Message sent to Telegram group successfully');
    } catch (error) {
      console.error('Error sending message to Telegram group:', error);
    }

    // Fetch the last signal for the same symbol
     const lastSignal = await this.dataService.getLastST1BySymbol(st1Data.symbol);
       
    if (lastSignal) {
      const isTargetReached =
        (lastSignal.signal === 'Buy' && price >= lastSignal.target) ||
        (lastSignal.signal === 'Sell' && price <= lastSignal.target);
          console.log('isTargetReached: ', isTargetReached);
        await this.dataService.updateST1IsDone(lastSignal._id.toString(), isTargetReached);
     }

    return { message: 'ST1 data received and saved successfully' };

  }

  private formatTelegramMessage(data: ST1Dto): string {
    let formattedTime = 'Invalid Time';

    try {
      // Ensure the time field is parsed as a valid Date
      const date = new Date(data.time);
      if (!isNaN(date.getTime())) {
        formattedTime = date.toISOString(); // Format to ISO string if valid
      }
    } catch (error) {
      console.log(`Failed to parse time: ${data.time}`, error.stack);
    }

    return `
      🚨 **New Trading Signal** 🚨
      📊 Signal: ${data.signal === 'Buy' ? '🟢 Buy' : '🔴 Sell'}
      💱 Exchange: ${data.exchange}
      💡 Symbol: ${data.symbol}
      💵 Price: ${data.price}
      🎯 Target: ${data.target.toFixed(8)}
      🛑 Stop: ${data.stop.toFixed(8)}
      🕒 Time: ${formattedTime}
    `;
  }


  

  @Post('DT')
  async dominanceTicker(@Body() dominanceData: DominanceDto) {
    console.log('Received Dominance Data:', dominanceData);
    await this.dataService.saveDominanceData(dominanceData);
    return { message: 'Dominance data received and saved successfully' };
  }

  @Get('lunar-category-sort')
  async getByCategoryAndSort(
    @Query('category') category: string,
    @Query('sort') sort: string,
    @Query('limit') limit: number = 100,
  ) {
    return this.lunarservice.getByCategoryAndSort(category, sort, limit);
  }

  @Get('lunar-sort')
  async getBySort(@Query('sort') sort: string, @Query('limit') limit: number = 100) {
    return this.lunarservice.getBySort(sort, limit);
  }


}
