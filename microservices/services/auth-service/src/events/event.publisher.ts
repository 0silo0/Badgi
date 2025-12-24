import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class EventPublisher {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async sendEmailEvent(event: {
    type: 'WELCOME' | 'CONFIRMATION_CODE' | 'PASSWORD_RESET' | 'PASSWORD_CHANGED_SUCCESSFULLY';
    email: string;
    userId?: string;
    userName?: string;
    data?: Record<string, any>;
  }) {
    await this.rabbitMQService.publishToQueue('email-queue', event);
  }
}