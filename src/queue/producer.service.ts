import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Room, User } from '@prisma/client';
import { ChannelWrapper } from 'amqp-connection-manager';

import { QueueProvider } from './queue.provider';

@Injectable()
export class ProducerService {
  private readonly logger = new Logger(ProducerService.name);
  private readonly queueName = this.configService.get<string>(
    'RABBITMQ_QUEUE_NAME',
  ) as string;

  constructor(
    private queueProvider: QueueProvider,
    private configService: ConfigService,
  ) {}

  async addToEmailQueue(user: User, room: Room) {
    const mail = {
      email: user.email,
      subject: 'Your Booking Confirmation',
      html: `
      <p>Hello ${user.name},</p>
      <p>Your booking for the room ${room.name} is confirmed.</p>
      <p>Enjoy your stay!</p>`,
    };

    const channel: ChannelWrapper = this.queueProvider.getChannel();

    try {
      await channel.sendToQueue(
        this.queueName,
        Buffer.from(JSON.stringify(mail)),
        { persistent: true },
      );
      this.logger.log('Email added to the queue successfully');
    } catch (error) {
      this.logger.error(`Error adding email to the queue: ${error.message}`);
      throw error;
    }
  }
}
