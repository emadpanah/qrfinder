import { Module } from '@nestjs/common';
import { IamController} from './controllers/iam.controller';
import { IamService } from './services/iam.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  IAMUser,
  IAMUserSchema,
} from './database/schemas/iam-user.schema';
import { IamRepository } from './database/repositories/iam.repository';
import { UserLoginRepository } from './database/repositories/user-login.repository';
import { UserLogin, UserLoginSchema } from './database/schemas/user-login.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
        { name: IAMUser.name, schema: IAMUserSchema },
        { name: UserLogin.name, schema: UserLoginSchema },
      ],
      'service', 
    ),
  ],
  controllers: [IamController],
  providers: [
    IamService,
    IamRepository,
    UserLoginRepository,
  ],
})
export class IamModule { }