import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailProcessor } from './mail.processor';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    RabbitMQModule,
  ],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}