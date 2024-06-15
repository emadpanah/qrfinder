import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { transports, format } from 'winston';
import { WinstonModule } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      level: 'info',
      format: format.combine(format.timestamp(), format.json()),
      transports: [
        new transports.Console(),
        new transports.File({
          filename: 'logs/app.log',
        }),
        new transports.File({
          filename: 'logs/app-error.log',
          level: 'error',
        }),
      ],
    }),
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const configService = app.get(ConfigService);
    // Enable CORS
    app.enableCors({
      origin: configService.get<string>('CORS_ORIGIN'),
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
   });

  await app.listen(process.env.PORT);
}
bootstrap();