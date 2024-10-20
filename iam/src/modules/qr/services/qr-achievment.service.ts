import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { AchievementRepository } from '../database/repositories/qr-achievement.repository';
import { AchievementDto, AchievementInsertDto } from '../dto/achievement.dto';
import { AchievementSelectedInsertDto, AchievementSelectedDto, AchievementSelectedFullDto, AchievementSelectedRefDto } from '../dto/achievement-selected.dto';
import { Types } from 'mongoose';
import { QRCodeInertDto, QRCodeDto } from '../dto/qrcode.dto';
import { QrScanDto, QrScanFullDto } from '../dto/qrscan.dto';
import { CurrencyRepository } from '../../iam/database/repositories/currency.repository';
import { BalanceRepository } from '../../iam/database/repositories/balance.repository';
//import { BalanceService } from 'src/modules/iam/services/iam-balance.service';
import { BalanceDto } from 'src/modules/iam/dto/balance.dto';
import { UserInsertDto } from 'src/modules/iam/dto/user.dto';

@Injectable()
export class AchievementService {
  private readonly logger = new Logger(AchievementService.name);
  constructor(private readonly achievementRepository: AchievementRepository,
     private readonly currencyRepository: CurrencyRepository,
    private readonly balanceRepository: BalanceRepository,
    //private readonly balanceService: BalanceService
  ) {}

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

    // Create a new achievement selection
    async createAchievementSelected(dto: AchievementSelectedInsertDto): Promise<AchievementSelectedFullDto> {
      try {
        // Insert the achievement selection
        const result = await this.achievementRepository.createAchievementSelected(dto);
        if (!result) {
          throw new Error('Achievement selected insert not completed.');
        }
        else{

          console.log("AchievementSelected- achiId - ", result.achievementId);
        // Get the achievement details
        const achisel = await this.achievementRepository.findAchievementSelectedByUserAndAchiId(dto.userId, result.achievementId);
        if (!achisel) {
          throw new Error('Selected achievement not found.');
        }
  
        console.log("AchievementSelected - ", achisel);
        // Get the default currency
        const curr = await this.currencyRepository.findDefaultCurrency();
        if (!curr) {
          throw new Error('Currency not found.');
        }
  
        // If parentId exists, update the parent's balance with the whole reward
        if (dto.parentId) {
          const currentBalanceParent = await this.balanceRepository.findUserBalance(
            new Types.ObjectId(dto.parentId),
            new Types.ObjectId(curr._id)
          );
          const newBalanceParent = currentBalanceParent + achisel.reward.tokens;
  
          // Create a balance transaction for the parent (inviter) with the full reward
          const parentBalanceTransaction: BalanceDto = {
            userId: new Types.ObjectId(dto.parentId),
            transactionType: 'achievementsreward',
            amount: achisel.reward.tokens,  // Full reward goes to the parent
            currency: curr._id,
            transactionEntityId: dto.userId.toString(),
            balanceAfterTransaction: newBalanceParent,
            _id: new Types.ObjectId(),
            timestamp: new Date().getTime(),
          };
          console.log("addTransaction parent start ----------------------------");
          await this.balanceRepository.addTransaction(parentBalanceTransaction);
          console.log("addTransaction parent end ----------------------------");
        }
      
        // Return the inserted achievement selection
        return result;
        
      }

        
      } catch (error) {
        if (error.code === 11000) {
          // Handle duplicate entry error (already selected achievement)
          const added = await this.achievementRepository.findAchievementSelectedByUserAndAchiId(
            dto.userId, 
            dto.achievementId
          );
          if (added) return added;
          throw new ConflictException('User has already selected this achievement.');
        }
        this.logger.error('Error creating achievement selected', error);
        throw error;
      }
    }


