import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { IamController } from './controllers/iam.controller';
import { IamService } from './services/iam.service';
import { IamRepository } from './database/repositories/iam.repository';
import { UserLoginRepository } from './database/repositories/user-login.repository';
import { IAMUser, IAMUserSchema } from './database/schemas/iam-user.schema';
import { UserLogin, UserLoginSchema } from './database/schemas/user-login.schema';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      { name: IAMUser.name, schema: IAMUserSchema },
      { name: UserLogin.name, schema: UserLoginSchema },
    ], 'service'),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('APP_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [IamController],
  providers: [
    IamService,
    IamRepository,
    UserLoginRepository,
    JwtAuthGuard,
  ],
})
export class IamModule {}
