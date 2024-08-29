import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { transports, format } from 'winston';
import { WinstonModule } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';
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

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.use(cookieParser());

  // Apply CSRF protection middleware after cookieParser
  // app.use(csurf({ cookie: { key: 'XSRF-TOKEN' } }));

  // // app.use((req, res, next) => {
  // //   const token = req.csrfToken();
  // //   console.log("Generated CSRF Token:", token);  // Log the token
  // //   res.cookie('XSRF-TOKEN', token);
  // //   next();
  // // });

  // app.use((req, res, next) => {
  //   const token = req.csrfToken();
  //   console.log("Generated CSRF Token:", token);  // Log the generated token
  //   res.cookie('XSRF-TOKEN', token, {
  //     httpOnly: false, // Make sure it's not HttpOnly so that it can be read by client-side JavaScript
  //     secure: process.env.NODE_ENV === 'production', // Ensure secure in production
  //     sameSite: 'Lax', // Adjust this according to your needs
  //   });
  //   next();
  // });

  // app.use((req, res, next) => {
  //   console.log("Headers in Request:", req.headers); // Log all headers
  //   console.log("Cookies in Request:", req.cookies); // Log all cookies
  //   console.log("CSRF Token in Request Header:", req.get('X-CSRF-TOKEN')); // Log the CSRF token in the header
  //   next();
  // });
  

  await app.listen(process.env.PORT);
}

bootstrap();


// import { NestFactory } from '@nestjs/core';
// import { ValidationPipe } from '@nestjs/common';
// import { transports, format } from 'winston';
// import { WinstonModule } from 'nest-winston';
// import { ConfigService } from '@nestjs/config';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule, {
//     logger: WinstonModule.createLogger({
//       level: 'info',
//       format: format.combine(format.timestamp(), format.json()),
//       transports: [
//         new transports.Console(),
//         new transports.File({
//           filename: 'logs/app.log',
//         }),
//         new transports.File({
//           filename: 'logs/app-error.log',
//           level: 'error',
//         }),
//       ],
//     }),
//   });

//   app.useGlobalPipes(new ValidationPipe({ transform: true }));

//   const configService = app.get(ConfigService);
//     // Enable CORS
//     app.enableCors({
//       origin: configService.get<string>('CORS_ORIGIN'),
//       methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//       credentials: true,
//    });

//   await app.listen(process.env.PORT);
// }
// bootstrap();