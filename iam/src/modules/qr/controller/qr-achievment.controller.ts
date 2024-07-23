// src/modules/qr/controller/qr-achievement.controller.ts
import { Controller, Post, Body, Get, Param, ValidationPipe, Query, BadRequestException, Delete } from '@nestjs/common';
import { AchievementService } from '../services/qr-achievment.service';
import { AchievementDto } from '../dto/achievement.dto';
import { AchievementInsertDto, AchievementSelectedDto } from '../dto/achievement-selected.dto';
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

  @Get('/findById')
  async findAchievementById(@Query('id') id: string): Promise<AchievementDto> {
    try {
      console.log("campaignService.findCampaignById", id);
      return await this.achievementService.findAchievementById(id);
    } catch (error) {
      this.logger.error('Error finding campaign by ID', error);
      throw new BadRequestException('Error finding campaign by ID');
    }
  }

  @Get('/GetAll')
  async findAchievementsByCampaignId(@Query('campaignId') campaignId: string): Promise<AchievementDto[]> {
    try {
      return await this.achievementService.findAchievementsByCampaignId(campaignId);
    } catch (error) {
      this.logger.error('Error finding find Achievements By CampaignId', error);
      throw new BadRequestException('Error Achievements by campaignID');
    }
  }

  @Post('/create-selected')
  async createAchievementSelected(
    @Body() body: { achievementId: string; userId: string }
  ): Promise<AchievementSelectedDto> {
    try {
      const achievementInsertDto: AchievementInsertDto = {
        achievementId: new Types.ObjectId(body.achievementId),
        userId: new Types.ObjectId(body.userId),
        parentId: null,
        qrCode: "" ,
        addedDate: new Date()  // Add the addedDate here
      };

      const achievementSelected = await this.achievementService.createAchievementSelected(achievementInsertDto);
      return achievementSelected;
    } catch (error) {
      this.logger.error('Error creating achievement selected', error);
      throw error;
    }
  }

  @Delete('/delete-selected')
 async deleteAchievementSelected(
  @Body() body: { achievementId: string; userId: string }
): Promise<{ message: string }> {
  try {
    await this.achievementService.deleteAchievementSelected(body.achievementId, body.userId);
    return { message: 'Achievement unselected successfully' };
  } catch (error) {
    this.logger.error('Error deleting achievement selected', error);
    throw error;
  }
}

  @Get('/selected/:id')
  async findAchievementSelectedById(@Param('id') id: string): Promise<AchievementSelectedDto> {
    return this.achievementService.findAchievementSelectedById(id);
  }

  @Get('/get-selected')
  async findAchievementSelectedByUser(@Query('userId') userId: string): Promise<AchievementSelectedDto[]> {
    return this.achievementService.findAchievementSelectedByUser(userId);
  }

  @Post('/scan')
  async handleScan(@Query('campaignId') campaignId: string, @Query('achievementId') achievementId: string, @Query('userId') userId: string, @Query('parentId') parentId: string) {
    try {
      const achievementSelected = await this.achievementService.createAchievementSelected({
        achievementId: new Types.ObjectId(achievementId),
        userId: new Types.ObjectId(userId),
        parentId: new Types.ObjectId(parentId), // Add parentId
        qrCode: '', // This will be generated later
        addedDate: new Date()  // Add the addedDate here
      });

      // Generate a new QR code or link for the user-specific achievement
      const qrCode = await this.achievementService.generateUserSpecificQRCode(campaignId, achievementSelected._id.toString(), userId);
      achievementSelected.qrCode = qrCode;

      // Update the achievementSelected with the new QR code
      //await this.achievementService.updateAchievementSelected(achievementSelected);

      return { message: 'User-specific achievement created', qrCode };
    } catch (error) {
      this.logger.error('Error handling scan', error);
      throw error;
    }
  }
}
