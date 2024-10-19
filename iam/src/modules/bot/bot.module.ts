import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { ChatGptBotService } from './bot.chat.service';
import { ProductModule } from '../product/product.module'; 
import { AchievementService } from '../qr/services/qr-achievment.service';
import { BalanceRepository } from '../iam/database/repositories/balance.repository';
import { BalanceService } from '../iam/services/iam-balance.service';
import { CurrencyRepository } from '../iam/database/repositories/currency.repository';
import { AchievementRepository } from '../qr/database/repositories/qr-achievement.repository';

@Module({
  imports: [ProductModule],
  providers: [//BotService, 
    AchievementService,
    BalanceRepository,
    BalanceService,
    CurrencyRepository,
    AchievementService, 
    AchievementRepository
    //ChatGptBotService
    ],
})
export class BotModule {}
