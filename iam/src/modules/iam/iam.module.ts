import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { IamController } from './controllers/iam.controller';
import { IamService } from './services/iam.service';
import { IamRepository } from './database/repositories/iam.repository';
import { UserLoginRepository } from './database/repositories/user-login.repository';
import { IAMUser, IAMUserSchema } from './database/schemas/iam-user.schema';
import { Balance, BalanceSchema } from './database/schemas/iam-balance.schema';
import { Currency, CurrencySchema } from './database/schemas/iam-currency.schema';
import { UserLogin, UserLoginSchema } from './database/schemas/user-login.schema';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './services/auth.service';
import { BalanceRepository } from './database/repositories/balance.repository';
import { BalanceService } from './services/iam-balance.service';
import { BalanceController } from './controllers/balance.controller';
import { CurrencyRepository } from './database/repositories/currency.repository';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      { name: IAMUser.name, schema: IAMUserSchema },
      { name: UserLogin.name, schema: UserLoginSchema },
      { name: Balance.name, schema: BalanceSchema },
      { name: Currency.name, schema: CurrencySchema },
    ], 'service'),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET')|| 'default_app_secret',
        signOptions: { expiresIn: '24h' },
        global: true,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [IamController, BalanceController],
  providers: [
    IamService,
    IamRepository,
    UserLoginRepository,
    BalanceRepository,
    BalanceService,
    CurrencyRepository,
    //JwtAuthGuard,
    AuthService,
  ],
  exports: [IamService], 
})
export class IamModule {}
