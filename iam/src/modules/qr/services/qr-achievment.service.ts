import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { AchievementRepository } from '../database/repositories/qr-achievement.repository';
import { AchievementDto, AchievementInsertDto } from '../dto/achievement.dto';
import { AchievementSelectedInsertDto, AchievementSelectedDto, AchievementSelectedFullDto } from '../dto/achievement-selected.dto';
import { Types } from 'mongoose';
import { QRCodeInertDto, QRCodeDto } from '../dto/qrcode.dto';
import { QrScanDto, QrScanFullDto } from '../dto/qrscan.dto';

@Injectable()
export class AchievementService {
  private readonly logger = new Logger(AchievementService.name);
  constructor(private readonly achievementRepository: AchievementRepository) {}

  async createAchievement(dto: AchievementInsertDto): Promise<AchievementDto> {
    const achievement = await this.achievementRepository.createAchievement(dto);
    return achievement;
  }

  async findAchievementById(id: string): Promise<AchievementDto> {
    const objectId = new Types.ObjectId(id);
    const achievement = await this.achievementRepository.findAchievementById(objectId);
    return achievement;
  }

  async createAchievementQrCode(dto: QRCodeInertDto): Promise<QRCodeDto> {
    const achievementSelected = await this.achievementRepository.saveQRCode(dto);
    return achievementSelected;
  }
  //saveQRCode

  async createAchievementSelected(dto: AchievementSelectedInsertDto): Promise<AchievementSelectedFullDto> {
    try {
      const result = await this.achievementRepository.createAchievementSelected(dto);
      if (!result) {
        throw new Error('Insert not completed.');
      }
      return result;
    } catch (error) {
      if (error.code === 11000) { // Duplicate key error code in MongoDB
        const added = await this.achievementRepository
        .findAchievementSelectedByUserandachiId(dto.userId, dto.achievementId);
        if(!!added)
          return added;
        throw new ConflictException('User has already selected this achievement.');
      }
      this.logger.error('Error creating achievement selected', error);
      throw error;
    }
  }

  async createqrScan(dto: QrScanDto): Promise<QrScanDto> {
    try {
      const result = await this.achievementRepository.createQrScan(dto);
      if (!result) {
        throw new Error('Insert not completed.');
      }
      return result;
    } catch (error) {
      if (error.code === 11000) { // Duplicate key error code in MongoDB
        const scanned = await this.achievementRepository.
        findQRScanbyUserIdAndqrId(new Types.ObjectId(dto.userId), dto.qrCodeId);
        if(!!scanned)
          return scanned;
        throw new ConflictException('User has already scan selected qrcode');
      }
      this.logger.error('Error creating qrcodescan', error);
      throw error;
    }
  }

  async deleteAchievementSelected(achievementId: string, userId: string): Promise<void> {
    try {
      await this.achievementRepository.deleteAchievementSelected(achievementId, userId);
    } catch (error) {
      this.logger.error('Error deleting achievement selected', error);
      throw error;
    }
  }

  async findAllQRCodeByAchievementId(id: string): Promise<QRCodeDto[]> {
    const objectId = new Types.ObjectId(id);
    const achievementSelected = await this.achievementRepository.findAllQRCodeByAchievementId(objectId);
    return achievementSelected;
  }

  async doneAchievementSelected(id: string): Promise<boolean> {
    const objectId = new Types.ObjectId(id);
    const done = await this.achievementRepository.doneAchievementSelected(objectId);
    return done;
  }


  async findAchievementSelectedById(id: string): Promise<AchievementSelectedDto> {
    const objectId = new Types.ObjectId(id);
    const achievementSelected = await this.achievementRepository.findAchievementSelectedById(objectId);
    return achievementSelected;
  }

  async findAchievementSelectedByUser(userId: string): Promise<AchievementSelectedDto[]> {
    return await this.achievementRepository.findAchievementSelectedByUser(new Types.ObjectId(userId));
  }

  async findQrScannedByUser(userId: string): Promise<QrScanFullDto[]> {
    return await this.achievementRepository.findQrScannedByUser(new Types.ObjectId(userId));
  }

  async findAchievementSelectedFullByUser(userId: string): Promise<AchievementSelectedFullDto[]> {
    return await this.achievementRepository.findAchievementSelectedFullByUser(new Types.ObjectId(userId));
  }

  async generateUserSpecificQRCode(campaignId: string, achievementSelectedId: string, userId: string): Promise<string> {
    const link = `${process.env.BASE_URL}scan?campaignId=${campaignId}&achievementSelectedId=${achievementSelectedId}&userId=${userId}`;
    return link;
  }


  async findAchievementsByCampaignId(campaignId: string): Promise<AchievementDto[]> {
    const objectId = new Types.ObjectId(campaignId);
    const achievements = await this.achievementRepository.findAchievementsByCampaignId(objectId);
    return achievements;
  }
}
