// iam/database/repositories/iam.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { UserDto, UserInsertDto } from '../../dto/user.dto';
import { sanitizeString } from 'src/shared/helper';
import * as moment from 'moment-jalaali';

@Injectable()
export class IamRepository {
  constructor(@InjectConnection('service') private connection: Connection) {}

  async createUser(dto: UserInsertDto): Promise<any> {
    const collection = this.connection.collection('_iamusers');

    // Validate and sanitize input
    const sanitizedData = {
      telegramID: sanitizeString(dto.telegramID, 50),
      mobile: sanitizeString(dto.mobile, 15),
      telegramUserName: sanitizeString(dto.telegramUserName, 50),
      telegramFirstName: sanitizeString(dto.telegramFirstName, 50),
      telegramLastName: sanitizeString(dto.telegramLastName, 50),
      telegramLanCode: sanitizeString(dto.telegramLanCode, 10),
      createdDate: Date.now(),
    };

    await collection.insertOne(sanitizedData);

    const user = await collection.findOne({ telegramID: sanitizedData.telegramID });
    if (!user) {
      throw new Error('User insert not completed.');
    }
    return user;
  }

  async setUserAlias(telegramID: string, alias: string): Promise<any> {
    try {
      const sanitizedTelegramID = sanitizeString(telegramID, 50);
      const sanitizedAlias = sanitizeString(alias, 100);

      const collection = this.connection.collection('_iamusers');

      const result = await collection.updateOne(
        { telegramID: sanitizedTelegramID },
        { $set: { alias: sanitizedAlias } }
      );

      if (result.matchedCount === 0) {
        throw new Error(`User with telegramID ${sanitizedTelegramID} not found.`);
      }

      const ret = await collection.findOne({ telegramID: sanitizedTelegramID });
      return ret;
    } catch (error) {
      console.log('Failed to set user alias:', error);
      throw new Error('Failed to set user alias.');
    }
  }

  async updateUser(telegramID: string, username?: string, mobile?: string): Promise<any> {
    const sanitizedTelegramID = sanitizeString(telegramID, 50);

    const collection = this.connection.collection('_iamusers');

    // Build the update object dynamically with sanitized fields
    const updateFields: any = {};
    if (username !== undefined && username !== null) {
      updateFields.telegramUserName = sanitizeString(username, 50);
    }
    if (mobile !== undefined && mobile !== null) {
      updateFields.mobile = sanitizeString(mobile, 15);
    }

    const result = await collection.updateOne(
      { telegramID: sanitizedTelegramID },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      throw new Error(`User with telegramID ${sanitizedTelegramID} not found.`);
    }
    const ret = await collection.findOne({ telegramID: sanitizedTelegramID });
    return ret;
  }

  async findUserByTelegramID(telegramId: string): Promise<any> {
    const sanitizedTelegramID = sanitizeString(telegramId, 50);
    const collection = this.connection.collection('_iamusers');
    const user = await collection.findOne({ telegramID: sanitizedTelegramID });
    return user;
  }

  async findUserById(id: Types.ObjectId): Promise<any> {
    // Validate ObjectId
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ObjectId');
    }

