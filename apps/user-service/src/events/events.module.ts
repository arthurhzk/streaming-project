import { Module } from '@nestjs/common';
import { RabbitmqService } from '@user-service/events/rabbitmq/rabbitmq.service';

@Module({
  imports: [],
  providers: [RabbitmqService],
  exports: [RabbitmqService],
})
export class EventsModule {}
