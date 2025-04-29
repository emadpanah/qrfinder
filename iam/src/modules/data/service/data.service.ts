// src/modules/data/service/data.service.ts
import { Injectable } from '@nestjs/common';
import { DataRepository } from '../database/repositories/data.repository';
import { FngData } from '../database/schema/fng.schema';
import { TradingViewAlertDto } from '../database/dto/traidingview-alert.dto';
import { MACDDto } from '../database/dto/macd.dto';
import { CCIDto, EMADto, RSIDto, SMADto, StochasticDto } from '../database/dto/rsi.dto';
import { RSIData } from '../database/schema/rsi.schema';
import { MACDData } from '../database/schema/macd.schema';
import { DominanceDto } from '../database/dto/dominance.dto';
import { ST1Dto } from '../database/dto/st1.dto';
import { ADXDto } from '../database/dto/adx.dto';
import { ADXData } from '../database/schema/adx.schema';
import { Types } from 'mongoose';
import * as TelegramBot from 'node-telegram-bot-api';
import { IamService } from 'src/modules/iam/services/iam.service';
import { BalanceService } from 'src/modules/iam/services/iam-balance.service';
import { UserChatLogDto } from '../database/dto/userchatlog.dto';
import { UserDto } from 'src/modules/iam/dto/user.dto';
import { escapeMarkdown } from 'src/shared/helper';
@Injectable()
export class DataService {
   private readonly telegramBot = new TelegramBot(process.env.
      //NABZAR_BOT_TOKEN
      NABZAR_X_BOT
      , { polling: false });
    private readonly telegramChatId = process.env.TELEGRAM_SIGNAL_GROUP_ID;
  constructor(private readonly dataRepository: DataRepository,
              private readonly iamService: IamService,
              private readonly balanceService: BalanceService,
  ) {}

    async handleSendUsers(chatId: string, idsString: string, symbol: string, language: string, adminTelegramId: string): Promise<void> {
      const telegramIDs = idsString.split(',').map(id => id.trim());
      const successList = [];
  
      for (const id of telegramIDs) {
        const loginInfo = await this.iamService.findLatestLoginByTelegramId(id);
        if (loginInfo?.chatId) {
          const analysis = await this.analyzeAndCreateSignals([symbol], language, ''); // You may need to move analyzeAndCreateSignals here or call service
          await this.telegramBot.sendMessage(loginInfo.chatId, analysis);
          successList.push(id);
  
          const chatLog: UserChatLogDto = {
            telegramId: adminTelegramId,
            calledFunction: 'analyzeAndCreateSignals',
            query: `admin-cmd: send users: ${successList.join(',')} ${symbol} ${language}`,
            response: analysis,
            queryType: 'admin-broadcast',
            newParameters: [],
            save_at: Math.floor(Date.now() / 1000),
          };
          await this.dataRepository.saveUserChatLog(chatLog);
        }
      }
  
      await this.telegramBot.sendMessage(chatId, `${symbol.toUpperCase()} analysis sent to: ${successList.join(', ')}`);
    }
  
    async handleGetLastUsers(n: number): Promise<string[]> {
      const users = await this.iamService.getLastNUsers(n);
      return users.map((u, i) => `*${i + 1}.* 🆔 ID: ${escapeMarkdown(u.telegramID || '')}
    👤 Username: ${escapeMarkdown(u.telegramUserName || '-')}
    🧑 First Name: ${escapeMarkdown(u.telegramFirstName || '-')}
    👨‍🦰 Last Name: ${escapeMarkdown(u.telegramLastName || '-')}
    📱 Mobile: ${escapeMarkdown(u.mobile || '-')}`);
    }
  
    async handleGetBalance(telegramId: string): Promise<string> {
      const user = await this.iamService.findUserByTelegramID(telegramId);
      if (!user) return `❌ User ${telegramId} not found.`;
      const balance = await this.balanceService.getUserBalance(user._id);
      return `💰 Balance for ${telegramId}: ${balance}`;
    }
  
    async handleGetExpiredUsers(n: number): Promise<any[]> {
      const expiredUsers = await this.iamService.getExpiredUsers(n);
      console.log('Expired users:', expiredUsers);
      return expiredUsers;
    }
  
    async handleMakeExpired(chatId: string, telegramId: string): Promise<any> {
      const result = await this.iamService.expireUser(telegramId);
      return result;
    }
  
    async handleGetChatLogs(telegramId: string, n: number): Promise<string[]> {
      const logs = await this.dataRepository.getChatHistory(telegramId, n);
      if (!logs.length) return [`No chat history for user ${telegramId}.`];
      return logs.map((log, i) => `*${i + 1}.* ${escapeMarkdown(log.query || '-')}`);
    }
  
