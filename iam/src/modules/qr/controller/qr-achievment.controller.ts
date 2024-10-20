// src/modules/qr/controller/qr-achievement.controller.ts
import { Controller, Post, Body, Get, Param, ValidationPipe, Query, BadRequestException, Delete } from '@nestjs/common';
import { AchievementService } from '../services/qr-achievment.service';
import { AchievementDto, AchievementInsertDto } from '../dto/achievement.dto';
import { AchievementSelectedInsertDto, AchievementSelectedDto, AchievementSelectedFullDto, AchievementSelectedRefDto } from '../dto/achievement-selected.dto';
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

  @Get('/findbyid')
  async findAchievementById(@Query('id') id: string): Promise<AchievementDto> {
    try {
      console.log("campaignService.findAchievementById", id);
      return await this.achievementService.findAchievementById(id);
    } catch (error) {
      this.logger.error('Error finding findAchievement by ID', error);
      throw new BadRequestException('Error finding findAchievement by ID');
    }
  }

  @Get('/getall')
  async findAchievementsByCampaignId(@Query('campaignId') campaignId: string): Promise<AchievementDto[]> {
    try {
      return await this.achievementService.findAchievementsByCampaignId(campaignId);
    } catch (error) {
      this.logger.error('Error finding find Achievements By CampaignId', error);
      throw new BadRequestException('Error Achievements by campaignID');
    }
  }

  @Get('/getallbyuser')
  async findAchievementsSelectedByCampaignId(@Query('campaignId') campaignId: string, @Query('userId') userId: string): Promise<AchievementSelectedFullDto[]> {
    try {
      return await this.achievementService.findAchievementsSelectedByCampaignId(campaignId, userId);
    } catch (error) {
      this.logger.error('Error finding find Achievements Selected By CampaignId', error);
      throw new BadRequestException('Error Achievements selcted by campaignID');
    }
  }


  @Get('/get-selectedfullUA')
  async findAchievementSelectedByUserAndAchiId(@Query('userId') userId: string, @Query('achievementId') achievementId: string): Promise<AchievementSelectedFullDto> {
    return this.achievementService.findAchievementSelectedFullByUserAndAchiId(userId, achievementId);
  }

  @Post('/create-selected')
async createAchievementSelected(
  @Body() body: { achievementId: string; userId: string; parentId?: string }
): Promise<AchievementSelectedInsertDto> {
  try {
    const achievementInsertDto: AchievementSelectedInsertDto = {
      achievementId: new Types.ObjectId(body.achievementId),
      userId: new Types.ObjectId(body.userId),
      parentId: body.parentId == undefined ? null : new Types.ObjectId(body.parentId),
      addedDate: new Date().getTime(), // Add the addedDate here
    };

    // Create achievement selected record
    const achievementSelected = await this.achievementService.createAchievementSelected(achievementInsertDto);

    return achievementSelected;  // No need to generate or store the link
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
        userId: new Types.ObjectId(body.userId),
        qrCodeId: new Types.ObjectId(body.qrId),
        lat:body.lat,
        lon:body.lon,
        addedDate: new Date()
      };

      const qrscan = await this.achievementService.createqrScan(qrcodescan);
      return qrscan;
    } catch (error) {
      this.logger.error('Error creating qrscan', error);
      throw error;
    }
  }

  //
  @Post('/done-selected')
  async doneAchievementSelected(
    @Body() body: { achievementId: string; userId: string; }
  ): Promise<boolean> {
    try {
      const done = await this.achievementService.doneAchievementSelected(body.achievementId, body.userId);
      return done;
    } catch (error) {
      this.logger.error('Error done-selected achievement', error);
      throw error;
    }
  }

  @Get('/get-qrscan')
  async findQrScannedByUser(@Query('userId') userId: string, @Query('achievementId') achievementId: string): Promise<QrScanFullDto[]> {
    return this.achievementService.findQrScannedByUser(userId, achievementId);
  }

  
  @Delete('/delete-selected')
 async deleteAchievementSelected(
  @Body() body: { achievementId: string; userId: string }
): Promise<{success: boolean;  message: string }> {
  try {
    await this.achievementService.deleteAchievementSelected(body.achievementId, body.userId);
    return { success: true, message: 'Achievement unselected successfully' };
  } catch (error) {
    this.logger.error('Error deleting achievement selected', error);
    throw error;
  }
}

  @Get('/selected/:id')
  async findAchievementSelectedById(@Param('id') id: string): Promise<AchievementSelectedDto> {
    return this.achievementService.findAchievementSelectedById(id);
  }

  
  @Get('/get-allqrcodes')
  async findAllQRCodeByAchievementId(@Query('achievementId') Id: string): Promise<QRCodeDto[]> {
    return this.achievementService.findAllQRCodeByAchievementId(Id);
  }


  @Get('/get-selected')
  async findAchievementSelectedByUser(@Query('userId') userId: string): Promise<AchievementSelectedDto[]> {
    return this.achievementService.findAchievementSelectedByUser(userId);
  }

  @Get('/get-selectedfull')
  async findAchievementSelectedFullByUser(@Query('userId') userId: string): Promise<AchievementSelectedFullDto[]> {
    return this.achievementService.findAchievementSelectedFullByUser(userId);
  }
 
  @Get('/get-selectedfullref')
  async findAchievementSelRefFullByUserCam(@Query('userId') userId: string, @Query('campaignId') campaignId: string): Promise<AchievementSelectedRefDto[]> {
    return this.achievementService.findAchievementSelectedFullByUserCamId(userId, campaignId);
  }

  @Post('/scan')
  async handleScan(@Query('campaignId') campaignId: string, @Query('achievementId') achievementId: string, @Query('userId') userId: string, @Query('parentId') parentId: string) {
    try {
      const achievementSelected = await this.achievementService.createAchievementSelected({
        achievementId: new Types.ObjectId(achievementId),
        userId: new Types.ObjectId(userId),
        parentId: new Types.ObjectId(parentId), // Add parentId
        addedDate: new Date().getTime() // Add the addedDate here
      });

      // const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      // // Adjust the frontend URL to include 'qrApp' path
      // const qrCodeLink = `${baseUrl}/qrApp?a=${achievementId}&p=${userId}&t=q`;
      // achievementSelected.inviteLink = qrCodeLink;

      const achievementSelectedd = await this.achievementService.createAchievementSelected(achievementSelected);
      return achievementSelectedd;
   
    } catch (error) {
      this.logger.error('Error handling scan', error);
      throw error;
    }
  }
}
