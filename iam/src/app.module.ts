import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { IamModule } from './modules/iam/iam.module';
//import { UserLoginModel } from './modules/auth/auth.module';
import { HttpLoggerInterceptor } from './shared/inetrceptors/http-logger.interceptor';
import { config } from './shared/config/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BotModule } from './modules/bot/bot.module';
import { ProductModule } from './modules/product/product.module';
import { QRModule } from './modules/qr/qr.module';  

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    MongooseModule.forRootAsync({
      connectionName: 'service',
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    IamModule,
    BotModule,
    ProductModule,
    QRModule,
  ],
  controllers: [],
  providers: [{ provide: APP_INTERCEPTOR, useClass: HttpLoggerInterceptor }],
})
export class AppModule {}