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

  async createLogin(newAddress: string, newToken: string): Promise<any> {
    const collection = this.connection.collection( '_userlogins',
    );

    await collection.insertOne({
      address: newAddress,
      token: newToken,
      createdDate: new Date().toISOString(),
    });

    return newToken;
  }

  async findLoginHistoryByAddress(searchAddress: string): Promise<any> {
    
    const collection = this.connection.collection( '_userlogins',
    );

    const userlogins = await collection.find({ address: searchAddress });
  
    return userlogins;
  }

  async findLatestLoginByAddress(searchAddress: string): Promise<any> {
    const collection = this.connection.collection( '_userlogins',
    );

    const userlogins = await collection.findOne({ address: searchAddress },
      { sort: { createdDate: -1 } });
  
    return userlogins;
  }

}
