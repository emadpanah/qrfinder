import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { AchievementDto, AchievementInsertDto } from '../../dto/achievement.dto';
import { AchievementSelectedInsertDto, AchievementSelectedDto, AchievementSelectedFullDto } from '../../dto/achievement-selected.dto';
import { QRCodeInertDto, QRCodeDto } from '../../dto/qrcode.dto';
import { QrScanDto, QrScanFullDto } from '../../dto/qrscan.dto';
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

  async createAchievementSelected(dto: AchievementSelectedInsertDto): Promise<AchievementSelectedFullDto> {
    const collection = this.connection.collection('_qrachievementselected');
    await collection.insertOne(dto);
    const achievementSelected = this.findAchievementSelectedByUserAndAchiId(dto.userId, dto.achievementId);

    if (!achievementSelected) {
      throw new Error('Insert not completed.');
    }
    return achievementSelected;
  }

  async doneAchievementSelected(id: Types.ObjectId): Promise<boolean> {
    const collection = this.connection.collection('_qrachievementselected');
    const updateResult = await collection.updateOne(
      { _id: id },
      { $set: { doneDate: new Date() } }
    );
  
    // Check if the update was successful
    if (updateResult.matchedCount === 0) {
      throw new Error('No document found with the provided ID.');
    }
  
    if (updateResult.modifiedCount === 0) {
      throw new Error('Update not complete.');
    }
    const achievementSelected = await collection.findOne(
      { _id: id }
    ) as unknown as AchievementSelectedDto;
    if (!achievementSelected) {
      throw new Error('Failed to retrieve the updated document.');
    }
    return true;
  }

  async createQrScan(dto: QrScanDto): Promise<QrScanDto> {
    const collection = this.connection.collection('_qrscanqr');
    await collection.insertOne(dto);
    const achievementSelected = await collection.
    findOne(
      { _id: dto._id}
    ) as unknown as QrScanDto;
    if (!achievementSelected) {
      throw new Error('Insert not completed.');
    }
    return achievementSelected;
  }

  async findQRScanbyUserIdAndqrId(userId: Types.ObjectId, qrCodeId: Types.ObjectId): Promise<QrScanDto> {
    const collection = this.connection.collection('_qrscanqr');
    const qrCode = await collection.findOne({ userId: userId, qrCodeId: qrCodeId })as unknown as QrScanDto;
    return qrCode;
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


  async findAchievementSelectedByUserAndAchiId(userId: Types.ObjectId, achievementId: Types.ObjectId): Promise<AchievementSelectedFullDto> {

    const selectedCollection = this.connection.collection('_qrachievementselected');
  
    const pipeline = [
      {
        $match: { userId: new Types.ObjectId(userId) , achievementId: new Types.ObjectId(achievementId) }
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
          qrTarget: '$achievementDetails.qrTarget',
          startDate: '$achievementDetails.startDate',
        }
      }
    ];
  
    const fullDtos = await selectedCollection.aggregate(pipeline).toArray();
    console.log('Full DTOs:', JSON.stringify(fullDtos, null, 2)); // Log the result for debugging

    // Since aggregation returns an array, ensure to return the first element if it exists
    if (fullDtos.length > 0) {
      return fullDtos[0] as AchievementSelectedFullDto;
    } else {
      throw new Error('Achievement selected not found');
    }

  }  

  async findQrScannedByUser(userId: Types.ObjectId, achievementId: Types.ObjectId): Promise<QrScanFullDto[]> {
    const collection = this.connection.collection('_qrscanqr');

    const pipeline = [
      {
        $match: {
          userId: new Types.ObjectId(userId)
        }
      },
      {
        $lookup: {
          from: '_qrqrcodes',
          localField: 'qrCodeId',
          foreignField: '_id',
          as: 'qrDetails'
        }
      },
      {
        $unwind: '$qrDetails'
      },
      {
        $match: {
          'qrDetails.achievementId': new Types.ObjectId(achievementId)
        }
      },
      {
        $project: {
          _id: 1,
          qrCodeId: 1,
          userId: 1,
          addedDate: 1,
          lat: 1,
          lon: 1,
          link: '$qrDetails.link',
          order: '$qrDetails.order'
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
          qrTarget: '$achievementDetails.qrTarget',
          startDate: '$achievementDetails.startDate',
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
