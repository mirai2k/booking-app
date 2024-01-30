import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MailingService } from './mailing.service';

describe('MailingService', () => {
  let service: MailingService;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailingService],
    }).compile();

    service = module.get<MailingService>(MailingService);
    loggerSpy = jest.spyOn(Logger.prototype, 'log');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send an email and log a message', async () => {
    const mail = {
      email: 'johny@nest.com',
      subject: 'Your Booking Confirmation',
      html: `
      <p>Hello John Doe,</p>
      <p>Your booking for the room Room #1 is confirmed.</p>
      <p>Enjoy your stay!</p>`,
    };

    await service.sendEmail(mail);

    expect(loggerSpy).toHaveBeenCalledWith('Message has been sent to user.');
    expect(loggerSpy).toHaveBeenCalledWith(expect.anything());
  });
});
