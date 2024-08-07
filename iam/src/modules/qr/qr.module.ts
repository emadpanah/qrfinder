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
import { AchievementSelected, AchievementSelectedSchema } from './database/schemas/qr-achievement-selected.schema';
import { QRCode, QRCodeSchema } from './database/schemas/qr-qrcode.schema';
import { QRScanQr, QRScanSchema  } from './database/schemas/qr-scanqr.schema';
import { CurrencyRepository } from '../iam/database/repositories/currency.repository';
import { BalanceRepository } from '../iam/database/repositories/balance.repository';
import { BalanceService } from '../iam/services/iam-balance.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Shop.name, schema: ShopSchema },
      { name: Campaign.name, schema: CampaignSchema },
      { name: Achievement.name, schema: AchievementSchema },
      { name: AchievementSelected.name, schema: AchievementSelectedSchema },
      { name: QRCode.name, schema: QRCodeSchema },
      { name: QRScanQr.name, schema: QRScanSchema },
    ], 'service'),
  ],
  controllers: [ShopController, CampaignController, AchievementController],
  providers: [BalanceRepository, CurrencyRepository, BalanceService, ShopService, ShopRepository, CampaignService, CampaignRepository, AchievementService, AchievementRepository],
})
export class QRModule {}
