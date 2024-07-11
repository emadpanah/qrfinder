import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { AchievementInsertDto } from '../../dto/achievement.dto';

@Injectable()
export class AchievementRepository {
  constructor(
    @InjectConnection('service') private connection: Connection
  ) {}

  async createAchievement(dto: AchievementInsertDto): Promise<any> {
    const collection = this.connection.collection('_qrachievements');
    await collection.insertOne(dto);
    const achievement = await collection.findOne({ name: dto.name });
    if (!achievement) {
      throw new Error('Insert not completed.');
    }
    return achievement;
  }

  async findAchievementById(id: Types.ObjectId): Promise<any> {
    const collection = this.connection.collection('_qrachievements');
    const achievement = await collection.findOne({ _id: id });
    return achievement;
  }

  // ... add more repository methods as needed
}
