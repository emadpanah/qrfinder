import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { AchievementRepository } from '../database/repositories/qr-achievement.repository';
import { AchievementDto, AchievementInsertDto } from '../dto/achievement.dto';
import { AchievementSelectedInsertDto, AchievementSelectedDto, AchievementSelectedFullDto } from '../dto/achievement-selected.dto';
import { Types } from 'mongoose';

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

  // async createAchievementSelected(dto: AchievementInsertDto): Promise<AchievementSelectedDto> {
  //   const achievementSelected = await this.achievementRepository.createAchievementSelected(dto);
  //   return achievementSelected;
  // }

  async createAchievementSelected(dto: AchievementSelectedInsertDto): Promise<AchievementSelectedDto> {
    try {
      const result = await this.achievementRepository.createAchievementSelected(dto);
      if (!result) {
        throw new Error('Insert not completed.');
      }
      return result;
    } catch (error) {
      if (error.code === 11000) { // Duplicate key error code in MongoDB
        throw new ConflictException('User has already selected this achievement.');
      }
      this.logger.error('Error creating achievement selected', error);
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

  async findAchievementSelectedById(id: string): Promise<AchievementSelectedDto> {
    const objectId = new Types.ObjectId(id);
    const achievementSelected = await this.achievementRepository.findAchievementSelectedById(objectId);
    return achievementSelected;
  }

  async findAchievementSelectedByUser(userId: string): Promise<AchievementSelectedDto[]> {
    return await this.achievementRepository.findAchievementSelectedByUser(new Types.ObjectId(userId));
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
