import { Module } from '@nestjs/common';
import { IamController} from './controllers/iam.controller';
import { IamService } from './services/iam.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  IAMUser,
  IAMUserSchema,
} from './database/schemas/iam-user.schema';
import { IamRepository } from './database/repositories/iam.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
        { name: IAMUser.name, schema: IAMUserSchema },
      ],
      'service',
    ),
  ],
  controllers: [IamController],
  providers: [
    IamService,
    IamRepository,
  ],
})
export class IamModule { }