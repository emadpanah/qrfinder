import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FngService } from './service/fng.service';
import { DataService } from './service/data.service';
import { FngData, FngDataSchema } from '../data/database/schema/fng.schema';
import { FngRepository } from './database/repositories/data.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FngData.name, schema: FngDataSchema }]),
  ],
  providers: [FngService, DataService, FngRepository],
  exports: [DataService],
})
export class DataModule {}
