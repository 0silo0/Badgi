// Пример: gateway/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // API Gateway слушает на порту 3000 для HTTP-запросов от клиентов
  await app.listen(3000);
  console.log('API Gateway запущен на http://localhost:3000');
}
bootstrap();