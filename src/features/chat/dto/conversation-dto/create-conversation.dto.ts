import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateGroupConversationPayload {
  @IsNumber(
    {},
    {
      each: true,
      message: 'participants must be array of number representing user id.',
    },
  )
  participants: number[];
  @IsNotEmpty()
  name: string;
}

export class CreateOneToOneConversationPayload {
  @IsNumber()
  @IsPositive()
  participant: number;
}
