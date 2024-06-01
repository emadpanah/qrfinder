// iam/database/repositories/user-login-info.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserLogin, UserLoginDocument } from '../schemas/user-login.schema';

@Injectable()
export class UserLoginRepository {
  constructor(
    @InjectModel(UserLogin.name) private readonly userLoginModel: Model<UserLoginDocument>
  ) {}

  async createLogin(userId: string, token: string): Promise<UserLogin> {
    const newUserLogin = new this.userLoginModel({ userId, token, loginDate: new Date() });
    return newUserLogin.save();
  }

  async findLoginHistoryByEthAddress(ethAddress: string): Promise<UserLogin[]> {
    return this.userLoginModel
      .find({ ethAddress })
      .sort({ loginDate: -1 }) // Sort by loginDate in descending order
      .exec();
  }

  async findLatestLoginByEthAddress(ethAddress: string): Promise<UserLogin> {
    return this.userLoginModel
      .findOne({ ethAddress })
      .sort({ loginDate: -1 }) // Sort by loginDate in descending order
      .exec();
  }

}
