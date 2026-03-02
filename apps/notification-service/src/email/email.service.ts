import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { createLogger } from '@repo/logger';

const logger = createLogger('notification-service');

@Injectable()
export class EmailService {
  constructor(private readonly mailService: MailerService) {}
  async sendMail(from: string, to: string, subject: string, template: string): Promise<void> {
    await this.mailService.sendMail({
      from,
      to,
      subject,
      template,
    });
    logger.info({ to, subject }, 'Email sent successfully');
  }
}
