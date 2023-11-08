import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ProcessorType } from 'src/common/constants/process.constants';
import { QueueConstants } from 'src/common/constants/queue.constants';

@Processor(QueueConstants.emailQueue)
export class AuthEmailProcessor {
  @Process(ProcessorType.ForgotPassword)
  async handleSendForgotPasswordEmail(job: Job) {
    console.log('====================================');
    console.log(job);
    console.log('Hola');
    console.log('====================================');
    job.finished();
  }
}
