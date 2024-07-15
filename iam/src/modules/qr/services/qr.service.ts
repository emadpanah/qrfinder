import { Injectable } from '@nestjs/common';
import { AchievementRepository } from '../database/repositories/qr-achievement.repository';
import { Achievement } from '../database/schemas/qr-achievement.schema';
import * as QRCode from 'qrcode';
import { Types } from 'mongoose';

@Injectable()
export class QRService {
  constructor(
    private readonly achievementRepository: AchievementRepository
  ) {}

  async generateQRCode(campaignId: string, achievementId: string, qrIndex: number): Promise<string> {
    const link = `https://yourdomain.com/scan?campaignId=${campaignId}&achievementId=${achievementId}&qrIndex=${qrIndex}`;
    const qrCode = await QRCode.toDataURL(link);

    // Save QR Code in the database
    await this.achievementRepository.saveQRCode({
      Id: new Types.ObjectId(),
      achievementId: new Types.ObjectId(achievementId),
      code: qrCode,
      latitude: 0, // Replace with actual latitude
      longitude: 0, // Replace with actual longitude
      order: qrIndex,
      expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
    });

    return qrCode;
  }

  async processScan(achievementId: Types.ObjectId, qrIndex: number, userId: string, lat: number, lon: number): Promise<string> {
    const achievement: Achievement = await this.achievementRepository.findAchievementById(new Types.ObjectId(achievementId));

    if (!achievement) {
      throw new Error('Achievement not found');
    }

    if (achievement.expirationDate < new Date()) {
      throw new Error('This QR code has expired');
    }

    if (achievement.type === 'ordered') {
      // Check if the scan order is correct
      const userProgress = await this.getUserProgress(userId, new Types.ObjectId(achievementId));
      if (userProgress && userProgress.currentStep !== qrIndex - 1) {
        throw new Error('Incorrect QR scan order');
      }
    }

    // Validate geolocation (simple range check for example purposes)
    const distance = this.calculateDistance(lat, lon, achievement.expectedLocation.lat, achievement.expectedLocation.lon);
    if (distance > achievement.expectedLocation.allowedRange) {
      throw new Error('Invalid location for QR code scan');
    }

    // Update user progress
    await this.updateUserProgress(userId, new Types.ObjectId(achievementId), qrIndex);

    // If the achievement is completed
    if (qrIndex === achievement.target) {
      await this.completeAchievement(userId, new Types.ObjectId(achievementId));
      return 'Achievement completed!';
    }

    return 'QR code scanned successfully';
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon1-lon2) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres
    return d;
  }

  // Assume methods to handle user progress exist
  async getUserProgress(userId: string, achievementId: Types.ObjectId): Promise<{ currentStep: number }> {
    // Implement logic to get user progress from the IAM module or other relevant source
    // Example placeholder return value
    return { currentStep: 0 };
  }

  async updateUserProgress(userId: string, achievementId: Types.ObjectId, qrIndex: number): Promise<void> {
    // Implement logic to update user progress in the IAM module or other relevant source
  }

  async completeAchievement(userId: string, achievementId: Types.ObjectId): Promise<void> {
    // Implement logic to mark the achievement as complete in the IAM module or other relevant source
  }
}
