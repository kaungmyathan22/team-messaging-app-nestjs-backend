import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { EmailPayload } from './dto/email.payload';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}
  sendEmail(payload: EmailPayload) {
    return this._sendDevelopmentEmail(payload);
  }

  async _sendDevelopmentEmail({
    to,
    subject,
    template,
    context,
  }: EmailPayload) {
    try {
      await this.mailerService.sendMail({
        to,
        from: 'no-reply@idea.com',
        subject,
        template: `./${template}`,
        context,
      });
      console.info('Development email sent successfully.');
      return { success: true };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error sending email');
    }
  }

  _sendProductionEmail(payload: EmailPayload) {
    throw new NotImplementedException("Haven't confgiured yet!!");
  }
}
