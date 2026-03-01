import { Module } from '@nestjs/common';
import { PrismaModule } from '@auth-service/prisma/prisma.module';
import { AuthModule } from '@auth-service/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
