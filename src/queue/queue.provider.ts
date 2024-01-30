import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChannelWrapper, connect } from 'amqp-connection-manager';
import { Channel } from 'amqplib';

@Injectable()
export class QueueProvider {
  private readonly logger = new Logger(QueueProvider.name);
  private readonly connection: ChannelWrapper;
  private readonly queueName = this.configService.get<string>(
    'RABBITMQ_QUEUE_NAME',
  ) as string;
  private readonly url = this.configService.get<string>(
    'RABBITMQ_URL',
  ) as string;

  constructor(private configService: ConfigService) {
    this.connection = this.createConnection();
  }

  private createConnection(): ChannelWrapper {
    try {
      const connection = connect(this.url);

      const channelWrapper = connection.createChannel({
        setup: (channel: Channel) => {
          channel.assertQueue(this.queueName, { durable: true });
        },
      });

      return channelWrapper;
    } catch (error) {
      this.logger.error(`Error creating AMQP connection: ${error.message}`);
      throw error;
    }
  }

  public getChannel(): ChannelWrapper {
    return this.connection;
  }
}
