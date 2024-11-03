import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios'; // Import HttpModule
import { FngService } from './service/fng.service';
import { DataService } from './service/data.service';
import { FngData, FngDataSchema } from '../data/database/schema/fng.schema';
import { DataRepository } from './database/repositories/data.repository';

@Module({
  imports: [
    //HttpModule, // Add HttpModule here
    MongooseModule.forFeature([{ name: FngData.name, schema: FngDataSchema }], 'service'),
  ],
  providers: [FngService, DataService, DataRepository],
  exports: [DataService],
})
export class DataModule {}
