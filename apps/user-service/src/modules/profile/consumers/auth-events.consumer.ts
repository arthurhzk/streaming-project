import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitmqService } from '@user-service/events/rabbitmq/rabbitmq.service';
import { ProfileRepository } from '@user-service/modules/profile/profile.repository';
import { EVENTS_EXCHANGE, QUEUES, ROUTING_KEYS } from '@user-service/events/events.constants';
import { createLogger } from '@repo/logger';

interface UserCreatedPayload {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

const logger = createLogger('user-service');

@Injectable()
export class AuthEventsConsumer implements OnModuleInit {
  constructor(
    private readonly rabbitmq: RabbitmqService,
    private readonly profileRepository: ProfileRepository,
  ) {}

  async onModuleInit() {
    await this.rabbitmq.subscribeToQueue(
      QUEUES.USER_CREATED,
      EVENTS_EXCHANGE,
      ROUTING_KEYS.USER_CREATED,
      this.handleUserCreated.bind(this),
    );
  }

  private async handleUserCreated(message: unknown): Promise<void> {
    const payload = message as UserCreatedPayload;

    if (!payload.id || !payload.email) {
      logger.warn({ reason: 'Invalid payload' }, 'Skipping user.created event');
      return;
    }

    const existing = await this.profileRepository.findByUserId(payload.id);
    if (existing) {
      logger.info({ userId: payload.id }, 'Profile already exists, skipping');
      return;
    }

    await this.profileRepository
      .create({
        userId: payload.id,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
      })
      .catch((err) => {
        logger.error({ err }, 'Error creating profile from user.created event');
      });

    logger.info({ userId: payload.id }, 'Profile created from user.created event');
  }
}
