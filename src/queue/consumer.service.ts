import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel, Message } from 'amqplib';

import { MailingService } from '../mailing/mailing.service';
import { QueueProvider } from './queue.provider';

@Injectable()
export class ConsumerService implements OnModuleInit {
  private readonly logger = new Logger(ConsumerService.name);
  private readonly queueName = this.configService.get<string>(
    'RABBITMQ_QUEUE_NAME',
  ) as string;

  constructor(
    private mailingService: MailingService,
    private queueProvider: QueueProvider,
    private configService: ConfigService,
  ) {}

  public async onModuleInit() {
    const channel: ChannelWrapper = this.queueProvider.getChannel();

    channel.addSetup(async (channelInstance: ConfirmChannel) => {
      await channelInstance.consume(
        this.queueName,
        this.handleMessage.bind(this),
      );
    });

    this.logger.log('Consumer service started and listening for messages.');
  }

  private async handleMessage(message: Message | null) {
    if (message) {
      try {
        const content = JSON.parse(message.content.toString());
        this.logger.log('Consumer service has received a message');
        await this.mailingService.sendEmail(content);
        this.queueProvider.getChannel().ack(message);
      } catch (error) {
        this.logger.error(`Error processing message: ${error.message}`);
        this.queueProvider.getChannel().nack(message);
      }
    }
  }
}
