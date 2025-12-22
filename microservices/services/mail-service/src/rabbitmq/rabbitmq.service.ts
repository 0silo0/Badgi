import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async connect() {
    try {
      const url = this.configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672');
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      
      // Объявляем очередь для email
      await this.channel.assertQueue('email-queue', { durable: true });
      
      console.log('Connected to RabbitMQ (mail-service)');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      // Можно добавить retry логику
    }
  }

  async consume(queue: string, callback: (msg: amqp.ConsumeMessage) => void) {
    if (!this.channel) {
      await this.connect();
    }
    
    await this.channel!.consume(queue, callback, { noAck: false });
  }

  ack(msg: amqp.ConsumeMessage) {
    this.channel!.ack(msg);
  }

  nack(msg: amqp.ConsumeMessage, requeue = false) {
    this.channel!.nack(msg, false, requeue);
  }

  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}