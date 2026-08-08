import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
