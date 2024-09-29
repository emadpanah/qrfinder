// iam/database/repositories/iam.repository.ts
import { Injectable, Type } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { UserInsertDto } from '../../dto/user.dto';

@Injectable()
export class IamRepository {
  constructor(@InjectConnection('service') private connection: Connection) {}

  async createUser(dto: UserInsertDto): Promise<any> {
    const collection = this.connection.collection('_iamusers');
    const i = new Types.ObjectId();
    await collection.insertOne({
      _id: i,
      telegramID: dto.telegramID,
      createdDate: Date.now(),
    });
    const user = await collection.findOne({ _id: i });
    if (!user) {
      // Handle the case where the agent is not found
      throw new Error('User insert not completed.');
    }
    // Return the inserted document
    return user;
  }

  async findUserByTelegramID(telegramId: string): Promise<any> {
    const collection = this.connection.collection('_iamusers');
    const user = await collection.findOne({ telegramID: telegramId });
    // Return the inserted document
    return user;
  }

  async findUserById(id: Types.ObjectId): Promise<any> {
    const collection = this.connection.collection('_iamusers');
    const user = await collection.findOne({ _id: new Types.ObjectId(id) });
    // Return the inserted document
    return user;
  }
}
