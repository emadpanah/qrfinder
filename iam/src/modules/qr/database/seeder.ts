// seeder.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../app.module';
import { ConfigService } from '@nestjs/config';
import { ShopService } from '../services/qr-shop.service';
import { CampaignService } from '../services/qr-campaign.service';
import { AchievementService } from '../services/qr-achievment.service';
import { ShopInsertDto } from '../dto/shop.dto';
import { CampaignInsertDto } from '../dto/campaign.dto';
import { AchievementInsertDto } from '../dto/achievement.dto';
import { Types } from 'mongoose';
import { QRCodeInertDto } from '../dto/qrcode.dto';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);
  const baseUrl = configService.get<string>('BASE_URL');

  const shopService = app.get(ShopService);
  const campaignService = app.get(CampaignService);
  const achievementService = app.get(AchievementService);

  // Create Shops
  const maghaziShop: ShopInsertDto = {
    name: 'Maghazi Shop',
    description: 'An online shop offering various products.',
    shopId: new Types.ObjectId(),
  };

  const caymanShop: ShopInsertDto = {
    shopId: new Types.ObjectId(),
    name: 'Cayman Token ICO',
    description: 'Cayman Token ICO shop offering exclusive Porsche rides.',
  };
  

  const createdMaghaziShop = await shopService.createShop(maghaziShop);
  const createdCaymanShop = await shopService.createShop(caymanShop);

  // Create Campaigns
  const maghaziCampaign: CampaignInsertDto = {
    target:3000,
    reward: { tokens: 4000, products: [] },
    name: 'Maghazi City Hunt',
    description: 'Join our Achievements and help us to our goals and get token back',
    shopId: createdMaghaziShop._id,
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
    videoUrl: `${baseUrl}/shared/qr/video/maghazi-campaign.mp4`, // Example video URL
    imageUrl: `${baseUrl}/shared/qr/img/maghazi-campaign.jpg`, // Example image URL
    ownerTelegramId: null, // Set to null
    ownerAddress: 'UQArbjQUytXhLEtxoYfNLHv1aS8tGhmRtxWI9XKj_S764NOV', // Default address
  };

  const caymanCampaign: CampaignInsertDto = {
    target:2000,
    reward: { tokens: 3000, products: [] },
    name: 'Cayman Token ICO Hunt',
    description: 'Join Cayman challenges and get tokens',
    shopId: createdCaymanShop._id,
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    videoUrl: `${baseUrl}/shared/qr/video/cayman-campaign.mp4`, // Example video URL
    imageUrl: `${baseUrl}/shared/qr/img/cayman-campaign.jpg`, // Example image URL
    ownerTelegramId: null, // Set to null
    ownerAddress: 'UQArbjQUytXhLEtxoYfNLHv1aS8tGhmRtxWI9XKj_S764NOV', // Default address
  };

  const fourcashCampaign: CampaignInsertDto = {
    target:2000,
    reward: { tokens: 3000, products: [] },
    name: '4cash Exchange Engage Hunt',
    description: 'join us to make 4cash goals and earn tokens',
    shopId: createdCaymanShop._id,
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    videoUrl: `${baseUrl}/shared/qr/video/fourcash-campaign.mp4`, // Example video URL
    imageUrl: `${baseUrl}/shared/qr/img/fourcash-campaign.jpg`, // Example image URL
    ownerTelegramId: null, // Set to null
    ownerAddress: 'UQArbjQUytXhLEtxoYfNLHv1aS8tGhmRtxWI9XKj_S764NOV', // Default address
  };

  const createdFourcashCampaign = await campaignService.createCampaign(fourcashCampaign);
  const createdMaghaziCampaign = await campaignService.createCampaign(maghaziCampaign);
  const createdCaymanCampaign = await campaignService.createCampaign(caymanCampaign);


  const fourcashInviteAchievement: AchievementInsertDto = {
    name: '4cash User Hunt',
    description: 'invite 20 friend to this achievement and get 300 token',
    campaignId: createdFourcashCampaign._id,
    qrTarget:0,
    qrOrderType: 'unordered',
    qrProofByLocation: false,
    achievementType: 'inviteuser',
    reward: { tokens: 300, products: [] },
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
  };

  // Create Achievements
  const maghaziAchievement: AchievementInsertDto = {
    name: 'Maghazi QR Code Hunt',
    description: 'Scan 5 QR codes in the city to earn 1500 tokens.',
    campaignId: createdMaghaziCampaign._id,
    qrTarget:4,
    qrOrderType: 'unordered',
    achievementType: 'qrcode',
    qrProofByLocation: false,
    reward: { tokens: 1500, products: [] },
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  };

  const maghaziInviteAchievement: AchievementInsertDto = {
    name: 'Maghazi User Hunt',
    description: 'invite 30 friend to this achievement and get 300 token',
    campaignId: createdMaghaziCampaign._id,
    qrOrderType: 'unordered',
    qrTarget:0,
    qrProofByLocation: false,
    achievementType: 'inviteuser',
    reward: { tokens: 300, products: [] },
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 4)),
  };

  const caymanAchievementUnordered: AchievementInsertDto = {
    name: 'Cayman Token QR Hunt',
    description: 'Scan 7 from 8 QR codes to earn 2000 tokens.',
    campaignId: createdCaymanCampaign._id,
    qrOrderType: 'unordered',
    qrTarget:7,
    qrProofByLocation: false,
    achievementType: 'qrcode',
    reward: { tokens: 2000, products: [] },
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
  };

  const caymanAchievementOrdered: AchievementInsertDto = {
    name: 'Cayman Token QR Hunt',
    description: 'Scan 5 from 8 QR codes to earn 2000 tokens.',
    campaignId: createdCaymanCampaign._id,
    qrOrderType: 'unordered',
    qrTarget:5,
    qrProofByLocation: false,
    achievementType: 'qrcode',
    reward: { tokens: 2000, products: [] },
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  };

  
  const createdFourcashInviteAchievement = await achievementService.createAchievement(fourcashInviteAchievement);
  const createdMaghaziAchievement = await achievementService.createAchievement(maghaziAchievement);
  const createdMaghaziInviteAchievement = await achievementService.createAchievement(maghaziInviteAchievement);
  const createdCaymanAchievementUnordered = await achievementService.createAchievement(caymanAchievementUnordered);
  const createdCaymanAchievementOrdered = await achievementService.createAchievement(caymanAchievementOrdered);

  // Generate QR codes for Maghazi Achievement
  for (let i = 1; i <= 5; i++) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const qrId = new Types.ObjectId()
    const qrCodeLink = `${baseUrl}/qrApp?a=${createdMaghaziAchievement._id}&p=${qrId}&t=q`;
    const magaziQr: QRCodeInertDto = {
      link: qrCodeLink,
      achievementId :createdMaghaziAchievement._id,
      latitude:0,
      longitude:0,
      order:i,
      _id: qrId
    };
    const qrCode = await achievementService.createAchievementQrCode(
      magaziQr
    );
    console.log(`Maghazi QR Code ${i}: ${qrCode.link}`);
  }

  for (let i = 1; i <= 8; i++) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const qrId = new Types.ObjectId()
    const qrCodeLink = `${baseUrl}/qrApp?a=${createdCaymanAchievementUnordered._id}&p=${qrId}&t=q`;
    const tempQr: QRCodeInertDto = {
      link: qrCodeLink,
      achievementId :createdCaymanAchievementUnordered._id,
      latitude:0,
      longitude:0,
      order:i,
      _id: qrId
    };
    const qrCode = await achievementService.createAchievementQrCode(
      tempQr
    );
    console.log(`Cayman QR Code ${i}: ${qrCode.link}`);
  }

  for (let i = 1; i <= 8; i++) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const qrId = new Types.ObjectId()
    const qrCodeLink = `${baseUrl}/qrApp?a=${createdCaymanAchievementOrdered._id}&p=${qrId}&t=q`;
    const tempQr: QRCodeInertDto = {
      link: qrCodeLink,
      achievementId :createdCaymanAchievementOrdered._id,
      latitude:0,
      longitude:0,
      order:i,
      _id: qrId
    };
    const qrCode = await achievementService.createAchievementQrCode(
      tempQr
    );
    console.log(`Cayman QR Code ${i}: ${qrCode.link}`);
  }


  console.log('Fake data added successfully');
  await app.close();
}

bootstrap();