  // async createAchievementSelected(dto: AchievementSelectedInsertDto): Promise<AchievementSelectedFullDto> {
  //   try {
  //     const result = await this.achievementRepository.createAchievementSelected(dto);
  //     if (!result) {
  //       throw new Error('Achievement selected insert not completed.');
  //     }
  //     return result;
  //   } catch (error) {
  //     if (error.code === 11000) { // Duplicate key error code in MongoDB
  //       const added = await this.achievementRepository
  //       .findAchievementSelectedByUserAndAchiId(dto.userId, dto.achievementId);
  //       if(!!added)
  //         return added;
  //       throw new ConflictException('User has already selected this achievement.');
  //     }
  //     this.logger.error('Error creating achievement selected', error);
  //     throw error;
  //   }
  // }

  async createqrScan(dto: QrScanDto): Promise<QrScanDto> {
    try {
      const result = await this.achievementRepository.createQrScan(dto);
      if (!result) {
        throw new Error('Qrscan insert not completed.');
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

  async doneAchievementSelected(achivementId: string, userId : string): Promise<boolean> {
    try {
      const achiId = new Types.ObjectId(achivementId);
      const userIdd = new Types.ObjectId(userId);
      const curr = await this.currencyRepository.findDefaultCurrency();
      const achisel = await this.achievementRepository.findAchievementSelectedByUserAndAchiId(userIdd, achiId);
  
      if (!curr || !achisel) {
        throw new Error('Currency or Achievement not found.');
      }
  
      const currentBalance = await this.balanceRepository.findUserBalance(new Types.ObjectId(achisel.userId),new Types.ObjectId(curr._id));
      const newBalance = currentBalance + achisel.reward.tokens;
  
      const create: BalanceDto = {
        userId: achisel.userId, 
        transactionType: "achievementsreward",
        amount: achisel.reward.tokens,
        currency: curr._id,
        transactionEntityId: achisel._id.toString(),
        balanceAfterTransaction: newBalance,
        _id: new Types.ObjectId(),
        timestamp: Date.now(),
      };
  
      const done = await this.achievementRepository.doneAchievementSelected(achisel._id);
      if (done) {
        try {
          const balance = await this.balanceRepository.addTransaction(create); 
          if (balance) {
            return true;
          } else {
            throw new Error('Balance transaction failed.');
          }
        } catch (balanceError) {
          if (balanceError.code === 11000) {
            console.error('Duplicate transaction error');
            return true;
          }
          else{
            //await this.achievementRepository.removeDoneAchievementSelected(objectId);
            console.error('Balance transaction error');
            return false;
          }
          
        }
      } else {
        console.error('Setting done achievement failed.');
        return false;
      }
    } catch (error) {
      console.error('Error completing achievement:');
      return false;
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

  async findQrScannedByUser(userId: string, achievementId: string): Promise<QrScanFullDto[]> {
    return await this.achievementRepository.findQrScannedByUser(new Types.ObjectId(userId), new Types.ObjectId(achievementId));
  }

  async findAchievementSelectedFullByUser(userId: string): Promise<AchievementSelectedFullDto[]> {
    return await this.achievementRepository.findAchievementSelectedFullByUser(new Types.ObjectId(userId));
  }

  async findAchievementSelectedFullByUserCamId(userId: string, campaignId: string): Promise<AchievementSelectedRefDto[]> {
    return await this.achievementRepository.findAchievementSelectedFullByUserAndCampId(new Types.ObjectId(userId), new Types.ObjectId(campaignId));
  }

  async findAchievementSelectedFullByUserAndAchiId(userId: string, achievementId: string): Promise<AchievementSelectedFullDto> {
    return await this.achievementRepository.findAchievementSelectedByUserAndAchiId(new Types.ObjectId(userId), new Types.ObjectId(achievementId));
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

  
  async findAchievementsSelectedByCampaignId(campaignId: string, userId: string): Promise<AchievementSelectedFullDto[]> {
    const camId = new Types.ObjectId(campaignId);
    const useId = new Types.ObjectId(userId);
    const achievements = await this.achievementRepository.findAchievementsSelectedByCampaignId(camId, useId);
    return achievements;
  }


}
