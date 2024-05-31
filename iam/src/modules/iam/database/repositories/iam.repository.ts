// iam/database/repositories/iam.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { IAMUser, IAMUserDocument } from '../schemas/iam-user.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class IamRepository {
  constructor(
    @InjectModel(IAMUser.name) private readonly iamUserModel: Model<IAMUserDocument>,
    @InjectConnection('service') private connection: Connection
  ) { }

  async createUser(ethAddress: string, walletType: string): Promise<IAMUser> {
    const userId = uuidv4(); // Generate UUID for userId
    const newUser = new this.iamUserModel({
      ethAddress,
      userId,
      walletType,
      createdDate: new Date()
    });
    return newUser.save();
  }

  async findUserByAddress(ethAddress: string): Promise<IAMUser> {
    const foundUser = await this.iamUserModel.findOne({ ethAddress }).exec();
    if (!foundUser) {
      throw new Error('User not found by given address');
    }
    return foundUser;
  }

  // ... add more repository methods as needed
}
