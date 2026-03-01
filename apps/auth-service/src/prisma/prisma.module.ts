import { Module } from '@nestjs/common';
import { PrismaService } from '@auth-service/prisma/prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
