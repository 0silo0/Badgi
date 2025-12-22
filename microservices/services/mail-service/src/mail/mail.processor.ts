import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { MailService } from './mail.service';

interface SendEmailEvent {
  type: 'WELCOME' | 'CONFIRMATION_CODE' | 'PASSWORD_RESET' | 'CUSTOM';
  email: string;
  userId: string;
  userName?: string;
  data: {
    code?: string;
    subject?: string;
    text?: string;
    html?: string;
    [key: string]: any;
  };
}

@Injectable()
export class MailProcessor implements OnModuleInit {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly mailService: MailService,
  ) {}

  async onModuleInit() {
    await this.rabbitMQService.consume('email-queue', this.handleMessage.bind(this));
    this.logger.log('Started listening to email-queue');
  }

  private async handleMessage(msg: any) {
    try {
      const event: SendEmailEvent = JSON.parse(msg.content.toString());
      await this.processEmailEvent(event);
      
      // Подтверждаем обработку сообщения
      this.rabbitMQService.ack(msg);
      this.logger.log(`Email processed: ${event.type} to ${event.email}`);
    } catch (error) {
      this.logger.error('Failed to process email message:', error);
      // Можно вернуть сообщение в очередь или отправить в dead-letter queue
    }
  }

  private async processEmailEvent(event: SendEmailEvent) {
    const { type, email, userId, userName, data } = event;
    
    switch (type) {
      case 'WELCOME':
        await this.mailService.sendWelcomeEmail(email, userName || 'Пользователь', userId);
        break;
        
      case 'CONFIRMATION_CODE':
        if (!data.code) throw new Error('Confirmation code is required');
        await this.mailService.sendConfirmationCode(email, data.code, userId);
        break;
        
      case 'PASSWORD_RESET':
        // TODO: Добавить логику для сброса пароля
        this.logger.log(`Password reset email would be sent to ${email}`);
        break;
        
      case 'CUSTOM':
        await this.mailService.sendMail({
          to: email,
          subject: data.subject || 'Уведомление от GoalPath',
          text: data.text,
          html: data.html,
          userId,
        });
        break;
        
      default:
        this.logger.warn(`Unknown email type: ${type}`);
    }
  }
}