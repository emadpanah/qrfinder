// seeder.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../app.module';
import { ConfigService } from '@nestjs/config';
import { ShopService } from '../services/qr-shop.service';
import { CampaignService } from '../services/qr-campaign.service';
import { AchievementService } from '../services/qr-achievment.service';
import { QRService } from '../services/qr.service';
import { ShopDto } from '../dto/shop.dto';
import { CampaignDto } from '../dto/campaign.dto';
import { AchievementDto } from '../dto/achievement.dto';
import { Types } from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);
  const baseUrl = configService.get<string>('BASE_URL');

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
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
    videoUrl: `${baseUrl}/shared/qr/video/maghazi-campaign.mp4`, // Example video URL
    imageUrl: `${baseUrl}/shared/qr/img/maghazi-campaign.jpg`, // Example image URL
    ownerTelegramId: null, // Set to null
    ownerAddress: 'UQArbjQUytXhLEtxoYfNLHv1aS8tGhmRtxWI9XKj_S764NOV', // Default address
  };

  const caymanCampaign: CampaignDto = {
    Id: new Types.ObjectId(),
    name: 'Cayman Token ICO Hunt',
    description: 'Scan 10 QR codes to earn a ride with a Porsche.',
    shopId: createdCaymanShop.Id,
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
    videoUrl: `${baseUrl}/shared/qr/video/cayman-campaign.mp4`, // Example video URL
    imageUrl: `${baseUrl}/shared/qr/img/cayman-campaign.jpg`, // Example image URL
    ownerTelegramId: null, // Set to null
    ownerAddress: 'UQArbjQUytXhLEtxoYfNLHv1aS8tGhmRtxWI9XKj_S764NOV', // Default address
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
  };

  const caymanAchievementUnordered: AchievementDto = {
    Id: new Types.ObjectId(),
    name: 'Cayman Token QR Hunt (Unordered)',
    description: 'Scan 10 QR codes to earn 2000 tokens.',
    campaignId: createdCaymanCampaign.Id,
    type: 'unordered',
    target: 10,
    reward: { tokens: 2000, products: [] },
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
  };

  const caymanAchievementOrdered: AchievementDto = {
    Id: new Types.ObjectId(),
    name: 'Cayman Token QR Hunt (Ordered)',
    description: 'Scan 10 QR codes in the specified order to earn 2000 tokens.',
    campaignId: createdCaymanCampaign.Id,
    type: 'ordered',
    target: 10,
    reward: { tokens: 2000, products: [] },
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
  };

  const createdMaghaziAchievement = await achievementService.createAchievement(maghaziAchievement);
  const createdCaymanAchievementUnordered = await achievementService.createAchievement(caymanAchievementUnordered);
  const createdCaymanAchievementOrdered = await achievementService.createAchievement(caymanAchievementOrdered);

  // Generate QR codes for Maghazi Achievement
  for (let i = 1; i <= maghaziAchievement.target; i++) {
    const qrCode = await qrService.generateQRCode(
      createdMaghaziCampaign.Id.toString(),
      createdMaghaziAchievement.Id.toString(),
      i
    );
    console.log(`Maghazi QR Code ${i}: ${qrCode}`);
  }

  // Generate QR codes for Cayman Achievement (Unordered)
  for (let i = 1; i <= caymanAchievementUnordered.target; i++) {
    const qrCode = await qrService.generateQRCode(
      createdCaymanCampaign.Id.toString(),
      createdCaymanAchievementUnordered.Id.toString(),
      i
    );
    console.log(`Cayman (Unordered) QR Code ${i}: ${qrCode}`);
  }

  // Generate QR codes for Cayman Achievement (Ordered)
  for (let i = 1; i <= caymanAchievementOrdered.target; i++) {
    const qrCode = await qrService.generateQRCode(
      createdCaymanCampaign.Id.toString(),
      createdCaymanAchievementOrdered.Id.toString(),
      i
    );
    console.log(`Cayman (Ordered) QR Code ${i}: ${qrCode}`);
  }

  console.log('Fake data added successfully');
  await app.close();
}

bootstrap();
