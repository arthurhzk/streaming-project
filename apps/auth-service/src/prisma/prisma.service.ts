import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@auth-service/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import env from '@auth-service/config/env';
import { createLogger } from '@repo/logger';

const logger = createLogger('auth-service');

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: env.DATABASE_URL,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    logger.info('Prisma connected to the database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
