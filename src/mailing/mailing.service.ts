import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailingService {
  private readonly logger = new Logger(MailingService.name);

  async sendEmail(message: any) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    this.logger.log('Message has been sent to user.');
    this.logger.log(message);
  }
}
