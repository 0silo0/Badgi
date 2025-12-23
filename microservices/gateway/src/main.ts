import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(cookieParser());
  
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://goal-path.ru',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:4000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
  });
  
  app.setGlobalPrefix('');
  
  const port = process.env.GATEWAY_PORT || 4132;
  await app.listen(port);
  console.log(`🚀 API Gateway running on: http://localhost:${port}`);
}
bootstrap();