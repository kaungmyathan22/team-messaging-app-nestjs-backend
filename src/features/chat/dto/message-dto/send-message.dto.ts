import { IsNotEmpty } from 'class-validator';

export class SendMessagePayload {
  @IsNotEmpty()
  type: string;
  @IsNotEmpty()
  content: string;
}
