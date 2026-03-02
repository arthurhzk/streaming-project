import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitmqService } from '@notification-service/events/rabbitmq/rabbitmq.service';
import { EmailService } from '@notification-service/email/email.service';
import {
  EVENTS_EXCHANGE,
  QUEUES,
  ROUTING_KEYS,
} from '@notification-service/events/events.constants';
import { createLogger } from '@repo/logger';

interface EmailEventPayload {
  to: string;
  subject: string;
  text: string;
  context: Record<string, unknown>;
  template: string;
  from: string;
}

const logger = createLogger('notification-service');

@Injectable()
export class EmailEventsConsumer implements OnModuleInit {
  constructor(
    private readonly rabbitmq: RabbitmqService,
    private readonly emailService: EmailService,
  ) {}

  async onModuleInit() {
    await this.rabbitmq.subscribeToQueue(
      QUEUES.WELCOME_EMAIL,
      EVENTS_EXCHANGE,
      ROUTING_KEYS.WELCOME_EMAIL,
      this.sendMail.bind(this),
    );
  }

  private async sendMail(message: unknown): Promise<void> {
    try {
      const payload = message as EmailEventPayload;
      await this.emailService.sendMail(
        payload.from,
        payload.to,
        payload.subject,
        payload.text,
        payload.context,
        payload.template,
      );
      logger.info({ to: payload.to, subject: payload.subject }, 'Email sent successfully');
    } catch (error) {
      logger.error({ err: error, message }, 'Failed to send email');
      throw error;
    }
  }
}
