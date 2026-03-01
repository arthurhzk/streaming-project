import { Module } from '@nestjs/common';
import { PrismaModule } from '@auth-service/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
