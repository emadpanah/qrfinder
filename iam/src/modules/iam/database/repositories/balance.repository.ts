import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { BalanceDto } from '../../dto/balance.dto';

@Injectable()
export class BalanceRepository {
  constructor(@InjectConnection('service') private connection: Connection) {}

  async addTransaction(dto: BalanceDto): Promise<any> {
    try {
      //console.log("BalanceDto---------------", dto);
      const collection = this.connection.collection('_iambalances');
  
      // Insert transaction
      await collection.insertOne(dto);
  
      // Find the inserted transaction
      const transaction = await collection.findOne({ _id: dto._id });
  
      if (!transaction) {
        throw new Error('Balance insert not completed.');
      }
  
      return transaction;
    } catch (error) {
      console.error('Error inserting transaction:', error); // Log the error for debugging
      throw new Error('Failed to add transaction.'); // Re-throw the error with a user-friendly message
    }
  }

  async findUserBalance(userId: Types.ObjectId, currency: Types.ObjectId): Promise<number> {
    const collection = this.connection.collection('_iambalances');
    const lastTransaction = await collection.find({ userId, currency }).sort({ timestamp: -1 }).limit(1).toArray();
    return lastTransaction.length > 0 ? lastTransaction[0].balanceAfterTransaction : 0;
  }
}
