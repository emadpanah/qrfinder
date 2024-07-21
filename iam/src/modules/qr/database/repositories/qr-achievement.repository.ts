import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { AchievementDto } from '../../dto/achievement.dto';
import { AchievementSelectedDto } from '../../dto/achievement-selected.dto';
import { QRCode } from '../schemas/qr-qrcode.schema';

@Injectable()
export class AchievementRepository {
  constructor(
    @InjectConnection('service') private connection: Connection
  ) {}

  async createAchievement(dto: AchievementDto): Promise<AchievementDto> {
    const collection = this.connection.collection('_qrachievements');
    await collection.insertOne(dto);
    const achievement = await collection.findOne({ name: dto.name }) as unknown as AchievementDto;
    if (!achievement) {
      throw new Error('Insert not completed.');
    }
    return achievement;
  }

  async findAchievementById(id: Types.ObjectId): Promise<AchievementDto> {
    const collection = this.connection.collection('_qrachievements');
    const achievement = await collection.findOne({ _id: id }) as unknown as AchievementDto;
    return achievement;
  }

  async saveQRCode(qrCode: QRCode): Promise<QRCode> {
    const collection = this.connection.collection('_qrqrcodes');
    await collection.insertOne(qrCode);
    const savedQRCode = await collection.findOne({ code: qrCode.code }) as unknown as QRCode;
    if (!savedQRCode) {
      throw new Error('QR Code insert not completed.');
    }
    return savedQRCode;
  }

  async findQRCodeById(id: Types.ObjectId): Promise<QRCode> {
    const collection = this.connection.collection('_qrqrcodes');
    const qrCode = await collection.findOne({ _id: id }) as unknown as QRCode;
    return qrCode;
  }

  async createAchievementSelected(dto: AchievementSelectedDto): Promise<AchievementSelectedDto> {
    const collection = this.connection.collection('_qrachievementselected');
    await collection.insertOne(dto);
    const achievementSelected = await collection.findOne({ _id: dto.Id }) as unknown as AchievementSelectedDto;
    if (!achievementSelected) {
      throw new Error('Insert not completed.');
    }
    return achievementSelected;
  }

  async findAchievementSelectedById(id: Types.ObjectId): Promise<AchievementSelectedDto> {
    const collection = this.connection.collection('_qrachievementselected');
    const achievementSelected = await collection.findOne({ _id: id }) as unknown as AchievementSelectedDto;
    return achievementSelected;
  }

  async findAchievementSelectedByUser(userId: Types.ObjectId): Promise<AchievementSelectedDto[]> {
    const collection = this.connection.collection('_qrachievementselected');
    return await collection.find({ userId }).toArray() as unknown as AchievementSelectedDto[];
  }

  async updateAchievementSelected(dto: AchievementSelectedDto): Promise<AchievementSelectedDto> {
    const collection = this.connection.collection('_qrachievementselected');
    await collection.updateOne({ _id: dto.Id }, { $set: { qrCode: dto.qrCode } });
    const updatedAchievementSelected = await collection.findOne({ _id: dto.Id }) as unknown as AchievementSelectedDto;
    return updatedAchievementSelected;
  }
  
  async findAchievementsByCampaignId(campaignId: Types.ObjectId): Promise<AchievementDto[]> {
    const collection = this.connection.collection('_qrachievements');
    const achievements = await collection.find({ campaignId }).toArray() as unknown as AchievementDto[];
    return achievements;
  }
}
