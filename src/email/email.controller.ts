import { Controller, Get } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}
  @Get('')
  sendEmail() {
    return this.emailService.sendEmail({
      to: 'test@gmail.com',
      subject: 'Email Confirmation',
      template: 'confirmation',
      context: {
        confirmationLink: 'https://kangmyathan.com/asdjflkjd/asdjlkjasdf',
      },
    });
  }
}
