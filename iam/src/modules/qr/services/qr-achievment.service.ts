import { Injectable } from '@nestjs/common';
import { AchievementRepository } from '../database/repositories/qr-achievement.repository';
import { AchievementDto, AchievementInsertDto } from '../dto/achievement.dto';
import { Types } from 'mongoose';

@Injectable()
export class AchievementService {
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
}
