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
import { Translation, TranslationSchema } from './database/schema/translations.schema';

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
      { name: Translation.name, schema: TranslationSchema },
    ], 'service'),
  ],
  providers: [FngService, DataService, DataRepository, LunarCrushService ],
  controllers: [DataController],
  exports: [DataService, DataRepository],
})
export class DataModule {}
