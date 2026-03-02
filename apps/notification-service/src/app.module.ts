import { Module } from '@nestjs/common';
import { HealthModule } from '@notification-service/health/health.module';
import { EventsModule } from '@notification-service/events/events.module';
import { EmailModule } from '@notification-service/email/email.module';
import { QueuesModule } from '@notification-service/queues/queues.module';

@Module({
  imports: [HealthModule, EventsModule, EmailModule, QueuesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
