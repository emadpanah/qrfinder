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
    
    await collection.insertOne({
      telegramID: dto.telegramID,
      mobile: dto.mobile,
      telegramUserName: dto.telegramUserName,
      telegramFirstName: dto.telegramFirstName,
      telegramLastName: dto.telegramLastName,
      telegramLanCode: dto.telegramLanCode,
      createdDate: Date.now(),
    });
    const user = await collection.findOne({ telegramID: dto.telegramID });
    if (!user) {
      // Handle the case where the agent is not found
      throw new Error('User insert not completed.');
    }
    // Return the inserted document
    return user;
  }

  async updateUser(
    telegramID: string,
    username: string,
  ): Promise<any> {
    const collection = this.connection.collection('_iamusers');
    await collection.updateOne(
      { telegramID: telegramID },
      {
        telegramUserName: username,
      },
    );
    const user = await collection.findOne({ telegramID: telegramID });
    if (!user) {
      // Handle the case where the agent is not found
      throw new Error('User update not completed.');
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
