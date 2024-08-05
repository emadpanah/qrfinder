import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { BalanceDto } from '../../dto/balance.dto';

@Injectable()
export class BalanceRepository {
  constructor(@InjectConnection('service') private connection: Connection) {}

  async addTransaction(dto: BalanceDto): Promise<any> {
    const collection = this.connection.collection('_iambalances');
    await collection.insertOne(dto);
    const transaction = await collection.findOne({ userId: new Types.ObjectId(dto.userId), transactionType: dto.transactionType, currency: dto.currency, transactionEntityId: new Types.ObjectId(dto.transactionEntityId) });
    if (!transaction) {
      throw new Error('Balance insert not completed.');
    }
    return transaction;
  }

  async findUserBalance(userId: Types.ObjectId, currency: Types.ObjectId): Promise<number> {
    const collection = this.connection.collection('_iambalances');
    const lastTransaction = await collection.find({ userId, currency }).sort({ timestamp: -1 }).limit(1).toArray();
    return lastTransaction.length > 0 ? lastTransaction[0].balanceAfterTransaction : 0;
  }
}
