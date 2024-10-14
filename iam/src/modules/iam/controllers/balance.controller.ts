import { Controller, Post, Body, Get, Param, Query, ValidationPipe } from '@nestjs/common';
import { BalanceService } from '../services/iam-balance.service';
import { CurrencyDto } from '../dto/currency.dto';
import { BalanceDto } from '../dto/balance.dto';
import { Types } from 'mongoose';

@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceCurrencyService: BalanceService) {}

  @Post('/currency')
  async createCurrency(@Body() currencyDto: CurrencyDto) {
    return this.balanceCurrencyService.createCurrency(currencyDto);
  }

  @Get('/currency')
  async getCurrencies() {
    return this.balanceCurrencyService.getCurrencies();
  }

  @Get('/currencybyname')
  async getCurrencyByName(@Query('name') name: string) {
    return this.balanceCurrencyService.getCurrencyByName(name);
  }

  @Get('/currencydefault')
  async getDefaultCurrencies() {
    return this.balanceCurrencyService.getDefaultCurrency();
  }
  

  @Post('/transaction')
  async addTransaction(@Body() balanceDto: BalanceDto) {
    return this.balanceCurrencyService.addTransaction(balanceDto);
  }


  @Post('/addtransaction')
  async addTransactionWithParam(@Query('userId') userId: string, 
  @Query('transactionType', new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) 
  transactionType: 'deposit' | 'withdraw' | 'achievementsreward' | 'payment' | 'walletsync',
  @Query('amount') amount: string,
  @Query('currency') currency: string,
  @Query('transactionEntityId') transactionEntityId: string,
  @Query('balanceAfterTransaction') balanceAfterTransaction: string) {
    const tbalance: BalanceDto = {
        amount: Number.parseInt(amount),
        timestamp: Date.now(),
        transactionEntityId: transactionEntityId,
        transactionType: transactionType,
        userId: new Types.ObjectId(userId) ,
        balanceAfterTransaction: Number.parseInt(amount),
        currency: new Types.ObjectId(currency),
        _id: new Types.ObjectId(),
      };
    return this.balanceCurrencyService.addTransaction(tbalance);
  }

  @Get('/')
  async getUserBalance(@Query('userId') userId: string, @Query('currency') currency: string) {
    return this.balanceCurrencyService.getUserBalance(new Types.ObjectId(userId), new Types.ObjectId(currency));
  }


}
