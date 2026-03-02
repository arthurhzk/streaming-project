import { Module } from '@nestjs/common';
import { PrismaModule } from '@user-service/prisma/prisma.module';
import { EventsModule } from '@user-service/events/events.module';
import { ProfileController } from '@user-service/modules/profile/profile.controller';
import { ProfileService } from '@user-service/modules/profile/profile.service';
import { ProfileRepository } from '@user-service/modules/profile/profile.repository';
import { AuthEventsConsumer } from '@user-service/modules/profile/consumers/auth-events.consumer';

@Module({
  imports: [PrismaModule, EventsModule],
  controllers: [ProfileController],
  providers: [ProfileRepository, ProfileService, AuthEventsConsumer],
  exports: [ProfileService],
})
export class ProfileModule {}
