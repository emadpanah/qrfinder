import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { CurrencyDto } from '../../dto/currency.dto';
import { types } from 'util';

@Injectable()
export class CurrencyRepository {
  constructor(@InjectConnection('service') private connection: Connection) {}

  async createCurrency(dto: CurrencyDto): Promise<any> {
    const collection = this.connection.collection('_iamcurrencies');
    await collection.insertOne({
      _id: dto._id,
      name: dto.name,
      symbol: dto.symbol,
      type: dto.type,
      isDefault: dto.isDefault,
    });
    const currency = await collection.findOne({ _id: dto._id });
    if (!currency) {
      throw new Error('Insert not completed.');
    }
    return currency;
  }

  async findAllCurrencies(): Promise<any[]> {
    const collection = this.connection.collection('_iamcurrencies');
    return collection.find().toArray();
  }

  
}
