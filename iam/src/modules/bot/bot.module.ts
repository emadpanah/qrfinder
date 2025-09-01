import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { ChatGptBotService } from './bot.chat.service';
import { ProductModule } from '../product/product.module'; 
import { AchievementService } from '../qr/services/qr-achievment.service';
import { BalanceRepository } from '../iam/database/repositories/balance.repository';
import { BalanceService } from '../iam/services/iam-balance.service';
import { CurrencyRepository } from '../iam/database/repositories/currency.repository';
import { AchievementRepository } from '../qr/database/repositories/qr-achievement.repository';
import { BotAIService } from './bot.ai.service';
import { DataModule } from '../data/data.module';
import { IamService } from '../iam/services/iam.service';
import { IamRepository } from '../iam/database/repositories/iam.repository';
import { UserLoginRepository } from '../iam/database/repositories/user-login.repository';
import { AuthService } from '../iam/services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { DataRepository } from '../data/database/repositories/data.repository';
import { CustomerSupportBot } from './bot.ai.customer-service';
import { KnowledgeItemService } from '../data/service/knowledge-item.service';
import { KnowledgeItemRepository } from '../data/database/repositories/knowledge-item.repository';
import { CalendarRepository } from '../data/database/repositories/calendar.repository';

@Module({
  imports: [ProductModule, DataModule],
  providers: [//BotService, 
    AchievementService,
    BalanceRepository,
    BalanceService,
    CurrencyRepository,
    AchievementService, 
    AchievementRepository,
    BotAIService,
    IamService,
    IamRepository,
    UserLoginRepository,
    DataRepository,
    AuthService,
    JwtService,
    //ChatGptBotService
    //CustomerSupportBot,
    KnowledgeItemService,
    KnowledgeItemRepository,
    CalendarRepository
    ],
    exports: [BotAIService],
})
export class BotModule {}
