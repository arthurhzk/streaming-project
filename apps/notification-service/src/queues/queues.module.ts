import { Module } from '@nestjs/common';
import { EmailEventsConsumer } from '@notification-service/queues/email-events.consumer';
import { EventsModule } from '@notification-service/events/events.module';
import { EmailModule } from '@notification-service/email/email.module';

@Module({
  imports: [EventsModule, EmailModule],
  providers: [EmailEventsConsumer],
})
export class QueuesModule {}
