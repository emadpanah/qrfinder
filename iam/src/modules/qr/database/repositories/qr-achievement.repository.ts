import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { AchievementDto, AchievementInsertDto } from '../../dto/achievement.dto';
import { AchievementSelectedInsertDto, AchievementSelectedDto, AchievementSelectedFullDto } from '../../dto/achievement-selected.dto';
import { QRCodeInertDto, QRCodeDto } from '../../dto/qrcode.dto';
import { QrScanDto, QrScanFullDto } from '../../dto/qrscan.dto';
import { link } from 'fs';
@Injectable()
export class AchievementRepository {
  constructor(
    @InjectConnection('service') private connection: Connection
  ) {}

  async createAchievement(dto: AchievementInsertDto): Promise<AchievementDto> {
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

  async saveQRCode(qrCode: QRCodeInertDto): Promise<QRCodeDto> {
    const collection = this.connection.collection('_qrqrcodes');
    await collection.insertOne(qrCode);
    const savedQRCode = await collection.findOne({ achievementId: qrCode.achievementId, order: qrCode.order }) as unknown as QRCodeDto;
    if (!savedQRCode) {
      throw new Error('QR Code insert not completed.');
    }
    return savedQRCode;
  }

  async findQRCodeById(id: Types.ObjectId): Promise<QRCodeDto> {
    const collection = this.connection.collection('_qrqrcodes');
    const qrCode = await collection.findOne({ _id: id }) as unknown as QRCodeDto;
    return qrCode;
  }

  async findAllQRCodeByAchievementId(id: Types.ObjectId): Promise<QRCodeDto[]> {
    const collection = this.connection.collection('_qrqrcodes');
    const qrCode = await collection.find({ achievementId: id }).toArray() as unknown as QRCodeDto[];
    return qrCode;
  }

  async createAchievementSelected(dto: AchievementSelectedInsertDto): Promise<AchievementSelectedDto> {
    const collection = this.connection.collection('_qrachievementselected');
    await collection.insertOne(dto);
    const achievementSelected = await collection.
    findOne(
      { achievementId: dto.achievementId, userId: dto.userId }
      // {
      //   $or: [{achievementId: { $regex: dto.achievementId},},
      //     {userId: { $regex: dto.userId},},
          
      //     ,],
      // }
    ) as unknown as AchievementSelectedDto;
    if (!achievementSelected) {
      throw new Error('Insert not completed.');
    }
    return achievementSelected;
  }

  async createQrScan(dto: QrScanDto): Promise<QrScanDto> {
    const collection = this.connection.collection('_qrscanqr');
    await collection.insertOne(dto);
    const achievementSelected = await collection.
    findOne(
      { _id: dto._id, userId: dto.userId }
      // {
      //   $or: [{achievementId: { $regex: dto.achievementId},},
      //     {userId: { $regex: dto.userId},},
          
      //     ,],
      // }
    ) as unknown as QrScanDto;
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

  async findQrScannedByUser(userId: Types.ObjectId): Promise<QrScanFullDto[]> {
    const collection = this.connection.collection('_qrscanqr');

    const pipeline = [
      {
        $match: { userId: new Types.ObjectId(userId) }
      },
      {
        $lookup: {
          from: '_qrqrcode',
          localField: 'qrId',
          foreignField: '_id',
          as: 'qrDetails'
        }
      },
      {
        $unwind: '$qrDetails'
      },
      {
        $project: {
          _id: 1,
          qrCodeId: 1,
          userId: 1,
          lat: 1,
          lon: 1,
          link: '$qrDetails.name',
        }
      }
    ];
  
    const fullDtos = await collection.aggregate(pipeline).toArray();
    return fullDtos as QrScanFullDto[];
  }

  async findAchievementSelectedFullByUser(userId: Types.ObjectId): Promise<AchievementSelectedFullDto[]> {
    const selectedCollection = this.connection.collection('_qrachievementselected');
  
    console.log(`Looking for userId: ${userId}`);
  
    const pipeline = [
      {
        $match: { userId: new Types.ObjectId(userId) }
      },
      {
        $lookup: {
          from: '_qrachievements',
          localField: 'achievementId',
          foreignField: '_id',
          as: 'achievementDetails'
        }
      },
      {
        $unwind: '$achievementDetails'
      },
      {
        $project: {
          _id: 1,
          achievementId: 1,
          userId: 1,
          inviteLink: 1,
          parentId: 1,
          addedDate: 1,
          name: '$achievementDetails.name',
          reward: '$achievementDetails.reward',
          expirationDate: '$achievementDetails.expirationDate',
          description: '$achievementDetails.description',
          qrOrderType: '$achievementDetails.qrOrderType',
          achievementType: '$achievementDetails.achievementType',
          qrProofByLocation: '$achievementDetails.qrProofByLocation',
          campaignId:'$achievementDetails.campaignId',
          
        }
      }
    ];
  
    const fullDtos = await selectedCollection.aggregate(pipeline).toArray();
    console.log('Full DTOs:', JSON.stringify(fullDtos, null, 2)); // Log the result for debugging

    return fullDtos as AchievementSelectedFullDto[];
}

  async findAchievementsByCampaignId(campaignId: Types.ObjectId): Promise<AchievementDto[]> {
    const collection = this.connection.collection('_qrachievements');
    const achievements = await collection.find({ campaignId }).toArray() as unknown as AchievementDto[];
    return achievements;
  }

  async deleteAchievementSelected(achievementId: string, userId: string): Promise<void> {
    const collection = this.connection.collection('_qrachievementselected');
    await collection.deleteOne({
      achievementId: new Types.ObjectId(achievementId),
      userId: new Types.ObjectId(userId),
    });
  }
  
}
