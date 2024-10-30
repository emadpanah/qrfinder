import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FngService } from '../data/fng.service';
import { DataService } from '../data/data.service';
import { FngData, FngDataSchema } from '../data/database/schema/fng.schema';
import { FngRepository } from '../data/database/repositories/fng.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FngData.name, schema: FngDataSchema }]),
  ],
  providers: [FngService, DataService, FngRepository],
  exports: [DataService],
})
export class DataModule {}
