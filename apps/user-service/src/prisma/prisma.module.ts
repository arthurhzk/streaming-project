import { Module } from '@nestjs/common';
import { PrismaService } from '@user-service/prisma/prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
