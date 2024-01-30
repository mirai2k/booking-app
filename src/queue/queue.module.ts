import { Module } from '@nestjs/common';

import { MailingService } from '../mailing/mailing.service';
import { ConsumerService } from './consumer.service';
import { ProducerService } from './producer.service';
import { QueueProvider } from './queue.provider';

@Module({
  providers: [ProducerService, ConsumerService, MailingService, QueueProvider],
  exports: [ProducerService, QueueProvider],
})
export class QueueModule {}
