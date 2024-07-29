// src/modules/qr/controller/qr-achievement.controller.ts
import { Controller, Post, Body, Get, Param, ValidationPipe, Query, BadRequestException, Delete } from '@nestjs/common';
import { AchievementService } from '../services/qr-achievment.service';
import { AchievementDto, AchievementInsertDto } from '../dto/achievement.dto';
import { AchievementSelectedInsertDto, AchievementSelectedDto, AchievementSelectedFullDto } from '../dto/achievement-selected.dto';
import { Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { QRCodeDto } from '../dto/qrcode.dto';
import { QrScanDto, QrScanFullDto } from '../dto/qrscan.dto';

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
    @Body() body: { achievementId: string; userId: string; parentId?: string  }
  ): Promise<AchievementSelectedInsertDto> {
    try {
      const achievementInsertDto: AchievementSelectedInsertDto = {
        achievementId: new Types.ObjectId(body.achievementId),
        userId: new Types.ObjectId(body.userId),
        parentId: body.parentId ? new Types.ObjectId(body.parentId) : null,
        inviteLink:"",
        addedDate: new Date()  // Add the addedDate here
      };

      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      // Adjust the frontend URL to include 'qrApp' path
      const qrCodeLink = `${baseUrl}/qrApp?a=${body.achievementId}&p=${body.userId}&t=a`;
      achievementInsertDto.inviteLink = qrCodeLink;
  
      const achievementSelected = await this.achievementService.createAchievementSelected(achievementInsertDto);
      return achievementSelected;
    } catch (error) {
      this.logger.error('Error creating achievement selected', error);
      throw error;
    }
  }

  @Post('/create-qrscan')
  async createQrScan(
    @Body() body: { qrId: string; userId: string; lon?: number, lat?: number  }
  ): Promise<QrScanDto> {
    try {
      const qrcodescan: QrScanDto = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(body.userId).toString(),
        qrCodeId:body.qrId,
        lat:body.lat,
        lon:body.lon
      };

      const qrscan = await this.achievementService.createqrScan(qrcodescan);
      return qrscan;
    } catch (error) {
      this.logger.error('Error creating qrscan', error);
      throw error;
    }
  }

  @Get('/get-qrScan')
  async findQrScannedByUser(@Query('userId') userId: string): Promise<QrScanFullDto[]> {
    return this.achievementService.findQrScannedByUser(userId);
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

  
  @Get('/get-AllQRCodes')
  async findAllQRCodeByAchievementId(@Query('achievementId') Id: string): Promise<QRCodeDto[]> {
    return this.achievementService.findAllQRCodeByAchievementId(Id);
  }


  @Get('/get-selected')
  async findAchievementSelectedByUser(@Query('userId') userId: string): Promise<AchievementSelectedDto[]> {
    return this.achievementService.findAchievementSelectedByUser(userId);
  }

  @Get('/get-selectedFull')
  async findAchievementSelectedFullByUser(@Query('userId') userId: string): Promise<AchievementSelectedFullDto[]> {
    return this.achievementService.findAchievementSelectedFullByUser(userId);
  }

  @Post('/scan')
  async handleScan(@Query('campaignId') campaignId: string, @Query('achievementId') achievementId: string, @Query('userId') userId: string, @Query('parentId') parentId: string) {
    try {
      const achievementSelected = await this.achievementService.createAchievementSelected({
        achievementId: new Types.ObjectId(achievementId),
        userId: new Types.ObjectId(userId),
        parentId: new Types.ObjectId(parentId), // Add parentId
        inviteLink:'',
        addedDate: new Date()  // Add the addedDate here
      });

      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      // Adjust the frontend URL to include 'qrApp' path
      const qrCodeLink = `${baseUrl}/qrApp?a=${achievementId}&p=${userId}&t=q`;
      achievementSelected.inviteLink = qrCodeLink;

      const achievementSelectedd = await this.achievementService.createAchievementSelected(achievementSelected);
      return achievementSelectedd;
   
    } catch (error) {
      this.logger.error('Error handling scan', error);
      throw error;
    }
  }
}