    const collection = this.connection.collection('_iamusers');
    const user = await collection.findOne({ _id: id });
    return user;
  }
  

  async findLastNUsers(n: number): Promise<UserDto[]> {
    const collection = this.connection.collection('_iamusers');
    const users = await collection.find().sort({ createdDate: -1 }).limit(n).toArray();
  
    return users.map((u: any) => ({
      _id: u._id,
      telegramID: u.telegramID || '',
      mobile: u.mobile || '',
      telegramUserName: u.telegramUserName || '',
      telegramFirstName: u.telegramFirstName || '',
      telegramLastName: u.telegramLastName || '',
      telegramLanCode: u.telegramLanCode || '',
      alias: u.alias || '',
      createdDate: u.createdDate || 0,
      updatedDate: u.updatedDate || 0,
      clientSecret: '', // 👈 ADD THIS to fix the error
    }));
  }
  
  
  
  // async findExpiredUsers(n: number): Promise<{ userId: Types.ObjectId }[]> {
  //   const collection = this.connection.collection('_iambalances');
  
  //   const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
  
  //   const userIds = await collection.distinct('userId', {
  //     transactionType: { $in: ['deposit', 'achievementsreward'] },
  //     timestamp: { $lt: thirtyDaysAgo },
  //   });
  
  //   if (!userIds.length) {
  //     return [];
  //   }
  
  //   const lastTransactions = await collection.aggregate([
  //     { $match: { userId: { $in: userIds } } },
  //     { $sort: { userId: 1, timestamp: -1 } },
  //     { $group: { _id: '$userId', lastTransaction: { $first: '$$ROOT' } } },
  //     { $replaceRoot: { newRoot: '$lastTransaction' } },
  //     { 
  //       $match: {
  //         balanceAfterTransaction: { $ne: 100 } // ⚡️ Only users whose last balance is NOT 100
  //       }
  //     },
  //     { $limit: n },
  //   ]).toArray();
  
  //   return lastTransactions.map((tx) => ({ userId: tx.userId }));
  // }
  
  

  async expireUser(userId: Types.ObjectId): Promise<boolean> {
    const collection = this.connection.collection('_iambalances');
  
    const lastTransaction = await collection.find({ userId })
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();
  
    if (!lastTransaction.length) {
      return false;
    }
  
    const lastTxId = lastTransaction[0]._id;
  
    const result = await collection.updateOne(
      { _id: lastTxId },
      { $set: { balanceAfterTransaction: 100 } }
    );
  
    return result.modifiedCount > 0;
  }

  async findUsersWithMinChatCount(minChats: number, limit: number): Promise<any[]> {
    const chatCollection = this.connection.collection('_userchatlogs');
  
    const pipeline = [
      { $group: { _id: '$telegramId', count: { $sum: 1 } } },
      { $match: { count: { $gte: minChats } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: '_iamusers',
          localField: '_id',
          foreignField: 'telegramID',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          telegramID: '$user.telegramID',
          telegramUserName: '$user.telegramUserName',
          telegramFirstName: '$user.telegramFirstName',
          telegramLastName: '$user.telegramLastName',
          mobile: '$user.mobile',
          chatCount: '$count',
        },
      },
    ];
  
    return await chatCollection.aggregate(pipeline).toArray();
  }
  
  async findExpiredUsers(n: number): Promise<any[]> {
    const balances = this.connection.collection('_iambalances');
    const users = this.connection.collection('_iamusers');
  
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
  
    const expired = await balances.aggregate([
      {
        $match: {
          transactionType: { $in: ['deposit', 'achievementsreward'] },
          timestamp: { $lt: thirtyDaysAgo },
        },
      },
      { $sort: { userId: 1, timestamp: -1 } },
      { $group: { _id: '$userId', lastTransaction: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$lastTransaction' } },
      { $match: { balanceAfterTransaction: { $gt: 100 } } },
      { $sort: { timestamp: -1 } }, // Sort by recency
      { $limit: n },
      {
        $lookup: {
          from: '_iamusers',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          telegramID: '$user.telegramID',
          mobile: '$user.mobile',
          telegramUserName: '$user.telegramUserName',
          telegramFirstName: '$user.telegramFirstName',
          telegramLastName: '$user.telegramLastName',
          balanceAfterTransaction: '$balanceAfterTransaction',
          lastRenewDate: { $toString: '$timestamp' },
        },
      },
    ]).toArray();
  
    // Optional: Convert UNIX timestamp to Jalali
    return expired.map((u: any) => ({
      ...u,
      lastRenewDate: moment.unix(Number(u.lastRenewDate)).format('jYYYY/jMM/jDD'),
    }));
  }
  
  
  async findUsersWithTopDeposits(limit: number): Promise<any[]> {
    const balanceCol = this.connection.collection('_iambalances');
    const userCol = this.connection.collection('_iamusers');
  
    const result = await balanceCol.aggregate([
      { $match: { transactionType: 'deposit' } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$userId',
          totalAmount: { $sum: '$amount' },
          lastBalance: { $first: '$balanceAfterTransaction' },
          lastTimestamp: { $first: '$timestamp' }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: '_iamusers',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          _id: 0,
          telegramID: '$userInfo.telegramID',
          telegramUserName: '$userInfo.telegramUserName',
          telegramFirstName: '$userInfo.telegramFirstName',
          telegramLastName: '$userInfo.telegramLastName',
          mobile: '$userInfo.mobile',
          totalAmount: 1,
          lastBalance: 1,
          lastTimestamp: 1
        }
      }
    ]).toArray();
    
  
    return result;
  }
  
  

  

}



