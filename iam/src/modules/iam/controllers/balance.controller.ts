import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
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

  @Get('/currencydefault')
  async getDefaultCurrencies() {
    return this.balanceCurrencyService.getDefaultCurrency();
  }
  

  @Post('/transaction')
  async addTransaction(@Body() balanceDto: BalanceDto) {
    return this.balanceCurrencyService.addTransaction(balanceDto);
  }

  @Get('/')
  async getUserBalance(@Query('userId') userId: string, @Query('currency') currency: string) {
    return this.balanceCurrencyService.getUserBalance(new Types.ObjectId(userId), new Types.ObjectId(currency));
  }


}
