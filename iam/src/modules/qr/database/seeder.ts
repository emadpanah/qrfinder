import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../app.module';
import { ShopService } from '../services/qr-shop.service';
import { CampaignService } from '../services/qr-campaign.service';
import { AchievementService } from '../services/qr-achievment.service';
import { QRService } from '../services/qr.service';
import { ShopDto } from '../dto/shop.dto';
import { CampaignDto } from '../dto/campaign.dto';
import { AchievementDto } from '../dto/achievement.dto';
import { v4 as uuidv4 } from 'uuid';
import { Types } from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const shopService = app.get(ShopService);
  const campaignService = app.get(CampaignService);
  const achievementService = app.get(AchievementService);
  const qrService = app.get(QRService);

  // Create Shops
  const maghaziShop: ShopDto = {
    Id: new Types.ObjectId(),
    name: 'Maghazi Shop',
    description: 'An online shop offering various products.',
    campaigns: [],
  };

  const caymanShop: ShopDto = {
    Id: new Types.ObjectId(),
    name: 'Cayman Token ICO',
    description: 'Cayman Token ICO shop offering exclusive Porsche rides.',
    campaigns: [],
  };

  const createdMaghaziShop = await shopService.createShop(maghaziShop);
  const createdCaymanShop = await shopService.createShop(caymanShop);

  // Create Campaigns
  const maghaziCampaign: CampaignDto = {
    Id: new Types.ObjectId(),
    name: 'Maghazi City Hunt',
    description: 'Scan 5 QR codes in the city to earn tokens.',
    shopId: createdMaghaziShop.Id,
    achievements: [],
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
  };

  const caymanCampaign: CampaignDto = {
    Id: new Types.ObjectId(),
    name: 'Cayman Token ICO Hunt',
    description: 'Scan 10 QR codes to earn a ride with a Porsche.',
    shopId: createdCaymanShop.Id,
    achievements: [],
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
  };

  const createdMaghaziCampaign = await campaignService.createCampaign(maghaziCampaign);
  const createdCaymanCampaign = await campaignService.createCampaign(caymanCampaign);

  // Create Achievements
  const maghaziAchievement: AchievementDto = {
    Id: new Types.ObjectId(),
    name: 'Maghazi QR Code Hunt',
    description: 'Scan 5 QR codes in the city to earn 1500 tokens.',
    campaignId: createdMaghaziCampaign.Id,
    type: 'unordered',
    target: 5,
    reward: { tokens: 1500, products: [] },
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
    expectedLocation: {
      lat: 0, // replace with actual latitude
      lon: 0, // replace with actual longitude
      allowedRange: 1000,
    },
  };

  const caymanAchievement: AchievementDto = {
    Id: new Types.ObjectId(),
    name: 'Cayman Token QR Hunt',
    description: 'Scan 10 QR codes to earn 2000 tokens.',
    campaignId: createdCaymanCampaign.Id,
    type: 'unordered',
    target: 10,
    reward: { tokens: 2000, products: [] },
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
    expectedLocation: {
      lat: 0, // replace with actual latitude
      lon: 0, // replace with actual longitude
      allowedRange: 1000,
    },
  };

  const createdMaghaziAchievement = await achievementService.createAchievement(maghaziAchievement);
  const createdCaymanAchievement = await achievementService.createAchievement(caymanAchievement);

  // Generate QR codes for Maghazi Achievement
  for (let i = 1; i <= maghaziAchievement.target; i++) {
    const qrCode = await qrService.generateQRCode(
      createdMaghaziCampaign.Id.toString(),
      createdMaghaziAchievement.Id.toString(),
      i
    );
    console.log(`Maghazi QR Code ${i}: ${qrCode}`);
  }

  // Generate QR codes for Cayman Achievement
  for (let i = 1; i <= caymanAchievement.target; i++) {
    const qrCode = await qrService.generateQRCode(
      createdCaymanCampaign.Id.toString(),
      createdCaymanAchievement.Id.toString(),
      i
    );
    console.log(`Cayman QR Code ${i}: ${qrCode}`);
  }

  console.log('Fake data added successfully');
  await app.close();
}

bootstrap();
