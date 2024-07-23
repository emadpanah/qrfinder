import { Injectable } from '@nestjs/common';
import { AchievementRepository } from '../database/repositories/qr-achievement.repository';
import { AchievementDto } from '../dto/achievement.dto';
import { AchievementInsertDto, AchievementSelectedDto } from '../dto/achievement-selected.dto';
import { Types } from 'mongoose';

@Injectable()
export class AchievementService {
  constructor(private readonly achievementRepository: AchievementRepository) {}

  async createAchievement(dto: AchievementDto): Promise<AchievementDto> {
    const achievement = await this.achievementRepository.createAchievement(dto);
    return achievement;
  }

  async findAchievementById(id: string): Promise<AchievementDto> {
    const objectId = new Types.ObjectId(id);
    const achievement = await this.achievementRepository.findAchievementById(objectId);
    return achievement;
  }

  async createAchievementSelected(dto: AchievementInsertDto): Promise<AchievementSelectedDto> {
    const achievementSelected = await this.achievementRepository.createAchievementSelected(dto);
    return achievementSelected;
  }

  async findAchievementSelectedById(id: string): Promise<AchievementSelectedDto> {
    const objectId = new Types.ObjectId(id);
    const achievementSelected = await this.achievementRepository.findAchievementSelectedById(objectId);
    return achievementSelected;
  }

  async findAchievementSelectedByUser(userId: string): Promise<AchievementSelectedDto[]> {
    return await this.achievementRepository.findAchievementSelectedByUser(new Types.ObjectId(userId));
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
