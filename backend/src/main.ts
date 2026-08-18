import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalFilters(new AllExceptionsFilter());

  const expressApp = app.getHttpAdapter().getInstance();

  expressApp.set('query parser', 'extended');

  expressApp.set('trust proxy', 1);

  app.use(
    helmet({
      // Razorpay's checkout script + your own frontend origins need to load — default CSP would block them
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          scriptSrc: [
            `'self'`,
            `'unsafe-inline'`,
            'https://checkout.razorpay.com',
          ],
          frameSrc: [
            'https://api.razorpay.com',
            'https://checkout.razorpay.com',
          ],
          connectSrc: [`'self'`, 'https://api.razorpay.com'],
          imgSrc: [`'self'`, 'data:', 'https:'], // allows S3/MinIO-hosted images
        },
      },
      crossOriginEmbedderPolicy: false, // Razorpay's iframe checkout needs this relaxed
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // this is the missing piece — actually applies @Type() conversions
      whitelist: true, // bonus: strips any properties not declared in the DTO
    }),
  );

  app.use(
    express.json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf; // preserve raw bytes for webhook signature checks
      },
    }),
  );

  // Enable CORS for your Next.js client
  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3002'], // client + frontend-client
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
