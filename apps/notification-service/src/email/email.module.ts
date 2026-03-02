import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import env from '@notification-service/config/env';
import { EmailService } from '@notification-service/email/email.service';
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      },
    }),
  ],
  controllers: [],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
