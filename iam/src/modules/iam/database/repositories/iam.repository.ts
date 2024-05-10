// iam/database/repositories/iam.repository.ts
import { Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { IAMUser, IAMUserDocument } from '../schemas/iam-user.schema';

@Injectable()
export class IamRepository {
  //constructor(@InjectModel(IAMUser.name) private readonly iamUserModel: Model<IAMUserDocument>) {}
  constructor(@InjectConnection('service') private connection: Connection) { }


  async createUser(username: string, password: string): Promise<any> {
    // const newUser = new this.iamUserModel({ username, password });
    // return newUser.save();
    const collection = this.connection.collection(
      '_users',
    );
    // Insert the document
    await collection.insertOne({
      username: username,
      password: password
    });
    const storedUser = await collection.findOne({ username: username });
    if (!storedUser) {
      // Handle the case where the agent is not found
      throw new Error('User not found after insertion');
    }
    return storedUser;
  }

  async findUserByUsername(username: string): Promise<any> {
    //return this.iamUserModel.findOne({ username }).exec();
    const collection = this.connection.collection(
      '_users',
    );
    //const shareholders = await collection.findOne({ code_melli: { $regex: dto.shareHolderId} }); 
    const foundUser = await collection.findOne({ username: username });
    if (!foundUser) {
      // Handle the case where the agent is not found
      throw new Error('User not found by given username');
    }
    return foundUser;
  }

  // ... add more repository methods as needed
}
