// src/modules/qr/controller/qr-achievement.controller.ts
import { Controller, Post, Body, Get, Param, ValidationPipe, Query } from '@nestjs/common';
import { AchievementService } from '../services/qr-achievment.service';
import { AchievementDto } from '../dto/achievement.dto';
import { AchievementSelectedDto } from '../dto/achievement-selected.dto';
import { Logger } from '@nestjs/common';
import { Types } from 'mongoose';

@Controller('qr-achievements')
export class AchievementController {
  private readonly logger = new Logger(AchievementController.name);

  constructor(private readonly achievementService: AchievementService) {}

  @Post('/create')
  async createAchievement(@Body(new ValidationPipe()) body: AchievementDto): Promise<AchievementDto> {
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

  @Get('/campaign/:campaignId')
  async findAchievementsByCampaignId(@Param('campaignId') campaignId: string): Promise<AchievementDto[]> {
    return this.achievementService.findAchievementsByCampaignId(campaignId);
  }

  @Post('/create-selected')
  async createAchievementSelected(@Body(new ValidationPipe()) body: AchievementSelectedDto): Promise<AchievementSelectedDto> {
    try {
      const achievementSelected = await this.achievementService.createAchievementSelected(body);
      return achievementSelected;
    } catch (error) {
      this.logger.error('Error creating achievement selected', error);
      throw error;
    }
  }

  @Get('/selected/:id')
  async findAchievementSelectedById(@Param('id') id: string): Promise<AchievementSelectedDto> {
    return this.achievementService.findAchievementSelectedById(id);
  }

  @Get('/selected/user/:userId')
  async findAchievementSelectedByUser(@Param('userId') userId: string): Promise<AchievementSelectedDto[]> {
    return this.achievementService.findAchievementSelectedByUser(userId);
  }

  @Post('/scan')
  async handleScan(@Query('campaignId') campaignId: string, @Query('achievementId') achievementId: string, @Query('userId') userId: string, @Query('parentId') parentId: string) {
    try {
      const achievementSelected = await this.achievementService.createAchievementSelected({
        Id: new Types.ObjectId(),
        achievementId: new Types.ObjectId(achievementId),
        userId: new Types.ObjectId(userId),
        parentId: new Types.ObjectId(parentId), // Add parentId
        qrCode: '', // This will be generated later
      });

      // Generate a new QR code or link for the user-specific achievement
      const qrCode = await this.achievementService.generateUserSpecificQRCode(campaignId, achievementSelected.Id.toString(), userId);
      achievementSelected.qrCode = qrCode;

      // Update the achievementSelected with the new QR code
      await this.achievementService.updateAchievementSelected(achievementSelected);

      return { message: 'User-specific achievement created', qrCode };
    } catch (error) {
      this.logger.error('Error handling scan', error);
      throw error;
    }
  }
}
