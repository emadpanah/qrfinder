// iam/database/repositories/user-login-info.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { UserLogin, UserLoginDocument } from '../schemas/user-login.schema';

@Injectable()
export class UserLoginRepository {
  constructor(
   @InjectConnection('service') private connection: Connection
  ) {}

  async createLogin(newEthAddress: string, newToken: string): Promise<any> {
    const collection = this.connection.collection( '_userlogin',
    );

    await collection.insertOne({
      ethAddress: newEthAddress,
      token: newToken,
      createdDate: new Date().toISOString(),
    });

    return newToken;
  }

  async findLoginHistoryByEthAddress(searchEthAddress: string): Promise<any> {
    
    const collection = this.connection.collection( '_userlogin',
    );

    const userlogins = await collection.find({ ethAddress: searchEthAddress });
  
    return userlogins;
  }

  async findLatestLoginByEthAddress(searchEthAddress: string): Promise<any> {
    const collection = this.connection.collection( '_userlogin',
    );

    const userlogins = await collection.findOne({ ethAddress: searchEthAddress },
      { sort: { loginDate: -1 } });
  
    return userlogins;
  }

}
