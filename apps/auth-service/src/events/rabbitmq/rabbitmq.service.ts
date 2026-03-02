import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from '@repo/amqplib';
import env from '@auth-service/config/env';
import { createLogger } from '@repo/logger';

const logger = createLogger('rabbitmq');
@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private channelModel!: amqp.ChannelModel;
  private channel!: amqp.Channel;

  async onModuleInit() {
    this.channelModel = await amqp.connect(env.RABBITMQ_URL);
    this.channel = await this.channelModel.createChannel();
    logger.info('Connected to RabbitMQ successfully');
    this.channelModel.on('error', (err) => {
      logger.error('RabbitMQ connection error:', err);
    });
    this.channelModel.on('close', () => {
      logger.warn('RabbitMQ connection closed');
    });
    this.channelModel.on('blocked', (reason) => {
      logger.warn('RabbitMQ connection blocked:', reason);
    });
    this.channelModel.on('unblocked', () => {
      logger.info('RabbitMQ connection unblocked');
    });
  }

  async onModuleDestroy() {
    await this.channel.close();
    await this.channelModel.close();
  }
}
