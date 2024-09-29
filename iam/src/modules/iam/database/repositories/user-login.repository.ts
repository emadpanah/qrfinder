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
}
