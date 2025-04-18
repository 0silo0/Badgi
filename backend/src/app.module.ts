import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { S3Module } from './s3/s3.module';
import { FilesController } from './files/files.controller';

@Module({
  imports: [RedisModule, PrismaModule, AuthModule, S3Module],
  controllers: [AppController, FilesController],
  providers: [AppService],
})
export class AppModule {}
