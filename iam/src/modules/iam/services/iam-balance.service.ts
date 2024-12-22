import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IAMUser, IAMUserDocument } from '../database/schemas/iam-user.schema';
import { Currency, CurrencyDocument } from '../database/schemas/iam-currency.schema';
import { CurrencyDto } from '../dto/currency.dto';
import { BalanceDto } from '../dto/balance.dto';
import { CurrencyRepository } from '../database/repositories/currency.repository';
import { BalanceRepository } from '../database/repositories/balance.repository';

@Injectable()
export class BalanceService {
  constructor(    
    private currencyRepository: CurrencyRepository,
    private balanceRepository: BalanceRepository
  ) {}

  async createCurrency(currencyDto: CurrencyDto): Promise<Currency> {
    return this.currencyRepository.createCurrency(currencyDto);
  }

  async getCurrencies(): Promise<Currency[]> {
    return this.currencyRepository.findAllCurrencies();
  }

  async getCurrencyByName(name : string): Promise<CurrencyDto> {
    return this.currencyRepository.findCurrencyByName(name);
  }

  async getDefaultCurrency(): Promise<Currency> {
    return this.currencyRepository.findDefaultCurrency();
  }

  async addTransaction(createBalanceDto: BalanceDto): Promise<any> {

    const transaction = await this.balanceRepository.addTransaction(createBalanceDto);

    return transaction;
  }

  async getUserBalance(userId: Types.ObjectId, currency: Types.ObjectId): Promise<number> {
    if(!currency)
    {
        currency = await this.currencyRepository.findDefaultCurrency();
    }
    return this.balanceRepository.findUserBalance(userId, currency);
  }
}
