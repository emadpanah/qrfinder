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

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FngData.name, schema: FngDataSchema },
      { name: RSIData.name, schema: RSIDataSchema },
      { name: MACDData.name, schema: MACDDataSchema },
      { name: PriceData.name, schema: PriceDataSchema },
    ], 'service'),
  ],
  providers: [FngService, DataService, DataRepository ],
  controllers: [DataController],
  exports: [DataService, DataRepository],
})
export class DataModule {}
