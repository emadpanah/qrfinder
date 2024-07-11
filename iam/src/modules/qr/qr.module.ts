import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopService } from './services/qr-shop.service';
import { ShopController } from './controller/qr-shop.controller';
import { ShopRepository } from './database/repositories/qr-shop.repository';
import { Shop, ShopSchema } from './database/schemas/qr-shop.schema';

import { CampaignService } from './services/qr-campaign.service';
import { CampaignController } from './controller/qr-campaign.controller';
import { CampaignRepository } from './database/repositories/qr-campaign.repository';
import { Campaign, CampaignSchema } from './database/schemas/qr-campaign.schema';

import { AchievementService } from './services/qr-achievment.service';
import { AchievementController } from './controller/qr-achievment.controller';
import { AchievementRepository } from './database/repositories/qr-achievement.repository';
import { Achievement, AchievementSchema } from './database/schemas/qr-achievement.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Shop.name, schema: ShopSchema },
      { name: Campaign.name, schema: CampaignSchema },
      { name: Achievement.name, schema: AchievementSchema },
    ], 'service'),
  ],
  controllers: [ShopController, CampaignController, AchievementController],
  providers: [ShopService, ShopRepository, CampaignService, CampaignRepository, AchievementService, AchievementRepository],
})
export class QRModule {}
