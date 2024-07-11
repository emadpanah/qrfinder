import { Controller, Post, Body, Get, Param, ValidationPipe } from '@nestjs/common';
import { AchievementService } from '../services/qr-achievment.service';
import { AchievementDto, AchievementInsertDto } from '../dto/achievement.dto';
import { Logger } from '@nestjs/common';

@Controller('achievements')
export class AchievementController {
  private readonly logger = new Logger(AchievementController.name);

  constructor(private readonly achievementService: AchievementService) {}

  @Post('/create')
  async createAchievement(@Body(new ValidationPipe()) body: AchievementInsertDto): Promise<AchievementDto> {
    try {
      const achievement = await this.achievementService.createAchievement(body);
      return achievement;
    } catch (error) {
      this.logger.error('Error creating achievement', error);
      throw error;
    }
  }

  @Get('/:id')
  async findAchievementById(@Param('id') id: string): Promise<AchievementDto> {
    return this.achievementService.findAchievementById(id);
  }
}
