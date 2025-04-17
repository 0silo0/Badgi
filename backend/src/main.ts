import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const portStr = process.env.BACKEND_PORT || '4132';
  const port = parseInt(portStr, 10);

  app.setGlobalPrefix('api');

  await app.listen(port);
}
bootstrap();
