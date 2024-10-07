// iam/database/repositories/user-login-info.repository.ts
import { Injectable, Type } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { UserLogin, UserLoginDocument } from '../schemas/user-login.schema';

@Injectable()
export class UserLoginRepository {
  constructor(@InjectConnection('service') private connection: Connection) {}

  async createLogin(userId: Types.ObjectId, newToken: string): Promise<any> {
    const collection = this.connection.collection('_userlogins');

    await collection.insertOne({
      userId: userId,
      token: newToken,
      createdDate: Date.now(),
      shopToken:''
    });

    return newToken;
  }

  async findLoginHistoryByUserId(id: Types.ObjectId): Promise<any> {
    const collection = this.connection.collection('_userlogins');

    const userlogins = await collection.find({ userId: id });

    return userlogins;
  }

  async findLatestLoginByUserId(id: Types.ObjectId): Promise<any> {
    const collection = this.connection.collection('_userlogins');

    const userlogins = await collection.findOne(
      { userId: id },
      { sort: { createdDate: -1 } },
    );

    return userlogins;
  }

  async updateLoginWithShopToken(userId: Types.ObjectId, shopToken: string): Promise<void> {
    const collection = this.connection.collection('_userlogins');
    const objectIdUserId = new Types.ObjectId(userId);
    // Find the latest login entry for the user
    const latestLogin = await collection.findOne(
      { userId: objectIdUserId },
      { sort: { createdDate: -1 } } // Sort by createdDate (or loginDate) in descending order
    );
  
    if (latestLogin) {
      // Update the shopToken for the latest login
      await collection.updateOne(
        { _id: latestLogin._id }, // Use the _id of the most recent login
        { $set: { shopToken: shopToken } }
      );
    } else {
      console.log(`No login record found for userId: ${userId}`);
    }
  }
  

}
