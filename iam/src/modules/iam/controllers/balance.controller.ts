import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { BalanceService } from '../services/iam-balance.service';
import { CurrencyDto } from '../dto/currency.dto';
import { BalanceDto } from '../dto/balance.dto';
import { Types } from 'mongoose';

@Controller('iam-balances-currencies')
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

  @Post('/transaction')
  async addTransaction(@Body() balanceDto: BalanceDto) {
    return this.balanceCurrencyService.addTransaction(balanceDto);
  }

  @Get('/user/:userId/:currency')
  async getUserBalance(@Param('userId') userId: string, @Param('currency') currency: string) {
    return this.balanceCurrencyService.getUserBalance(new Types.ObjectId(userId), currency);
  }
}
