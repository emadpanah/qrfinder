import { Injectable } from '@nestjs/common';
import { AchievementRepository } from '../database/repositories/qr-achievement.repository';
import { QRCode } from '../database/schemas/qr-qrcode.schema';
import { Types } from 'mongoose';
import * as QRCodeGen from 'qrcode';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QRService {
  private readonly baseUrl: string;

  constructor(
    private readonly achievementRepository: AchievementRepository,
    private readonly configService: ConfigService
  ) {
    this.baseUrl = this.configService.get<string>('BASE_URL');
  }

  async generateQRCode(campaignId: string, achievementId: string, qrIndex: number): Promise<string> {
    const link = `${this.baseUrl}scan?campaignId=${campaignId}&achievementId=${achievementId}&qrIndex=${qrIndex}`;
    const qrCode = await QRCodeGen.toDataURL(link);

    // Save QR Code in the database
    await this.achievementRepository.saveQRCode({
      achievementId: new Types.ObjectId(achievementId),
      code: qrCode,
      latitude: 0, // Replace with actual latitude
      longitude: 0, // Replace with actual longitude
      order: qrIndex,
      expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
      allowedRange: 1000, // Replace with actual allowed range
    });

    return qrCode;
  }

  async processScan(achievementId: string, qrIndex: number, userId: string, lat: number, lon: number): Promise<string> {
    const qrCode = await this.achievementRepository.findQRCodeById(new Types.ObjectId(achievementId));

    if (!qrCode) {
      throw new Error('QR Code not found');
    }

    if (qrCode.expirationDate < new Date()) {
      throw new Error('This QR code has expired');
    }

    // Validate geolocation (simple range check for example purposes)
    const distance = this.calculateDistance(lat, lon, qrCode.latitude, qrCode.longitude);
    if (distance > qrCode.allowedRange) {
      throw new Error('Invalid location for QR code scan');
    }

    const achievement = await this.achievementRepository.findAchievementById(new Types.ObjectId(qrCode.achievementId));

    // Check if the scan order is correct
    if (achievement.qrOrderType === 'ordered') {
      const userProgress = await this.getUserProgress(userId, new Types.ObjectId(achievementId));
      if (userProgress.currentStep !== qrIndex - 1) {
        throw new Error('Incorrect QR scan order');
      }
    }

    // Update user progress
    await this.updateUserProgress(userId, new Types.ObjectId(achievementId), qrIndex);

    // if (qrIndex === achievement.target) {
    //   await this.completeAchievement(userId, new Types.ObjectId(achievementId));
    //   return 'Achievement completed!';
    // }

    return 'QR code scanned successfully';
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon1 - lon2) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c;
    return d;
  }

  async getUserProgress(userId: string, achievementId: Types.ObjectId): Promise<{ currentStep: number }> {
    // Implement logic to get user progress from the IAM module or other relevant source
    return { currentStep: 0 }; // Example placeholder return value
  }

  async updateUserProgress(userId: string, achievementId: Types.ObjectId, qrIndex: number): Promise<void> {
    // Implement logic to update user progress in the IAM module or other relevant source
  }

  async completeAchievement(userId: string, achievementId: Types.ObjectId): Promise<void> {
    // Implement logic to mark the achievement as complete in the IAM module or other relevant source
  }
}
