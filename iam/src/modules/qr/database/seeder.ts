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
import { BalanceService } from '../../iam/services/iam-balance.service'; 
import { CurrencyDto } from '../../iam/dto/currency.dto'; 





async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);
  const baseUrl = configService.get<string>('BASE_URL');

  const shopService = app.get(ShopService);
  const campaignService = app.get(CampaignService);
  const achievementService = app.get(AchievementService);
  const currencyService = app.get(BalanceService);

// Create default currency
// const defaultCurrency: CurrencyDto = {
//   name: 'GainToken',
//   symbol: 'g',
//   type: 'crypto',
//   isDefault: true,
//   _id: new Types.ObjectId(),
// };

// const tonCurrency: CurrencyDto = {
//   name: 'TON',
//   symbol: 'TON',
//   type: 'crypto',
//   isDefault: false,
//   _id: new Types.ObjectId(),
// };

// const ethereumCurrency: CurrencyDto = {
//   name: 'Ethereum',
//   symbol: 'ETH',
//   type: 'crypto',
//   isDefault: false,
//   _id: new Types.ObjectId(),
// };

// await currencyService.createCurrency(defaultCurrency);
// await currencyService.createCurrency(tonCurrency);
// await currencyService.createCurrency(ethereumCurrency);

  // Create Shops
  const maghaziShop: ShopInsertDto = {
    name: 'Maghazi Shop',
    description: 'An online shop offering various products.',
    shopId: new Types.ObjectId(),
  };

  const caymanShop: ShopInsertDto = {
    shopId: new Types.ObjectId(),
    name: 'Cayman Token Shop',
    description: 'Cayman Token ICO shop offering exclusive Porsche rides.',
  };

  const fourcashShop: ShopInsertDto = {
    shopId: new Types.ObjectId(),
    name: '4cash Exchange Shop',
    description: '4cash exchange offer crypto exchanges',
  };

  const juskiShop: ShopInsertDto = {
    shopId: new Types.ObjectId(),
    name: 'Trade-AI Shop',
    description: 'Trade-AI Online Shop',
  };
  

  const createdMaghaziShop = await shopService.createShop(maghaziShop);
  const createdCaymanShop = await shopService.createShop(caymanShop);
  const createdFourcashShop = await shopService.createShop(fourcashShop);
  const createdTradeAIShop = await shopService.createShop(juskiShop);

  // Create Campaigns
  const TradeAICampaign: CampaignInsertDto = {
    target:3000,
    reward: { tokens: 4000, products: [] },
    name: 'JUSKI City Hunt',
    description: 'join our campaign to be rich',
    shopId: createdTradeAIShop._id,
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).getTime(),
    videoUrl: `${baseUrl}/shared/qr/video/juski-campaign.mp4`, // Example video URL
    imageUrl: `${baseUrl}/shared/qr/img/juski-campaign.jpg`, // Example image URL
    ownerTelegramId: '6702de479b580201943f04d6', // Set to null
    ownerAddress: '6702de479b580201943f04d6', // Default address
  };
  
  const maghaziCampaign: CampaignInsertDto = {
    target:3000,
    reward: { tokens: 4000, products: [] },
    name: 'Maghazi City Hunt',
    description: 'Join our Achievements and help us to our goals and get token back',
    shopId: createdMaghaziShop._id,
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).getTime(),
    videoUrl: `${baseUrl}/shared/qr/video/maghazi-campaign.mp4`, // Example video URL
    imageUrl: `${baseUrl}/shared/qr/img/maghazi-campaign.jpg`, // Example image URL
    ownerTelegramId: '6702de479b580201943f04d6', // Set to null
    ownerAddress: '6702de479b580201943f04d6', // Default address
  };

  const caymanCampaign: CampaignInsertDto = {
    target:2000,
    reward: { tokens: 3000, products: [] },
    name: 'Cayman Token ICO Hunt',
    description: 'Join Cayman challenges and get tokens',
    shopId: createdCaymanShop._id,
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).getTime(),
    videoUrl: `${baseUrl}/shared/qr/video/cayman-campaign.mp4`, // Example video URL
    imageUrl: `${baseUrl}/shared/qr/img/cayman-campaign.jpg`, // Example image URL
    ownerTelegramId: '6702de479b580201943f04d6', // Set to null
    ownerAddress: '6702de479b580201943f04d6', // Default address
  };

  const fourcashCampaign: CampaignInsertDto = {
    target:2000,
    reward: { tokens: 3000, products: [] },
    name: '4cash Exchange Engage Hunt',
    description: 'join us to make 4cash goals and earn tokens',
    shopId: createdFourcashShop._id,
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).getTime(),
    videoUrl: `${baseUrl}/shared/qr/video/fourcash-campaign.mp4`, // Example video URL
    imageUrl: `${baseUrl}/shared/qr/img/fourcash-campaign.jpg`, // Example image URL
    ownerTelegramId: '6702de479b580201943f04d6', // Set to null
    ownerAddress: '6702de479b580201943f04d6', // Default address
  };

  const createdFourcashCampaign = await campaignService.createCampaign(fourcashCampaign);
  const createdMaghaziCampaign = await campaignService.createCampaign(maghaziCampaign);
  const createdCaymanCampaign = await campaignService.createCampaign(caymanCampaign);
  const createdTradeAICampaign = await campaignService.createCampaign(TradeAICampaign);


  const addedDatee = new Date();
  const startDatee = new Date(addedDatee);
  startDatee.setDate(startDatee.getDate() + 2);
  
  const fourcashInviteAchievement: AchievementInsertDto = {
    name: '4cash User Hunt',
    description: 'invite friends to this achievement and get 300 token',
    campaignId: createdFourcashCampaign._id,
    qrTarget: 20,
    qrOrderType: 'unordered',
    qrProofByLocation: false,
    achievementType: 'inviteuser',
    enable: true,
    addedDate: addedDatee.getTime(),
    startDate: startDatee.getTime(),
    reward: { tokens: 300, products: [] },
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).getTime(),
  };

  // Create Achievements
  const addedDate = new Date();
  const startDate = new Date(addedDate);
  const maghaziAchievement: AchievementInsertDto = {
    name: 'Maghazi QR Code Hunt',
    description: 'Scan qrcodes in the city to earn 1500 tokens.',
    campaignId: createdMaghaziCampaign._id,
    qrTarget:4,
    qrOrderType: 'unordered',
    achievementType: 'qrcode',
    qrProofByLocation: false,
    reward: { tokens: 1500, products: [] },
    enable: true,
    addedDate: addedDate.getTime(),
    startDate: startDate.getTime(),
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).getTime(),
  };

  
  const maghaziInviteAchievement: AchievementInsertDto = {
    name: 'Maghazi User Hunt',
    description: 'invite friends to this achievement and get 300 tokens',
    campaignId: createdMaghaziCampaign._id,
    qrOrderType: 'unordered',
    qrTarget: 30,
    qrProofByLocation: false,
    achievementType: 'inviteuser',
    reward: { tokens: 300, products: [] },
    enable: true,
    addedDate: addedDatee.getTime(),
    startDate: startDatee.getTime(),
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 4)).getTime(),
  };

  const tradeAIInviteAchievement: AchievementInsertDto = {
    name: 'Trade AI User Hunt',
    description: 'invite 10 friends to this achievement and get 1300 token',
    campaignId: createdTradeAICampaign._id,
    qrOrderType: 'unordered',
    qrTarget: 10,
    qrProofByLocation: false,
    achievementType: 'inviteuser',
    reward: { tokens: 1300, products: [] },
    enable: true,
    addedDate: addedDatee.getTime(),
    startDate: startDatee.getTime(),
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 4)).getTime(),
  };


  const caymanAchievementUnordered: AchievementInsertDto = {
    name: 'Cayman Token QR Hunt InCar',
    description: 'Scan qrcodes to earn 2000 tokens.',
    campaignId: createdCaymanCampaign._id,
    qrOrderType: 'unordered',
    qrTarget: 7,
    qrProofByLocation: false,
    achievementType: 'qrcode',
    reward: { tokens: 2000, products: [] },
    enable: true,
    addedDate: addedDate.getTime(),
    startDate: startDate.getTime(),
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).getTime(),
  };

  const caymanAchievementOrdered: AchievementInsertDto = {
    name: 'Cayman Token QR Hunt InEvent',
    description: 'Scan qrcodes to earn 2000 tokens.',
    campaignId: createdCaymanCampaign._id,
    qrOrderType: 'unordered',
    qrTarget: 5,
    qrProofByLocation: false,
    achievementType: 'qrcode',
    reward: { tokens: 2000, products: [] },
    enable: true,
    addedDate: addedDate.getTime(),
    startDate: startDate.getTime(),
    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).getTime(),
  };

  
  const createdjuskiInviteAchievement = await achievementService.createAchievement(tradeAIInviteAchievement);
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
