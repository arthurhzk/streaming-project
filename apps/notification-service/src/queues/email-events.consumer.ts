import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitmqService } from '@notification-service/events/rabbitmq/rabbitmq.service';
import { EmailService } from '@notification-service/email/email.service';
import {
  EVENTS_EXCHANGE,
  QUEUES,
  ROUTING_KEYS,
} from '@notification-service/events/events.constants';
import { createLogger } from '@repo/logger';
import env from '@notification-service/config/env';
import fs from 'fs';
import path from 'path';

interface EmailEventPayload {
  email: string;
  subject: string;
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
      const template = fs.readFileSync(
        path.join(__dirname, '..', 'email', 'templates', payload.template, 'html.ejs'),
        'utf8',
      );
      const subject = fs.readFileSync(
        path.join(__dirname, '..', 'email', 'templates', payload.template, 'subject.ejs'),
        'utf8',
      );
      await this.emailService.sendMail(env.SMTP_USER as string, payload.email, subject, template);
      logger.info({ to: payload.email, subject: payload.subject }, 'Email sent successfully');
    } catch (error) {
      logger.error({ err: error, message }, 'Failed to send email');
      throw error;
    }
  }
}
