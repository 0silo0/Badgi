import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  
  app.enableCors({
    origin: ['http://localhost:3000', 'https://goal-path.ru'],
    credentials: true,
  });
  
  app.setGlobalPrefix('api/mail');
  
  const port = process.env.MAIL_SERVICE_PORT || 3003;
  await app.listen(port);
  console.log(`Mail service running on: http://localhost:${port}`);
}
bootstrap();