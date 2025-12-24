import { Module } from '@nestjs/common';
import { EventPublisher } from './event.publisher';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  providers: [EventPublisher],
  exports: [EventPublisher],
})
export class EventsModule {}