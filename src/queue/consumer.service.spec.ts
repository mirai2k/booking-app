import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { MailingService } from '../mailing/mailing.service';
import { ConsumerService } from './consumer.service';
import { QueueProvider } from './queue.provider';

describe('ConsumerService', () => {
  let service: ConsumerService;
  let mailingServiceMock: jest.Mocked<MailingService>;
  let queueProviderMock: jest.Mocked<QueueProvider>;
  let configServiceMock: { get: jest.Mock };

  beforeEach(async () => {
    mailingServiceMock = { sendEmail: jest.fn() } as any;
    queueProviderMock = {
      getChannel: jest.fn().mockReturnValue({
        addSetup: jest.fn((callback) => callback({ consume: jest.fn() })),
        ack: jest.fn(),
        nack: jest.fn(),
      }),
    } as any;
    configServiceMock = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'RABBITMQ_QUEUE_NAME') return 'email_queue';
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsumerService,
        { provide: MailingService, useValue: mailingServiceMock },
        { provide: QueueProvider, useValue: queueProviderMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<ConsumerService>(ConsumerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should consume messages from the queue', async () => {
    await service.onModuleInit();
    expect(queueProviderMock.getChannel().addSetup).toHaveBeenCalled();
  });

  it('should handle messages correctly', async () => {
    const testMessage = {
      content: Buffer.from(
        JSON.stringify({ to: 'test@example.com', body: 'Hello!' }),
      ),
    };

    await service['handleMessage'](testMessage as any);

    expect(mailingServiceMock.sendEmail).toHaveBeenCalledWith({
      to: 'test@example.com',
      body: 'Hello!',
    });
    expect(queueProviderMock.getChannel().ack).toHaveBeenCalledWith(
      testMessage,
    );
  });
});