    async handleGetUserMChats(chatId: string, n: number, m: number): Promise<void> {
      const users = await this.iamService.getLastNUsers(n);
      for (const user of users) {
        const logs = await this.dataRepository.getChatHistory(user.telegramID, m);
        const formattedLogs = logs.map(log => `> ${log.query}`).join('\n');
        await this.telegramBot.sendMessage(chatId, `User ${user.telegramID}:\n${formattedLogs}`);
      }
    }
  
    async handleGetUserDeposits(n: number): Promise<string[]> {
      const deposits = await this.iamService.getTopDepositUsers(n);
      return deposits.map((d, i) => 
        `*${i + 1}.* 🆔 ID: ${escapeMarkdown(d.telegramID || '')}
    👤 Username: ${escapeMarkdown(d.telegramUserName || '-')}
    /📱 Mobile: ${escapeMarkdown(d.mobile || '-')}
    💰 Total Deposit: ${d.totalAmount ?? '-'}`
      );
    }
    
  
    async handleSendMessage(chatId: string, message: string, telegramId: string, adminTelegramId: string): Promise<void> {
      const loginInfo = await this.iamService.findLatestLoginByTelegramId(telegramId);
      if (loginInfo?.chatId) {
        await this.telegramBot.sendMessage(loginInfo.chatId, message);
  
        const chatLog: UserChatLogDto = {
          telegramId: adminTelegramId,
          calledFunction: 'sendCustomMessage',
          query: `admin-cmd: send '${message}' ${telegramId}`,
          response: message,
          queryType: 'admin-send-msg',
          newParameters: [],
          save_at: Math.floor(Date.now() / 1000),
        };
        await this.dataRepository.saveUserChatLog(chatLog);
  
        await this.telegramBot.sendMessage(chatId, `✅ Message sent to ${telegramId}`);
      } else {
        await this.telegramBot.sendMessage(chatId, `❌ User ${telegramId} not found or no active chatId.`);
      }
    }
  
    // Example placeholder if needed
    private async analyzeAndCreateSignals(symbols: string[], language: string, someOther: string): Promise<string> {
      // Your logic to generate the analysis text
      return `Analysis for ${symbols.join(', ')} in ${language}`;
    }

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

  // src/modules/data/service/data.service.ts


  

async updateAllSignalsAndCalculateWinRate(): Promise<{ winRate: number; totalSignals: number; winningSignals: number }> {
  const signals = await this.dataRepository.getAllST1Signals();

  let winningSignals = 0;

  for (const signal of signals) {
    const isTargetReached =
      (signal.signal === 'Buy' && signal.price >= signal.target) ||
      (signal.signal === 'Sell' && signal.price <= signal.target);

    if (isTargetReached) {
      winningSignals++;
    }

    // Update the isDone status in the database
    await this.dataRepository.updateST1IsDone(signal._id.toString(), isTargetReached);
  }

  const totalSignals = signals.length;
  const winRate = totalSignals > 0 ? (winningSignals / totalSignals) * 100 : 0;

  return { winRate, totalSignals, winningSignals };
}

  async saveST1Data(st1Data: ST1Dto): Promise<void> {
    const timestamp = new Date(st1Data.time).getTime() / 1000;
    const formattedData = {
      _id: new Types.ObjectId(),
      symbol: st1Data.symbol,
      price : st1Data.price,
      signal: st1Data.signal,
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
  
    // Save EMA Data
    async saveEMAData(emaData: EMADto): Promise<void> {
      const timestamp = new Date(emaData.time).getTime() / 1000;
      const formattedData = {
        symbol: emaData.symbol,
        ema_value: emaData.ema_value,
        price: emaData.price,
        time: timestamp,
      };
      await this.dataRepository.createEMAData(formattedData);
    }
  
    // Save SMA Data
    async saveSMAData(smaData: SMADto): Promise<void> {
      const timestamp = new Date(smaData.time).getTime() / 1000;
      const formattedData = {
        symbol: smaData.symbol,
        sma_value: smaData.sma_value,
        price: smaData.price,
        time: timestamp,
      };
      await this.dataRepository.createSMAData(formattedData);
    }
  
    // Save Stochastic Data
    async saveStochasticData(stochasticData: StochasticDto): Promise<void> {
      if(!stochasticData.k_value || stochasticData.d_value) {
        return;
      }
      const timestamp = new Date(stochasticData.time).getTime() / 1000;
      const formattedData = {
        symbol: stochasticData.symbol,
        k_value: stochasticData.k_value,
        d_value: stochasticData.d_value,
        price: stochasticData.price,
        time: timestamp,
      };
      await this.dataRepository.createStochasticData(formattedData);
    }
  
    // Save CCI Data
    async saveCCIData(cciData: CCIDto): Promise<void> {
      const timestamp = new Date(cciData.time).getTime() / 1000;
      const formattedData = {
        symbol: cciData.symbol,
        cci_value: cciData.cci_value,
        price: cciData.price,
        time: timestamp,
      };
      await this.dataRepository.createCCIData(formattedData);
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
