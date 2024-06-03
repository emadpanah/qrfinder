// iam/database/repositories/iam.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { IAMUser, IAMUserDocument } from '../schemas/iam-user.schema';
import { v4 as uuidv4 } from 'uuid';
import { UserDto, UserInsertDto } from '../../dto/user.dto'; 

@Injectable()
export class IamRepository {
  constructor(
    @InjectConnection('service') private connection: Connection
  ) { }

  async createUser(dto: UserInsertDto): Promise<any> {
    const collection = this.connection.collection('_iamusers'
    );
    const userId = uuidv4(); // Generate UUID for userId
    await collection.insertOne({
      ethAddress: dto.ethAddress,
      walletType: dto.walletType,
      createdDate: new Date().toISOString(),
    });
    const user = await collection.findOne({ ethAddress: dto.ethAddress });
    if (!user) {
      // Handle the case where the agent is not found
      throw new Error('Insert not completed.');
    }
    // Return the inserted document
    return user;
  }

  async findUserByAddress(EthAddress: string): Promise<any> {
    const collection = this.connection.collection('_iamusers'
  );
    const user = await collection.findOne({ ethAddress: EthAddress });
    // Return the inserted document
    return user;
  }

  // ... add more repository methods as needed
}