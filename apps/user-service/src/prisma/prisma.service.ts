import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@user-service/generated/prisma/client';
import { createLogger } from '@repo/logger';

const logger = createLogger('user-service');

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    logger.info('Prisma connected to the database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
