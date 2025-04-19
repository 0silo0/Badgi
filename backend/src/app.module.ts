import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { S3Module } from './s3/s3.module';
import { FilesController } from './files/files.controller';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [RedisModule, PrismaModule, AuthModule, S3Module, MailModule],
  controllers: [AppController, FilesController],
  providers: [AppService],
})
export class AppModule {}
