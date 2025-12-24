import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private connection: amqp.ChannelModel;
  private channel: amqp.Channel;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async connect() {
    try {
      const url = this.configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672');
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      
      // Объявляем очередь для email событий
      await this.channel.assertQueue('email-queue', { durable: true });
      
      console.log('Connected to RabbitMQ (auth-service)');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      // В режиме разработки можно продолжить без RabbitMQ
    }
  }

  async publishToQueue(queue: string, message: any) {
    if (!this.channel) {
      await this.connect();
    }
    
    try {
      this.channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );
      console.log(`Event published to ${queue}:`, message.type);
    } catch (error) {
      console.error('Failed to publish event:', error);
      // В режиме разработки просто логируем ошибку
    }
  }

  async onModuleDestroy() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
}