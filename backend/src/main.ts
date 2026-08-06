import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
