import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ProducerService } from './producer.service';
import { QueueProvider } from './queue.provider';

describe('ProducerService', () => {
  let service: ProducerService;
  let queueProviderMock: jest.Mocked<QueueProvider>;
  let configServiceMock: { get: jest.Mock };

  beforeEach(async () => {
    queueProviderMock = {
      getChannel: jest.fn().mockReturnValue({ sendToQueue: jest.fn() }),
    } as any;
    configServiceMock = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'RABBITMQ_QUEUE_NAME') return 'email_queue';
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProducerService,
        { provide: QueueProvider, useValue: queueProviderMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<ProducerService>(ProducerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
