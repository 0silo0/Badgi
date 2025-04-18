import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Разрешенные заголовки
    credentials: true, // Позволяет отправлять cookies и авторизационные заголовки
  });

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  app.useGlobalGuards(
    new JwtAuthGuard(
      app.get(JwtService),
      app.get(Reflector),
      app.get('REDIS_CLIENT'),
    ),
  );

  const portStr = process.env.BACKEND_PORT || '4132';
  const port = parseInt(portStr, 10);

  app.setGlobalPrefix('api');

  await app.listen(port);
}
bootstrap();
