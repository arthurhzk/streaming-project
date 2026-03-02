import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfileRepository } from '@user-service/modules/profile/profile.repository';
import { RabbitmqService } from '@user-service/events/rabbitmq/rabbitmq.service';
import { EVENTS_EXCHANGE, ROUTING_KEYS } from '@user-service/events/events.constants';
import type { UpdateProfileDto } from '@user-service/modules/profile/dtos/update-profile.dto';
import { createLogger } from '@repo/logger';

const logger = createLogger('user-service');

export interface ProfileResponse {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarKey: string | null;
  bio: string | null;
  plan: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly rabbitmq: RabbitmqService,
  ) {}

  async getByUserId(userId: string): Promise<ProfileResponse> {
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.toResponse(profile);
  }

  async update(userId: string, dto: UpdateProfileDto): Promise<ProfileResponse> {
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const updated = await this.profileRepository.update(userId, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      bio: dto.bio,
    });

    return this.toResponse(updated);
  }

  async softDelete(userId: string): Promise<void> {
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    await this.profileRepository.softDelete(userId);

    await this.rabbitmq.publishMessage(EVENTS_EXCHANGE, ROUTING_KEYS.USER_DELETED, {
      userId: profile.userId,
      email: profile.email,
    });

    logger.info({ userId: profile.userId }, 'Profile soft deleted, user.deleted published');
  }

  private toResponse(profile: {
    userId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatarKey: string | null;
    bio: string | null;
    plan: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }): ProfileResponse {
    return {
      userId: profile.userId,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatarKey: profile.avatarKey,
      bio: profile.bio,
      plan: profile.plan,
      status: profile.status,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
