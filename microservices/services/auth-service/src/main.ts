import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';

// Для работы с BigInt в JSON
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // CORS настройка для микросервиса
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:4000',
      'http://localhost:3001',
      'https://goal-path.ru',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    credentials: true,
    exposedHeaders: ['Authorization', 'Set-Cookie'],
  });

  // Глобальная валидация
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Глобальный префикс
  app.setGlobalPrefix('api/auth');

  // Prisma shutdown hooks
  const prismaService = app.get(PrismaService);
  //await prismaService.enableShutdownHooks(app);

  const port = process.env.AUTH_SERVICE_PORT || 3002;
  
  await app.listen(port);
  console.log(`Auth microservice is running on: http://localhost:${port}`);
}
bootstrap();