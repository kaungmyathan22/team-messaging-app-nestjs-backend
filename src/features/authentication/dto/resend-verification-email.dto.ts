import { IsEmail } from 'class-validator';

export class ResendVerificationEmailPayload {
  @IsEmail()
  email: string;
}
