import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios'; // Import HttpModule
import { FngService } from './service/fng.service';
import { DataService } from './service/data.service';
import { FngData, FngDataSchema } from '../data/database/schema/fng.schema';
import { DataRepository } from './database/repositories/data.repository';
import { ProductService } from '../product/services/product.service';
import { DataController } from './controllers/data.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FngData.name, schema: FngDataSchema }], 'service'),
  ],
  providers: [FngService, DataService, DataRepository ],
  controllers: [DataController],
  exports: [DataService, DataRepository],
})
export class DataModule {}
