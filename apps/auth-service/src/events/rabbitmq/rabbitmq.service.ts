import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from '@repo/amqplib';
import env from '@auth-service/config/env';
import { createLogger } from '@repo/logger';

const logger = createLogger('rabbitmq');
@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private channelModel?: amqp.ChannelModel;
  private channel?: amqp.Channel;

  async onModuleInit() {
    this.channelModel = await amqp.connect(env.RABBITMQ_URL, {
      timeout: 5000,
    });
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
    if (this.channel) await this.channel.close();
    if (this.channelModel) await this.channelModel.close();
  }
  async publishMessage(exchange: string, routingKey: string, message: unknown): Promise<void> {
    try {
      if (!this.channel) {
        logger.warn('RabbitMQ channel not available, skipping message publish');

        return;
      }

      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      const messageBuffer = Buffer.from(JSON.stringify(message));

      const published = this.channel.publish(exchange, routingKey, messageBuffer, {
        persistent: true,
        timestamp: Date.now(),
        contentType: 'application/json',
      });

      logger.info(`Message published to ${exchange}:${routingKey}`);
      logger.debug(`Message content: ${JSON.stringify(message)}`);
      if (!published) {
        throw new Error('Failed to publish message to RabbitMQ');
      }
    } catch (error) {
      logger.error('Error publishing message to RabbitMQ:', error as never);
    }
  }
  async subscribeToQueue(
    queueName: string,
    exchange: string,
    routingKey: string,
    callback: (message: unknown) => Promise<void>,
  ): Promise<void> {
    try {
      if (!this.channel) {
        throw new Error('RabbitMQ channel not available');
      }

      await this.channel.assertExchange(exchange, 'topic', {
        durable: true,
      });

      const queue = await this.channel.assertQueue(queueName, {
        durable: true,
        arguments: {
          'x-message-ttl': 86400000,
          'x-max-length': 10000,
        },
      });

      await this.channel.bindQueue(queue.queue, exchange, routingKey);

      await this.channel.prefetch(1);
      await this.channel.consume(queue.queue, async (msg) => {
        if (msg) {
          try {
            const message: unknown = JSON.parse(msg.content.toString());
            logger.info(`Message received from queue: ${queueName}`);
            logger.info(`Message content: ${JSON.stringify(message)}`);
            await callback(message);

            this.channel?.ack(msg);

            logger.info(`Message processed succesfully from queue: ${queueName}`);
          } catch (error) {
            logger.error(`Error processing message:`, error as never);
            this.channel?.nack(msg, false, false);
          }
        }
      });

      logger.info(`Subscribed to queue: ${queueName} with routing key: ${routingKey}`);
    } catch (error) {
      logger.error(`Error subscribing to queue ${queueName}:`, error as never);
    }
  }
}
