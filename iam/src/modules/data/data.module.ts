import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios'; // Import HttpModule
import { FngService } from './service/fng.service';
import { DataService } from './service/data.service';
import { FngData, FngDataSchema } from '../data/database/schema/fng.schema';
import { DataRepository } from './database/repositories/data.repository';
import { ProductService } from '../product/services/product.service';
import { DataController } from './controllers/data.controller';
import { RSIData, RSIDataSchema } from './database/schema/rsi.schema';
import { MACDData, MACDDataSchema } from './database/schema/macd.schema';
import { PriceData, PriceDataSchema } from './database/schema/price.schema';
import { DominanceDto } from './database/dto/dominance.dto';
import { DominanceData, DominanceDataSchema } from './database/schema/dominance.schema';
import { ST1Data, ST1DataSchema } from './database/schema/st1.schema';
import { LunarCrushData, LunarCrushDataSchema } from './database/schema/lunarcrush.schema';
import { LunarCrushService } from './service/lunar.service';
import { LunarCrushNews, LunarCrushNewsSchema } from './database/schema/lunarcrush-news.schema';
import { LunarCrushStockData, LunarCrushStockSchema } from './database/schema/lunarcrush-stock.schema';
import { Translation, TranslationSchema } from './database/schema/translations.schema';
import { UserChatLog, UserChatLogSchema } from './database/schema/userchatlog.schema';
import { ADXData, ADXDataSchema } from './database/schema/adx.schema';
import { CCIData, CCIDataSchema } from './database/schema/cci.schema';
import { StochasticData, StochasticDataSchema } from './database/schema/stochastic.schema';
import { EMAData, EMADataSchema } from './database/schema/ema.schema';
import { SMAData, SMADataSchema } from './database/schema/sma.schema';
import { IamService } from '../iam/services/iam.service';
import { BalanceService } from '../iam/services/iam-balance.service';
import { IamRepository } from '../iam/database/repositories/iam.repository';
import { UserLoginRepository } from '../iam/database/repositories/user-login.repository';
import { AuthService } from '../iam/services/auth.service';
import { CurrencyRepository } from '../iam/database/repositories/currency.repository';
import { BalanceRepository } from '../iam/database/repositories/balance.repository';
import { JwtService } from '@nestjs/jwt';
import { SupportChatLog, SupportChatLogSchema } from './database/schema/support-chat-log.schema';
import { KnowledgeItemService } from '../data/service/knowledge-item.service';
import { KnowledgeItemRepository } from './database/repositories/knowledge-item.repository';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: FngData.name, schema: FngDataSchema },
      { name: RSIData.name, schema: RSIDataSchema },
      { name: MACDData.name, schema: MACDDataSchema },
      { name: PriceData.name, schema: PriceDataSchema },
      { name: DominanceData.name, schema: DominanceDataSchema },
      { name: ST1Data.name, schema: ST1DataSchema },
      { name: LunarCrushData.name, schema: LunarCrushDataSchema },
      { name: LunarCrushNews.name, schema: LunarCrushNewsSchema },
      { name: LunarCrushStockData.name, schema: LunarCrushStockSchema },
      { name: Translation.name, schema: TranslationSchema },
      { name: UserChatLog.name, schema: UserChatLogSchema },
      { name: ADXData.name, schema: ADXDataSchema },
      { name: CCIData.name, schema: CCIDataSchema },
      { name: StochasticData.name, schema: StochasticDataSchema },
      { name: EMAData.name, schema: EMADataSchema },
      { name: SMAData.name, schema: SMADataSchema },
      { name: SupportChatLog.name, schema: SupportChatLogSchema },
    ], 'service')
  ],
  providers: [FngService, DataService, DataRepository, 
    LunarCrushService, IamService, BalanceService, IamRepository,
    UserLoginRepository, AuthService, CurrencyRepository, BalanceRepository,
    JwtService, KnowledgeItemService,
    KnowledgeItemRepository  ],
  controllers: [DataController],
  exports: [DataService, DataRepository, KnowledgeItemService, KnowledgeItemRepository],
})
export class DataModule {}
