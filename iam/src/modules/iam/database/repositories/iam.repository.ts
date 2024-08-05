// iam/database/repositories/iam.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import {  UserInsertDto } from '../../dto/user.dto'; 

@Injectable()
export class IamRepository {
  constructor(
    @InjectConnection('service') private connection: Connection
  ) { }

  async createUser(dto: UserInsertDto): Promise<any> {
    const collection = this.connection.collection('_iamusers'
    );
    await collection.insertOne({
      address: dto.address,
      walletType: dto.walletType,
      createdDate: new Date().toISOString(),
    });
    const user = await collection.findOne({ address: dto.address });
    if (!user) {
      // Handle the case where the agent is not found
      throw new Error('User insert not completed.');
    }
    // Return the inserted document
    return user;
  }

  async findUserByAddress(address: string): Promise<any> {
    const collection = this.connection.collection('_iamusers'
  );
    const user = await collection.findOne({ address: address });
    // Return the inserted document
    return user;
  }

  // ... add more repository methods as needed
}