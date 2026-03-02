import { Module } from '@nestjs/common';
import { PrismaModule } from '@user-service/prisma/prisma.module';
import { ProfileModule } from '@user-service/modules/profile/profile.module';
import { HealthModule } from '@user-service/health/health.module';

@Module({
  imports: [PrismaModule, ProfileModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
