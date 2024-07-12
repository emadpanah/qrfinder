// src/modules/qr/database/repositories/qr-achievement.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { AchievementDto } from '../../dto/achievement.dto';
import { QRCode } from '../schemas/qr-qrcode.schema';

@Injectable()
export class AchievementRepository {
  constructor(
    @InjectConnection('service') private connection: Connection
  ) {}

  async createAchievement(dto: AchievementDto): Promise<any> {
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

  async saveQRCode(qrCode: QRCode): Promise<any> {
    const collection = this.connection.collection('_qrqrcodes');
    await collection.insertOne(qrCode);
    const savedQRCode = await collection.findOne({ code: qrCode.code });
    if (!savedQRCode) {
      throw new Error('QR Code insert not completed.');
    }
    return savedQRCode;
  }
}
