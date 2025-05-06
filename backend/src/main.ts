import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:4000',
      'http://localhost:3001',
      'http://176.123.160.42:3100',
      'http://176.123.160.42:3101',
      'https://176.123.160.42:3100',
      'https://176.123.160.42:3101',
    ],
    methods: ['GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true, // Позволяет отправлять cookies и авторизационные заголовки
    exposedHeaders: ['Authorization', 'Set-Cookie'],
  });

  app.useWebSocketAdapter(new IoAdapter(app));

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const portStr = process.env.BACKEND_PORT || '4132';
  const port = parseInt(portStr, 10);

  app.setGlobalPrefix('api');

  app.use(
    '/profile/avatar',
    express.json({ limit: '10mb' }),
    express.urlencoded({ extended: true, limit: '10mb' }),
  );

  await app.listen(port);
}
bootstrap();
